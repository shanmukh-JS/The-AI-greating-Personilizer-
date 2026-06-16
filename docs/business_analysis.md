# Phase 1: Business Analysis Report
## AI Customer Greeting Personalizer - Manivtha Tours & Travels

---

### 1. Executive Summary
This document outlines the business case, requirements, and scope for the **AI Customer Greeting Personalizer**, an AI-powered SaaS application designed for **Manivtha Tours & Travels**. The travel and transportation industry relies heavily on customer satisfaction, brand recall, and continuous engagement. Currently, customer interactions are manual, causing processing delays, messaging inconsistencies, and a lack of analytical oversight. By leveraging LLMs (specifically Google Gemini/OpenAI GPT-4o), this system will automate the creation of personalized, context-aware greeting messages for clients based on their destinations, travel histories, languages, and booking categories.

---

### 2. Company Introduction
**Manivtha Tours & Travels** is a premier travel agency specializing in domestic and international holiday packages, corporate travel management, family tours, and customized spiritual journeys. With thousands of annual travelers, the agency prides itself on personalized customer service. To transition from a manual workflow to an automated, digital-first model, the company is sponsoring this project as a 26-day internship initiative.

---

### 3. Industry Overview
The travel and hospitality sector is undergoing rapid digital transformation. Customers expect high-touch, hyper-personalized communication. Standard generic newsletters or robotic SMS notifications no longer drive engagement. Modern travel operators utilize AI to provide tailored travel itineraries, immediate updates, and personalized greetings that align with the cultural context of destinations.

---

### 4. Existing System Analysis
The current flow for sending customer greetings before travel at Manivtha Tours & Travels is entirely manual:
1. When a booking is finalized, a desk staff member extracts customer details (name, travel date, destination, travel group type) from paper logs or Excel files.
2. The staff member opens WhatsApp Web or a mobile device and manually drafts a text message.
3. If the customer prefers a local language (e.g., Telugu, Hindi, Tamil) or has special notes (e.g., senior citizens, wheel-chair assistance, infant on board), the agent translates or writes the response from scratch.
4. The message is sent manually via a personal WhatsApp account.

---

### 5. Problems in Existing System
* **Manual Bottleneck**: Sending greetings to 100+ customers daily takes 3–4 hours of manual labor.
* **Lack of Personalization**: Because of time constraints, staff copy-paste the same template, leading to generic messages.
* **Language Barriers**: The staff cannot easily personalize greetings in multiple languages.
* **No Database/History**: Once a message is sent, there is no centralized database tracking what was sent, when it was sent, or which template was used.
* **Inconsistent Tone**: Different staff members draft messages with varying levels of quality, grammar, and brand tone.
* **No Analytics**: Management has zero visibility into feedback, customer satisfaction, or message volume metrics.

---

### 6. Proposed Solution
The proposed solution is the **AI Customer Greeting Personalizer**, a secure SaaS web portal. It features:
* **AI Personalization Engine**: Fully customized messages using generative AI that incorporate travel date, destination, booking history, travel type (family, solo, corporate), and preferred language.
* **Template Library**: Pre-configured templates (e.g., spiritual tours to Tirupati, adventure tours, corporate bookings) that guide the AI tone.
* **Greeting Workspace**: An editor where staff can generate, edit, regenerate, copy, download (TXT/PDF), and share (direct WhatsApp link API) the greetings.
* **History Log**: A searchable log of all generated greetings, staff actions, and sharing statuses.
* **Feedback loops**: Storing star-ratings and textual feedback on AI performance to continuously refine prompts.
* **Analytics Dashboard**: Live charts displaying monthly/weekly greetings generated, popular destinations, template distribution, and average ratings.

---

### 7. Benefits of Proposed System
* **Time Savings**: Reduces greeting preparation time from 10 minutes per customer to under 10 seconds.
* **Brand Consistency**: System prompts ensure a polite, welcoming, and standardized brand voice.
* **Hyper-Personalization**: Incorporates loyalty status, booking histories, and travel context to make customers feel valued.
* **Improved Customer Retention**: Custom, high-touch messages improve initial impressions, encouraging repeat business.
* **Operational Control**: Provides management with clear logs and audit records of employee communication activities.

