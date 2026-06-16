-- PostgreSQL Database Schema
-- Project: AI Customer Greeting Personalizer
-- Company: Manivtha Tours & Travels
-- -------------------------------------------------------------

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    subject_pattern VARCHAR(255),
    body_pattern TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'English',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. GREETINGS TABLE
CREATE TABLE IF NOT EXISTS greetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    travel_date DATE NOT NULL,
    booking_history VARCHAR(100),
    travel_type VARCHAR(100),
    language VARCHAR(50) DEFAULT 'English',
    category VARCHAR(50) DEFAULT 'Standard',
    special_notes TEXT,
    generated_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'shared')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    greeting_id UUID REFERENCES greetings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_greetings_user ON greetings(user_id);
CREATE INDEX IF NOT EXISTS idx_greetings_date ON greetings(travel_date);
CREATE INDEX IF NOT EXISTS idx_greetings_created ON greetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_greeting ON feedback(greeting_id);
CREATE INDEX IF NOT EXISTS idx_templates_language ON templates(language);

-- 7. SEED INITIAL SAMPLE DATA

-- Seed default users
-- Note: password_hash for admin/agent is 'password123' hashed with bcrypt: $2a$10$pXI8WOQQ3HSbX0tufILAqeeZRRTVZhvHB8YqmV6XKPppIfHc2840S
INSERT INTO users (id, username, password_hash, role, email) VALUES
('b3014a5c-59bc-47cb-8c9f-d31e9c5a1a1f', 'admin', '$2a$10$pXI8WOQQ3HSbX0tufILAqeeZRRTVZhvHB8YqmV6XKPppIfHc2840S', 'admin', 'admin@manivthatravels.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, password_hash, role, email) VALUES
('d2903b4b-48ab-46cb-8b8f-c20d8c4a0a0f', 'agent', '$2a$10$pXI8WOQQ3HSbX0tufILAqeeZRRTVZhvHB8YqmV6XKPppIfHc2840S', 'staff', 'agent@manivthatravels.com')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, password_hash, role, email) VALUES
('a1014a5c-59bc-47cb-8c9f-d31e9c5a1a1f', 'shanmukh.k', '$2a$10$tzKStnI6R0CSCIdwSqdAA.EeusF8P4ZbfPvykdJfI0Ov1GdB50U6m', 'admin', 'shanmukh.k@manivthatravels.com')
ON CONFLICT (username) DO NOTHING;

-- Seed default templates
INSERT INTO templates (id, title, description, subject_pattern, body_pattern, language) VALUES
('t1010101-1111-2222-3333-444455556666', 'Standard pre-Trip Greeting', 'General template for all travel types', 'Greeting for {{CustomerName}}', 'Hello {{CustomerName}},\n\nThank you for choosing Manivtha Tours & Travels for your upcoming journey to {{Destination}}.\n\nWe hope you have an incredible travel experience. Let us know if you need any assistance.\n\nRegards,\nManivtha Tours & Travels', 'English')
ON CONFLICT DO NOTHING;

INSERT INTO templates (id, title, description, subject_pattern, body_pattern, language) VALUES
('t2020202-2222-3333-4444-555566667777', 'VIP spiritual Journey', 'Tailored spiritual tone for holy cities', 'Spiritual greetings for {{CustomerName}}', 'Namaste {{CustomerName}},\n\nWe are honored to assist in facilitating your sacred journey to {{Destination}}.\n\nAs one of our returning customers, we have arranged the primary details to ensure absolute peace of mind during your spiritual tour.\n\nMay your pilgrimage be deeply rewarding.\n\nRegards,\nManivtha Tours & Travels', 'English')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- OPTIMIZATION STRATEGY DETAILS
-- -------------------------------------------------------------
-- 1. Connection Pooling: Set pool sizes between 10-20 connections to limit database initialization latencies.
-- 2. VACUUM & ANALYZE: Schedule weekly autovacuum cron jobs to maintain physical indexes and reclaim dead space.
-- 3. Query Partitioning: For scalability past 1,000,000 greetings, partition the 'greetings' table by range of 'created_at'.