---

### 8. Scope of Project
The scope of this project is to build and deploy the complete application stack (frontend, backend, database schema, and documentation). It includes:
* Multi-role user authentication (Staff, Admin).
* Greeting generator dashboard with custom input fields.
* Response management workspace (Copy, Share, Download, Edit).
* Feedback collection module (1-5 Star rating and comments).
* CRUD interfaces for greeting templates.
* Interactive analytics charts.
* Complete university-grade documentation, testing suites, and internship records.

---

### 9. Objectives
* **A1**: Establish an automated greeting workflow requiring minimal manual inputs.
* **A2**: Integrate standard generative AI models to draft context-appropriate travel greetings in under 3 seconds.
* **A3**: Build a modern, visual design system with high accessibility, responsiveness, and premium styling.
* **A4**: Deliver a robust Node.js backend following REST standards and SOLID principles.
* **A5**: Provide database persistence and transaction records with optimized indexes.
* **A6**: Compile all internship requirements (logbook, reviews, final report) to secure academic compliance.

---

### 10. Problem Statement
"To design and develop an AI-Powered Customer Greeting Personalizer SaaS web application for Manivtha Tours & Travels to replace manual, repetitive, and time-consuming customer communication workflows with personalized, multi-lingual, and trackable greetings generated dynamically by GenAI, supported by a scalable database registry and a dashboard for performance analytics."

---

### 11. Abstract
The "AI Customer Greeting Personalizer" is a full stack web-based SaaS platform built for Manivtha Tours & Travels. It utilizes a React-based interactive user interface styled with Tailwind CSS, backed by a secure Node.js + Express API server and a PostgreSQL database schema. The application connects to Google Gemini/OpenAI API through structured prompt templates to process user details (name, destination, category, special requirements, travel date) and output personalized greeting drafts. Staff can edit the outputs, copy them, export them to local documents, or share them via WhatsApp. Features include template management, usage analytics, history logging, and role-based feedback mechanisms. Testing validates the correctness of backend validation rules, database query execution, and AI prompt resilience.

---

### 12. Functional Requirements
* **FR-01: User Authentication**: Users must be able to log in securely with username and password, with sessions managed via JSON Web Tokens (JWT).
* **FR-02: Input Processing**: The generator must accept:
  - Customer Name (string, required)
  - Destination (string, required)
  - Travel Date (date, required)
  - Booking History (string/select, e.g., "1st Trip", "3 Previous Trips")
  - Travel Type (select: Family, Solo, Honeymoon, Corporate, Group)
  - Preferred Language (select: English, Telugu, Hindi, Tamil)
  - Customer Category (select: Standard, VIP, Premium)
  - Special Notes (textarea, optional)
* **FR-03: AI Response Generation**: System must send the input fields along with selected template settings to the GenAI SDK, returning a customized travel greeting.
* **FR-04: Edit and Regenerate**: Staff must be able to manually refine the text or click "Regenerate" to obtain a new variation.
* **FR-05: Export & Share**: Staff must be able to click "Copy to Clipboard", "Download as Text File", and "Send via WhatsApp" (creates a WhatsApp web query URL containing the text).
* **FR-06: Feedback Registry**: Users can rate greetings (1 to 5 stars) and record logs explaining any defects.
* **FR-07: Template CRUD**: Admins and staff can create, read, update, and delete greeting templates with placeholders (e.g., `{{CustomerName}}`, `{{Destination}}`).
* **FR-08: Usage History**: The system must save every generation transaction, showing date, inputs, generated text, user account, and rating.
* **FR-09: Analytics Dashboard**: Display charts for total greetings, daily usage curves, ratings distribution, and top destinations.

---

### 13. Non-Functional Requirements
* **NFR-01: Performance**: Greeting generations must complete in under 4 seconds under normal API load conditions.
* **NFR-02: Security**: Sensitive user credentials must be stored using bcrypt password hashing. All API routes (except Login) must require a valid JWT header.
* **NFR-03: Scalability**: The database must utilize indexing on search parameters (`user_id`, `created_at`, `destination`) to sustain thousands of records without degradation.
* **NFR-04: Usability**: The UI must be fully responsive (mobile, tablet, desktop) and meet WCAG AA contrast guidelines.
* **NFR-05: Availability**: The SaaS application should target 99.9% uptime, with graceful error handling and fallbacks if the GenAI API experiences a service outage.
* **NFR-06: Reliability**: Input validators must sanitize strings to protect against SQL Injection and Cross-Site Scripting (XSS).

---

### 14. User Stories
* **US-01 (As a Booking Staff member)**: I want to input customer details and generate a personalized message in under 5 seconds so that I can send it to the client before they travel.
* **US-02 (As a Booking Staff member)**: I want to choose the customer's preferred language (e.g., Telugu) so that they feel a local connect.
* **US-03 (As an Agency Manager)**: I want to see a chart of all messages generated by my employees this week to monitor performance.
* **US-04 (As a System Administrator)**: I want to edit greeting templates to keep up with seasonal travel offers.
* **US-05 (As a Staff member)**: I want to click one button to open WhatsApp Web preloaded with the greeting text to save copy-pasting effort.

---

### 15. Use Cases

```
+--------------------------------------------------------------+
|                    USE CASE DIAGRAM SYSTEM BOUNDARY          |
|                                                              |
|   +------------------+          +------------------------+   |
|   |                  |          |                        |   |
|   |  Booking Staff   |          |     System Admin       |   |
|   |                  |          |                        |   |
|   +--------+---------+          +-----------+------------+   |
|            |                                |                |
|            |                                |                |
|            +-------> [ Login Portal ] <-----+                |
|            |                                |                |
|            +-------> [ Input Details ]      |                |
|            |                                |                |
|            +-------> [ Gen AI Greeting ]   |                |
|            |                                |                |
|            +-------> [ Share/Export ]       |                |
|            |                                |                |
|            +-------> [ Rate & Feedback ]    |                |
|            |                                |                |
|            |                                +--> [ CRUD Template ]
|            |                                |                |
|            +-------> [ View History ] <-----+                |
|                                             |                |
|                                             +--> [ View Analytics ]
+--------------------------------------------------------------+
```

* **UC-01: Generate Greeting**:
  - **Primary Actor**: Booking Staff
  - **Preconditions**: Staff logged in.
  - **Main Flow**: Staff inputs details, selects template, clicks "Generate". System requests LLM response, displays it.
  - **Postconditions**: Greeting logged, status set to "Draft".
* **UC-02: Export and Share**:
  - **Primary Actor**: Booking Staff
  - **Preconditions**: Greeting generated.
  - **Main Flow**: Staff reviews, modifies text, clicks "Share to WhatsApp". System opens a browser redirecting to WhatsApp Web with encoded text.
  - **Postconditions**: Logs WhatsApp sharing activity in historical audit logs.

---

### 16. Assumptions
* Users have access to a stable internet connection for accessing the cloud web portal.
* The Google Gemini API / OpenAI API is active and functional.
* Company staff are trained to operate modern web browsers and have access to WhatsApp Web accounts on their desktop devices.

---

### 17. Constraints
* The complete implementation must be finished within the 26-day duration of the internship project.
* The system is restricted to web browsers (fully responsive layout) and will not include separate native mobile applications.
* Prompt output lengths are restricted to prevent unnecessary API token consumption.

---

### 18. Success Metrics
* **Time to Productivity**: Zero days training for desk staff due to intuitive UI layout.
* **Operational Performance**: Time spent creating pre-trip greetings reduced by 90%.
* **Customer Delight**: Customer response/acknowledgment rate increased by 25% due to personalization.
* **LLM Accuracy**: Less than 1% rate of AI failures or "hallucinations" reported in feedback logs.
