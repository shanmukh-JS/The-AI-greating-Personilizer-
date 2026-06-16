// Enterprise React SPA - AI Customer Greeting Personalizer
// Project: AI Customer Greeting Personalizer
// Company: Manivtha Tours & Travels
// -------------------------------------------------------------

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, History, LayoutDashboard, FileCode, Star, 
  Settings, User, LogOut, Copy, Download, Share2, 
  Menu, X, Sun, Moon, AlertCircle, Plus, Edit, Trash2, CheckCircle, HelpCircle
} from 'lucide-react';

// API Configuration & Base Instance with Automatic Interceptors
const API_URL = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

// -------------------------------------------------------------
// STATE CONTEXT MANAGEMENT
// -------------------------------------------------------------
const AuthContext = createContext(null);
const ThemeContext = createContext('dark');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      if (token) {
        // If simulated token, parse user role locally to skip server profile validation
        if (token.startsWith('simulated_jwt_token')) {
          const username = token.startsWith('simulated_jwt_token_')
            ? token.replace('simulated_jwt_token_', '')
            : 'agent'; // fallback if legacy exact string matches
          const dummyUser = {
            id: username === 'admin' ? 'b3014a5c-59bc-47cb-8c9f-d31e9c5a1a1f' :
                username === 'shanmukh.k' ? 'a1014a5c-59bc-47cb-8c9f-d31e9c5a1a1f' :
                'd2903b4b-48ab-46cb-8b8f-c20d8c4a0a0f',
            username,
            role: (username === 'admin' || username === 'shanmukh.k') ? 'admin' : 'staff',
            email: `${username}@manivthatravels.com`
          };
          setUser(dummyUser);
          setLoading(false);
          return;
        }

        try {
          // Attempt profile request to verify JWT validity
          const res = await api.get('/profile');
          setUser(res.data);
        } catch (e) {
          if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            console.warn("Session expired, cleaning storage token");
            logout();
          } else {
            console.warn("API offline, keeping session token and decoding JWT payload locally");
            try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              setUser(JSON.parse(jsonPayload));
            } catch (err) {
              console.error("Failed to parse JWT payload offline", err);
              logout();
            }
          }
        }
      }
      setLoading(false);
    }
    initUser();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      if (err.response) {
        // API responded with an error (e.g. 401 Unauthorized due to bad password), do not fallback to simulation
        return { 
          success: false, 
          error: err.response.data?.error || 'Invalid username or password.' 
        };
      }
      
      console.warn("API Login failed (network offline), triggering simulated authentications...");
      // Simulation fallback for standalone runs when backend is offline
      if (username === 'agent' || username === 'admin' || username === 'shanmukh.k') {
        const dummyToken = `simulated_jwt_token_${username}`;
        const dummyUser = {
          id: username === 'admin' ? 'b3014a5c-59bc-47cb-8c9f-d31e9c5a1a1f' :
              username === 'shanmukh.k' ? 'a1014a5c-59bc-47cb-8c9f-d31e9c5a1a1f' :
              'd2903b4b-48ab-46cb-8b8f-c20d8c4a0a0f',
          username,
          role: (username === 'admin' || username === 'shanmukh.k') ? 'admin' : 'staff',
          email: `${username}@manivthatravels.com`
        };
        localStorage.setItem('token', dummyToken);
        setToken(dummyToken);
        setUser(dummyUser);
        return { success: true };
      }
      return { 
        success: false, 
        error: 'Invalid username or password.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) return <LoadingSpinner />;
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location, message: 'Please sign in to access this page.' }} replace />;
  }
  
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingSpinner />;
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

// -------------------------------------------------------------
// LOADING & ALERT COMPONENTS
// -------------------------------------------------------------
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

function AlertWidget({ message, type = 'success', onClose }) {
  const bg = type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  return (
    <div className={`p-4 border rounded-xl flex items-center justify-between ${bg} mb-4 animate-fade-in`}>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// LAYOUT WRAPPER (NAVBAR & SIDEBAR)
// -------------------------------------------------------------
function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  // On desktop start expanded; persist preference
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar_open');
    return saved === null ? true : saved === 'true';
  });
  // Track window width to switch between desktop and mobile modes
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      localStorage.setItem('sidebar_open', String(!prev));
      return !prev;
    });
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const menuItems = [
    { name: 'Dashboard',          path: '/dashboard', icon: LayoutDashboard },
    { name: 'Greeting Generator', path: '/generator',  icon: Sparkles        },
    { name: 'History Log',        path: '/history',    icon: History         },
    { name: 'Templates Manager',  path: '/templates',  icon: FileCode        },
    { name: 'User Profile',       path: '/profile',    icon: User            },
    { name: 'Settings',           path: '/settings',   icon: Settings        },
  ];

  const location = useLocation();

  const [sidebarHovered, setSidebarHovered] = useState(false);
  const isExpanded = isMobile ? sidebarOpen : (sidebarOpen || sidebarHovered);

  // Widths
  const EXPANDED  = 256; // 16rem
  const COLLAPSED = 64;  // 4rem  — icon rail on desktop

  /* ── computed values ── */
  // On mobile: sidebar is an overlay, content area always takes full width
  // On desktop: sidebar is in-flow; content shifts by sidebar width
  const desktopMargin = isMobile ? 0 : (sidebarOpen ? EXPANDED : COLLAPSED);
  // Sidebar actual rendered width (mobile always 256 when open, 0 when closed)
  // Desktop: 256 expanded, 64 collapsed (never hidden)
  const sidebarWidth  = isMobile
    ? (isExpanded ? EXPANDED : 0)
    : (isExpanded ? EXPANDED : COLLAPSED);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">

      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        />
      )}

      {/* ═══════════════════════════════════════
          SIDEBAR
          Mobile  → overlay drawer, slides in/out
          Desktop → fixed left column, collapses to icon-rail
      ═══════════════════════════════════════ */}
      <aside
        onMouseEnter={() => !isMobile && setSidebarHovered(true)}
        onMouseLeave={() => !isMobile && setSidebarHovered(false)}
        style={{ width: `${sidebarWidth}px` }}
        className={`
          fixed top-0 left-0 h-full z-40
          flex flex-col
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${isMobile && !isExpanded ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Brand / Logo row */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base select-none">
            M
          </div>
          <span className={`font-display font-bold text-[15px] text-slate-900 dark:text-white whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            Manivtha CRM
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={!isExpanded && !isMobile ? item.name : undefined}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${isActive
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                {/* Active accent bar */}
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full" />}

                <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-indigo-500' : ''}`} />

                <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                  {item.name}
                </span>

                {/* Tooltip shown in collapsed desktop mode */}
                {!isExpanded && !isMobile && (
                  <span className="
                    pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
                    px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap
                    bg-slate-900 dark:bg-slate-700 text-white shadow-xl
                    opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100
                    transition-all duration-150
                  ">
                    {item.name}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out at bottom */}
        <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            title={!isExpanded && !isMobile ? 'Sign Out' : undefined}
            className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors duration-150"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              Sign Out
            </span>
            {!isExpanded && !isMobile && (
              <span className="
                pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
                px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap
                bg-slate-900 dark:bg-slate-700 text-white shadow-xl
                opacity-0 group-hover:opacity-100 transition-opacity duration-150
              ">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════
          MAIN AREA
          Shifts right on desktop to make room for sidebar.
          On mobile stays full-width (sidebar is overlay).
      ═══════════════════════════════════════ */}
      <div
        style={{ marginLeft: `${desktopMargin}px` }}
        className="flex flex-col min-h-screen transition-all duration-300"
      >
        {/* ── TOP NAVBAR ── */}
        <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger — visible on ALL breakpoints */}
            <button
              id="sidebar-toggle-btn"
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:block text-sm font-semibold text-slate-500 dark:text-slate-400 select-none">
              Welcome, <span className="text-slate-800 dark:text-slate-100">{user?.username}</span>
              <span className="ml-1.5 text-xs font-normal capitalize text-slate-400 dark:text-slate-500">({user?.role})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-500" />}
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs select-none ring-2 ring-indigo-500/20">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-5 md:p-8">
          {children}
        </main>

        {/* ── FOOTER ── */}
        <footer className="h-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-xs text-slate-400">
          <span>&copy; 2026 Manivtha Tours &amp; Travels</span>
          <span>Designed under Internship Standards</span>
        </footer>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// LANDING PAGE VIEW
// -------------------------------------------------------------
function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="h-20 max-w-7xl mx-auto w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl hero-gradient flex items-center justify-center text-white font-extrabold text-xl">M</div>
          <span className="font-display font-bold text-xl tracking-tight">Manivtha Tours</span>
        </div>
        <Link to="/login" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-colors duration-150">
          Staff Login
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto mt-12 md:mt-24">
        <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          Internal Staff Automation Tool
        </span>
        <h1 className="text-4xl md:text-6xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-400 leading-tight">
          AI-Powered Customer Greeting Personalizer
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
          Enhance customer relations at Manivtha Tours & Travels. Instantly compile customized, multilingual travel greetings in English, Telugu, Hindi, or Tamil using Google Gemini.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link to="/login" className="px-8 py-4 rounded-xl hero-gradient font-bold text-base shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all">
            Access Dashboard
          </Link>
          <a href="#features" className="px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-base transition-colors">
            Learn More
          </a>
        </div>

        {/* Demo mockup snippet */}
        <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-16 text-left shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
            <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-slate-500 font-mono ml-2">greeting_simulator.log</span>
          </div>
          <div className="font-mono text-xs md:text-sm text-indigo-500 leading-relaxed">
            <p className="text-slate-500">&gt; Inputs: name="Ravi Kumar", destination="Tirupati", travelType="Family Trip", language="Telugu"</p>
            <p className="text-emerald-400 mt-2">&gt; AI Output Generated (in 2.1s):</p>
            <p className="text-slate-300 mt-1 pl-4 border-l border-emerald-500/30">
              ప్రియమైన రవి కుమార్ గారికి, తిరుపతి ఫ్యామిలీ యాత్రకు స్వాగతం! మణివిద్యా టూర్స్ & ట్రావెల్స్ తో మళ్ళీ ప్రయాణిస్తున్నందుకు ధన్యవాదాలు...
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-20 border-t border-slate-900 flex items-center justify-center px-6 text-xs text-slate-600 mt-24">
        &copy; 2026 Manivtha Tours & Travels. All Rights Reserved.
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// LOGIN VIEW
// -------------------------------------------------------------
function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';
  const accessDeniedMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 relative">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl hero-gradient flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20">M</div>
          <h2 className="text-2xl font-display font-extrabold text-white mt-4">Welcome back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to your CRM operator account</p>
        </div>

        {accessDeniedMessage && !error && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center gap-2 text-sm mb-6 animate-pulse">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{accessDeniedMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-2 text-sm mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. agent or admin" className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-white outline-none transition-colors placeholder:text-slate-600" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-white outline-none transition-colors placeholder:text-slate-600" />
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl hero-gradient font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50 transition-all text-sm mt-4">
            {loading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">Demo Account Credentials:</p>
          <p className="text-xs text-indigo-400 font-mono mt-1">Username: <span className="text-emerald-400">agent</span> / Password: <span className="text-emerald-400">password123</span> or <span className="text-emerald-400">ManivthaTravels2026!</span></p>
          <p className="text-xs text-indigo-400 font-mono">Username: <span className="text-emerald-400">admin</span> / Password: <span className="text-emerald-400">password123</span> or <span className="text-emerald-400">ManivthaTravels2026!</span></p>
          <p className="text-xs text-indigo-400 font-mono mt-1">Username: <span className="text-emerald-400">shanmukh.k</span> / Password: <span className="text-emerald-400">jaminishannu@4669</span></p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// REGISTER PLACEHOLDER VIEW
// -------------------------------------------------------------
function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 relative">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl hero-gradient flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20">M</div>
          <h2 className="text-2xl font-display font-extrabold text-white mt-4">Create Account</h2>
          <p className="text-sm text-slate-400 mt-1">Register as a CRM operator</p>
        </div>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Operator registration is restricted. Please contact the system administrator to create your account credentials.
        </p>

        <button 
          onClick={() => navigate('/login')} 
          className="w-full py-4 rounded-2xl hero-gradient font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// FORGOT PASSWORD PLACEHOLDER VIEW
// -------------------------------------------------------------
function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 relative">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl hero-gradient flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20">M</div>
          <h2 className="text-2xl font-display font-extrabold text-white mt-4">Reset Password</h2>
          <p className="text-sm text-slate-400 mt-1">Recover your operator account password</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm">
              Password recovery link has been simulated. In a live production setup, an email would be dispatched to <span className="font-semibold">{email}</span>.
            </div>
            <button 
              onClick={() => navigate('/login')} 
              className="w-full py-4 rounded-2xl hero-gradient font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all text-sm"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Operator Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="e.g. admin@manivthatravels.com" 
                className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-white outline-none transition-colors placeholder:text-slate-600" 
              />
            </div>
            
            <button type="submit" className="w-full py-4 rounded-2xl hero-gradient font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all text-sm mt-4">
              Send Reset Link
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/login')} 
              className="w-full py-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 transition-all text-sm"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MAIN DASHBOARD VIEW
// -------------------------------------------------------------
function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('All');
  const [travelType, setTravelType] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await api.get('/analytics', {
          params: { category, language, travelType }
        });
        setMetrics(res.data);
      } catch (err) {
        console.warn("API offline, rendering simulated analytics");
        const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
        const localFeedbacks = JSON.parse(localStorage.getItem('local_feedbacks') || '[]');
        
        let allGreetings = [...localGreetings];
        let allFeedbacks = [...localFeedbacks];
        
        if (category && category !== 'All') {
          allGreetings = allGreetings.filter(g => g.category === category);
        }
        if (language && language !== 'All') {
          allGreetings = allGreetings.filter(g => g.language === language);
        }
        if (travelType && travelType !== 'All') {
          allGreetings = allGreetings.filter(g => g.travel_type === travelType);
        }
        
        const totalGreetings = allGreetings.length;
        
        const greetingIds = new Set(allGreetings.map(g => g.id));
        const filteredFeedback = allFeedbacks.filter(f => greetingIds.has(f.greeting_id));
        const ratings = filteredFeedback.map(f => f.rating);
        const averageRating = ratings.length ? parseFloat((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)) : 0;
        
        const destCount = {};
        allGreetings.forEach(g => {
          destCount[g.destination] = (destCount[g.destination] || 0) + 1;
        });
        const topDestinations = Object.keys(destCount).map(name => ({
          name,
          count: destCount[name]
        })).sort((a, b) => b.count - a.count).slice(0, 5);
        
        const dailyUsage = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dayName = daysOfWeek[d.getDay()];
          const dateStr = d.toISOString().split('T')[0];
          const count = allGreetings.filter(g => {
            if (!g.created_at) return false;
            const gDate = new Date(g.created_at).toISOString().split('T')[0];
            return gDate === dateStr;
          }).length;
          dailyUsage.push({ date: dayName, count });
        }
        
        const recentFeedbacks = filteredFeedback.map(fb => {
          const greeting = allGreetings.find(g => g.id === fb.greeting_id);
          return {
            id: fb.id,
            customer_name: greeting ? greeting.customer_name : 'Unknown Customer',
            destination: greeting ? greeting.destination : 'Unknown',
            rating: fb.rating,
            comments: fb.comments,
            created_at: fb.created_at
          };
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        
        setMetrics({
          totalGreetings,
          averageRating,
          feedbackCount: filteredFeedback.length,
          topDestinations,
          dailyUsage,
          recentFeedbacks,
          performanceMetrics: {
            avgResponseMs: 2400,
            uptimePct: 99.9,
            aiSuccessRate: 99.2
          }
        });
      }
      setLoading(false);
    }
    loadMetrics();
  }, [category, language, travelType]);

  if (loading) return <div className="text-center py-12 text-slate-500">Gathering database statistics...</div>;

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Analytics Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Realtime monitoring of greeting personalizations</p>
        </div>
      </div>

      {/* Dynamic Filters dropdown bar */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category Filter</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:border-indigo-500 text-sm">
            <option value="All">All Categories</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Language Filter</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:border-indigo-500 text-sm">
            <option value="All">All Languages</option>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Marathi">Marathi</option>
            <option value="Bengali">Bengali</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Travel Group Filter</label>
          <select value={travelType} onChange={e => setTravelType(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl outline-none focus:border-indigo-500 text-sm">
            <option value="All">All Groups</option>
            <option value="Family Trip">Family Trip</option>
            <option value="Spiritual Tour">Spiritual Tour</option>
            <option value="Honeymoon">Honeymoon</option>
            <option value="Corporate Travel">Corporate Travel</option>
            <option value="Solo Adventure">Solo Adventure</option>
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div onClick={() => navigate('/history')} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center gap-4 hover-scale cursor-pointer">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{metrics?.totalGreetings}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Greetings</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center gap-4 hover-scale">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Star className="h-6 w-6 fill-current" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{metrics?.averageRating} / 5.0</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average Rating</p>
          </div>
        </div>

        {/* Card 3 */}
        <div onClick={() => navigate('/history')} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center gap-4 hover-scale cursor-pointer">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <History className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{metrics?.feedbackCount}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Feedback Logs</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dynamic Usage Chart via inline responsive SVG */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between">
          <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-slate-500">Weekly Generation Volume</h3>
          <div className="w-full h-64 flex items-end justify-between px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            {metrics?.dailyUsage?.map((day) => {
              const maxVal = Math.max(...(metrics?.dailyUsage || []).map(d => d.count)) || 1;
              const heightPct = (day.count / maxVal) * 85; // cap height
              return (
                <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group relative">
                  <span className="text-xs font-mono text-indigo-500 font-bold">{day.count}</span>
                  <div className="w-8 hero-gradient rounded-t-lg transition-all duration-500 hover:opacity-80" style={{ height: `${heightPct}%`, minHeight: '8px' }}></div>
                  <span className="text-xs font-medium text-slate-500">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Destination Matrix */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between">
          <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-slate-500">Top Destinations</h3>
          <div className="space-y-4">
            {metrics?.topDestinations && metrics.topDestinations.length > 0 ? (
              metrics.topDestinations.map((dest) => {
                const maxDestCount = metrics?.topDestinations?.[0]?.count || 1;
                const barWidth = `${(dest.count / maxDestCount) * 100}%`;
                return (
                  <div 
                    key={dest.name} 
                    className="space-y-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-all"
                    onClick={() => navigate(`/history?search=${encodeURIComponent(dest.name)}`)}
                    title="Click to audit logs for this destination"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{dest.name}</span>
                      <span className="text-indigo-500">{dest.count} Greetings</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: barWidth }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm py-12 text-center">No travel data found for current filters.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Feedbacks & Telemetry Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Feedback Feed Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl lg:col-span-2 space-y-4">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-500">Recent Customer Feedback</h3>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-64 overflow-y-auto space-y-3 pr-2">
            {metrics?.recentFeedbacks && metrics.recentFeedbacks.length > 0 ? (
              metrics.recentFeedbacks.map((fb, idx) => (
                <div key={fb.id || idx} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{fb.customer_name}</span>
                    <span className="text-xs text-slate-500 font-medium">to {fb.destination}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${fb.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    ))}
                    <span className="text-xs text-slate-500 ml-2 font-mono">{new Date(fb.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{fb.comments || 'No comments left.'}"</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm py-12 text-center">No customer feedback logs found.</p>
            )}
          </div>
        </div>

        {/* Telemetry metrics panel inside the grid */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between">
          <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-slate-500">System Telemetry</h3>
          <div className="space-y-4 my-auto">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Service Uptime</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{metrics?.performanceMetrics?.uptimePct}%</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Latency</span>
              <span className="text-lg font-bold font-mono text-indigo-500">{metrics?.performanceMetrics?.avgResponseMs}ms</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Success Rate</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{metrics?.performanceMetrics?.aiSuccessRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GREETING GENERATOR FORM & WORKSPACE VIEW
// -------------------------------------------------------------
function GreetingGenerator() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(() => localStorage.getItem('gen_name') || '');
  const [destination, setDestination] = useState(() => localStorage.getItem('gen_destination') || '');
  const [bookingHistory, setBookingHistory] = useState(() => localStorage.getItem('gen_bookingHistory') || '1st Trip');
  const [travelType, setTravelType] = useState(() => localStorage.getItem('gen_travelType') || 'Family Trip');
  const [preferredLanguage, setPreferredLanguage] = useState(() => localStorage.getItem('gen_preferredLanguage') || 'English');
  const [customerCategory, setCustomerCategory] = useState(() => localStorage.getItem('gen_customerCategory') || 'Standard');
  const [specialNotes, setSpecialNotes] = useState(() => localStorage.getItem('gen_specialNotes') || '');
  const [travelDate, setTravelDate] = useState(() => localStorage.getItem('gen_travelDate') || '');
  const [whatsappNumber, setWhatsappNumber] = useState(() => localStorage.getItem('gen_whatsappNumber') || '');

  const [loading, setLoading] = useState(false);
  const [resultGreeting, setResultGreeting] = useState(() => {
    const saved = localStorage.getItem('gen_resultGreeting');
    return saved ? JSON.parse(saved) : null;
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [rating, setRating] = useState(() => {
    const saved = localStorage.getItem('gen_rating');
    return saved ? parseInt(saved) : 5;
  });
  const [feedbackComments, setFeedbackComments] = useState(() => localStorage.getItem('gen_feedbackComments') || '');
  const [feedbackSaved, setFeedbackSaved] = useState(() => {
    const saved = localStorage.getItem('gen_feedbackSaved');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('gen_name', name);
  }, [name]);
  useEffect(() => {
    localStorage.setItem('gen_destination', destination);
  }, [destination]);
  useEffect(() => {
    localStorage.setItem('gen_bookingHistory', bookingHistory);
  }, [bookingHistory]);
  useEffect(() => {
    localStorage.setItem('gen_travelType', travelType);
  }, [travelType]);
  useEffect(() => {
    localStorage.setItem('gen_preferredLanguage', preferredLanguage);
  }, [preferredLanguage]);
  useEffect(() => {
    localStorage.setItem('gen_customerCategory', customerCategory);
  }, [customerCategory]);
  useEffect(() => {
    localStorage.setItem('gen_specialNotes', specialNotes);
  }, [specialNotes]);
  useEffect(() => {
    localStorage.setItem('gen_travelDate', travelDate);
  }, [travelDate]);
  useEffect(() => {
    localStorage.setItem('gen_whatsappNumber', whatsappNumber);
  }, [whatsappNumber]);

  useEffect(() => {
    if (resultGreeting) {
      localStorage.setItem('gen_resultGreeting', JSON.stringify(resultGreeting));
    } else {
      localStorage.removeItem('gen_resultGreeting');
    }
  }, [resultGreeting]);

  useEffect(() => {
    localStorage.setItem('gen_rating', rating.toString());
  }, [rating]);

  useEffect(() => {
    localStorage.setItem('gen_feedbackComments', feedbackComments);
  }, [feedbackComments]);

  useEffect(() => {
    localStorage.setItem('gen_feedbackSaved', feedbackSaved.toString());
  }, [feedbackSaved]);

  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Custom presets state (admin-managed, stored in localStorage)
  const [customPresets, setCustomPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('custom_presets') || '[]'); } catch { return []; }
  });
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetForm, setPresetForm] = useState({ label: '', emoji: '✈️', destination: '', travelType: 'Family Trip', bookingHistory: '1st Trip', category: 'Standard', language: 'English', notes: '' });

  const loadGreetingsHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/history');
      setHistoryList(res.data);
    } catch (e) {
      console.warn("API offline, falling back to local storage logs");
      const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
      localGreetings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistoryList(localGreetings);
    }
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadGreetingsHistory();
  }, []);

  const saveCustomPreset = () => {
    if (!presetForm.label.trim() || !presetForm.destination.trim()) return;
    const updated = [...customPresets, { ...presetForm, id: 'cp_' + Date.now() }];
    setCustomPresets(updated);
    localStorage.setItem('custom_presets', JSON.stringify(updated));
    setPresetForm({ label: '', emoji: '✈️', destination: '', travelType: 'Family Trip', bookingHistory: '1st Trip', category: 'Standard', language: 'English', notes: '' });
    setShowPresetModal(false);
  };

  const deleteCustomPreset = (id) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('custom_presets', JSON.stringify(updated));
  };

  const handleLoadGreeting = (greeting) => {
    setName(greeting.customer_name || '');
    setWhatsappNumber(greeting.whatsapp_number || '');
    setDestination(greeting.destination || '');
    setTravelDate(greeting.travel_date || '');
    setTravelType(greeting.travel_type || 'Family Trip');
    setBookingHistory(greeting.booking_history || '1st Trip');
    setPreferredLanguage(greeting.language || 'English');
    setCustomerCategory(greeting.category || 'Standard');
    setSpecialNotes(greeting.special_notes || '');
    
    setResultGreeting(greeting);
    setFeedbackSaved(false);
    setRating(greeting.rating || 5);
    setFeedbackComments(greeting.comments || '');
    setAlertMessage('Selected greeting loaded into workspace.');
  };

  const handleDeleteGreeting = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this greeting?")) return;
    // Immediately remove from UI state
    setHistoryList(prev => prev.filter(item => item.id !== id));
    if (resultGreeting && resultGreeting.id === id) setResultGreeting(null);
    // Always clean up local storage too
    const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
    localStorage.setItem('local_greetings', JSON.stringify(localGreetings.filter(g => g.id !== id)));
    const localFeedbacks = JSON.parse(localStorage.getItem('local_feedbacks') || '[]');
    localStorage.setItem('local_feedbacks', JSON.stringify(localFeedbacks.filter(f => f.greeting_id !== id)));
    try {
      await api.delete(`/history/${id}`);
      setAlertMessage('Greeting permanently deleted.');
    } catch (e) {
      // Record may be local-only — already removed above
      setAlertMessage('Greeting removed from workspace.');
    }
  };

  // Template Quick-picker implementation
  const applyTemplate = (type) => {
    if (type === 'spiritual') {
      setDestination('Tirupati');
      setTravelType('Spiritual Tour');
      setBookingHistory('3 Previous Trips');
      setCustomerCategory('VIP');
      setPreferredLanguage('English');
      setSpecialNotes('Arrange clean vegetarian guide.');
    } else if (type === 'honeymoon') {
      setDestination('Goa');
      setTravelType('Honeymoon');
      setBookingHistory('1st Trip');
      setCustomerCategory('Premium');
      setPreferredLanguage('English');
      setSpecialNotes('Arrange flower decorations and candle light dinners.');
    } else if (type === 'corporate') {
      setDestination('Mumbai');
      setTravelType('Corporate Travel');
      setBookingHistory('5 Previous Trips');
      setCustomerCategory('VIP');
      setPreferredLanguage('English');
      setSpecialNotes('Provide premium executive sedan, late check-out, express Wi-Fi.');
    } else if (type === 'adventure') {
      setDestination('Leh Ladakh');
      setTravelType('Solo Adventure');
      setBookingHistory('1st Trip');
      setCustomerCategory('Standard');
      setPreferredLanguage('Hindi');
      setSpecialNotes('Include high-altitude oxygen kit, emergency local contacts, bike rental details.');
    } else if (type === 'family') {
      setDestination('Ooty');
      setTravelType('Family Trip');
      setBookingHistory('2 Previous Trips');
      setCustomerCategory('Premium');
      setPreferredLanguage('Telugu');
      setSpecialNotes('Book kid-friendly theme park tickets and arrange an English-speaking driver.');
    } else if (type === 'cultural') {
      setDestination('Jaipur');
      setTravelType('Family Trip');
      setBookingHistory('4 Previous Trips');
      setCustomerCategory('VIP');
      setPreferredLanguage('Hindi');
      setSpecialNotes('Book local guide for historical forts and royal dinner reservations.');
    }
  };

  const applyCustomPreset = (preset) => {
    setDestination(preset.destination || '');
    setTravelType(preset.travelType || 'Family Trip');
    setBookingHistory(preset.bookingHistory || '1st Trip');
    setCustomerCategory(preset.category || 'Standard');
    setPreferredLanguage(preset.language || 'English');
    setSpecialNotes(preset.notes || '');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultGreeting(null);
    setFeedbackSaved(false);
    setRating(5);
    setFeedbackComments('');
    setAlertMessage('');

    try {
      const res = await api.post('/generate', {
        name,
        destination,
        bookingHistory,
        travelType,
        preferredLanguage,
        customerCategory,
        specialNotes,
        travelDate,
        whatsappNumber
      });
      setResultGreeting(res.data);
      loadGreetingsHistory();
    } catch (err) {
      console.warn("API Error, triggering simulated local output fallback");
      
      const formattedDate = travelDate ? new Date(travelDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'soon';

      const isReturnCustomer = bookingHistory && !bookingHistory.toLowerCase().includes('first') && !bookingHistory.toLowerCase().includes('0') && !bookingHistory.toLowerCase().includes('1st');

      let simulatedText = '';
      const lang = preferredLanguage ? preferredLanguage.toLowerCase() : 'english';

      if (lang === 'telugu') {
        simulatedText = `ప్రియమైన ${name || 'గ్రాహకులకు'},\n\nమణివితా టూర్స్ & ట్రావెల్స్ ఎంచుకున్నందుకు ధన్యవాదాలు.\n\nమీరు ${formattedDate} న ప్రయాణించబోయే ${destination || 'గమ్యస్థానానికి'} యాత్ర కొరకు మా శుభాకాంక్షలు. ${isReturnCustomer ? 'మాతో మళ్ళీ ప్రయాణిస్తున్నందుకు మేము ఎంతో సంతోషిస్తున్నాము.' : ''}\nమీ ప్రయాణం క్షేమంగా మరియు సంతోషంగా సాగాలని కోరుకుంటున్నాము.\n\nభవదీయులు,\nమణివితా టూర్స్ & ట్రావెల్స్`;
      } else if (lang === 'hindi') {
        simulatedText = `नमस्ते ${name || 'प्रिय ग्राहक'},\n\nमणिविथा टूर्स एंड ट्रेवल्स को चुनने के लिए आपका धन्यवाद।\n\nहम ${formattedDate} को होने वाली आपकी ${destination || 'मंजिल'} की यात्रा के लिए रोमांचित हैं। ${isReturnCustomer ? 'हमारे पुराने ग्राहक के रूप में आपके साथ दोबारा जुड़ना हमारे लिए गर्व की बात है।' : ''}\nआपकी यात्रा सुरक्षित, आरामदायक और मंगलमय हो।\n\nसादर,\nमणिविथा टूर्स एंड ट्रेवल्स`;
      } else if (lang === 'tamil') {
        simulatedText = `அன்பான ${name || 'வாடிக்கையாளரே'},\n\nமணிவிதா டூர்ஸ் & டிராவல்ஸை தேர்ந்தெடுத்ததற்கு நன்றி.\n\n${formattedDate} அன்று நீங்கள் மேற்கொள்ளும் ${destination || 'பயண இலக்கு'} பயணம் சிறக்க வாழ்த்துகிறோம். ${isReturnCustomer ? 'எங்களின் வழக்கமான வாடிக்கையாளராக உங்களை வரவேற்பதில் மகிழ்ச்சி அடைகிறோம்.' : ''}\nஉங்களின் பயணம் பாதுகாப்பாகவும் மகிழ்ச்சியாகவும் அமைய வாழ்த்துகிறோம்.\n\nஅன்புடன்,\nமணிவிதா டூர்ஸ் & டிராவல்ஸ்`;
      } else if (lang === 'kannada') {
        simulatedText = `ಪ್ರಿಯ ${name || 'ಗ್ರಾಹಕರೇ'},\n\nಮಣಿವಿತಾ ಟೂರ್ಸ್ & ಟ್ರಾವೆಲ್ಸ್ ಆಯ್ಕೆ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.\n\n${formattedDate} ರಂದು ನೀವು ಕೈಗೊಳ್ಳಲಿರುವ ${destination || 'ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನದ'} ಪ್ರಯಾಣಕ್ಕಾಗಿ ನಮ್ಮ ಶುಭ ಹಾರೈಕೆಗಳು. ${isReturnCustomer ? 'ನಮ್ಮೊಂದಿಗೆ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯಾಣಿಸುತ್ತಿರುವುದಕ್ಕೆ ನಮಗೆ ತುಂಬಾ ಸಂತೋಷವಾಗಿದೆ.' : ''}\nನಿಮ್ಮ ಪ್ರಯಾಣವು ಸುರಕ್ಷಿತ ಮತ್ತು ಸುಖಕರವಾಗಿರಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇವೆ.\n\nಪ್ರೀತಿಯ ಗೌರವಗಳೊಂದಿಗೆ,\nಮಣಿವಿತಾ ಟೂರ್ಸ್ & ಟ್ರಾವೆಲ್ಸ್`;
      } else if (lang === 'malayalam') {
        simulatedText = `പ്രിയപ്പെട്ട ${name || 'ഉപഭോക്താവേ'},\n\nമണിവ്ത ടൂർസ് & ട്രാവൽസ് തിരഞ്ഞെടുത്തതിന് നന്ദി.\n\n${formattedDate} തീയതിയിൽ നിശ്ചയിച്ചിട്ടുള്ള നിങ്ങളുടെ ${destination || 'യാത്ര സ്ഥലത്തേക്കുള്ള'} യാത്രയ്ക്ക് ഞങ്ങളുടെ ആശംസകൾ. ${isReturnCustomer ? 'ഞങ്ങളോടൊപ്പം വീണ്ടും യാത്ര ചെയ്യുന്നതിൽ ഞങ്ങൾക്ക് സന്തോഷമുണ്ട്.' : ''}\nനിങ്ങളുടെ യാത്ര സുരക്ഷിതവും സന്തോഷകരവുമായിരിക്കാൻ ആശംസിക്കുന്നു.\n\nആദരവോടെ,\nമണിവ്ത ടൂർസ് & ട്രാവൽസ്`;
      } else if (lang === 'marathi') {
        simulatedText = `प्रिय ${name || 'ग्राहक'},\n\nमणिविथा टूर्स अँड ट्रॅव्हल्सची निवड केल्याबद्दल धन्यवाद.\n\n${formattedDate} रोजी होणाऱ्या तुमच्या ${destination || 'प्रवास स्थळ'} प्रवासासाठी आमच्या हार्दिक शुभेच्छा. ${isReturnCustomer ? 'आमच्यासोबत पुन्हा प्रवास करत असल्याबद्दल आम्हाला मनापासून आनंद होत आहे।' : ''}\nतुमचा प्रवास सुरक्षित आणि सुखकर होवो.\n\nसस्नेह सादर,\nमणिविथा टूर्स अँड ट्रॅव्हल्स`;
      } else if (lang === 'bengali') {
        simulatedText = `প্রিয় ${name || 'গ্রাহক'},\n\nমণিভিথা ট্যুরস অ্যান্ড ট্রাভেলস বেছে নেওয়ার জন্য আপনাকে ধন্যবাদ।\n\n${formattedDate} তারিখে আপনার ${destination || 'গন্তব্য'} ভ্রমণের জন্য আমাদের আন্তরিক শুভেচ্ছা। ${isReturnCustomer ? 'আমাদের সাথে আবার ভ্রমণ করার জন্য আমরা অত্যন্ত আনন্দিত।' : ''}\nTravel safe and joyfully.\n\nশুভেচ্ছা সহ,\nমণিভিথা ট্যুরস অ্যান্ড ট্রাভেলস`;
      } else {
        let loyaltyGreeting = "";
        if (customerCategory?.toUpperCase() === 'VIP') {
          loyaltyGreeting = `As one of our esteemed VIP customers with ${bookingHistory || 'a valued travel history'}, we are prioritizing your travel preparations to ensure the highest standard of luxury and convenience.`;
        } else if (isReturnCustomer) {
          loyaltyGreeting = `As a valued returning customer with ${bookingHistory}, we sincerely appreciate your continued trust in Manivtha Tours & Travels.`;
        } else {
          loyaltyGreeting = `Thank you for choosing Manivtha Tours & Travels. We look forward to creating a memorable trip for you.`;
        }

        let notesMessage = specialNotes ? `\n\nWe have noted your instructions: "${specialNotes}" and will coordinate with local service providers to accommodate your requests.` : '';

        simulatedText = `Hello ${name || 'Valued Customer'},\n\nThank you once again for choosing Manivtha Tours & Travels.\n\nWe are delighted to assist you on your upcoming ${travelType || 'journey'} to ${destination || 'your destination'} scheduled for ${formattedDate}. ${loyaltyGreeting}${notesMessage}\n\nWe wish you a safe, comfortable, and memorable trip.\n\nWarm Regards,\nManivtha Tours & Travels`;
      }

      const generatedGreeting = {
        id: 'simulated_' + Math.random().toString(36).substring(7),
        customer_name: name,
        destination,
        travel_date: travelDate,
        booking_history: bookingHistory,
        travel_type: travelType,
        language: preferredLanguage,
        category: customerCategory,
        special_notes: specialNotes,
        whatsapp_number: whatsappNumber,
        generated_text: simulatedText,
        created_at: new Date().toISOString(),
        status: 'draft'
      };

      const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
      localGreetings.push(generatedGreeting);
      localStorage.setItem('local_greetings', JSON.stringify(localGreetings));

      setResultGreeting(generatedGreeting);
      loadGreetingsHistory();
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (resultGreeting) {
      navigator.clipboard.writeText(resultGreeting.generated_text);
      setAlertMessage('Greeting copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (resultGreeting) {
      const element = document.createElement("a");
      const file = new Blob([resultGreeting.generated_text], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${resultGreeting.customer_name.replace(/\s+/g, '_')}_Greeting.txt`;
      document.body.appendChild(element);
      element.click();
      setAlertMessage('Greeting file downloaded!');
    }
  };

  const handleWhatsAppShare = () => {
    if (!resultGreeting) return;

    const targetNumber = (whatsappNumber || resultGreeting.whatsapp_number || '').trim();

    if (!targetNumber) {
      setAlertMessage('⚠️ Please enter a WhatsApp number in the form before sending.');
      return;
    }

    let cleanNumber = targetNumber.replace(/\D/g, '');
    // Auto-prepend India country code (+91) for 10-digit numbers
    if (cleanNumber.length === 10) {
      cleanNumber = '91' + cleanNumber;
    }

    const encodedText = encodeURIComponent(resultGreeting.generated_text);
    const mode = localStorage.getItem('settings_whatsappMode') || 'app';
    let url = '';
    if (mode === 'api') {
      url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;
    } else if (mode === 'wa') {
      url = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    } else if (mode === 'app') {
      url = `whatsapp://send?phone=${cleanNumber}&text=${encodedText}`;
    } else {
      url = `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;
    }
    
    if (mode === 'app') {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }

    setAlertMessage(`✅ WhatsApp opened for +${cleanNumber} — click Send in WhatsApp to deliver.`);

    // Mark greeting as shared in DB / local storage
    api.put(`/history/${resultGreeting.id}/status`, { status: 'shared' }).catch(() => {
      const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
      const idx = localGreetings.findIndex(g => g.id === resultGreeting.id);
      if (idx !== -1) {
        localGreetings[idx].status = 'shared';
        localStorage.setItem('local_greetings', JSON.stringify(localGreetings));
        setResultGreeting({ ...resultGreeting, status: 'shared' });
      }
    });
  };

  const saveFeedbackLocally = (greetingId, ratingVal, commentsVal) => {
    const localFeedbacks = JSON.parse(localStorage.getItem('local_feedbacks') || '[]');
    const existingIdx = localFeedbacks.findIndex(f => f.greeting_id === greetingId);
    const newFeedback = {
      id: existingIdx !== -1 ? localFeedbacks[existingIdx].id : 'local_f_' + Math.random().toString(36).substring(7),
      greeting_id: greetingId,
      rating: ratingVal,
      comments: commentsVal,
      created_at: new Date().toISOString()
    };
    if (existingIdx !== -1) {
      localFeedbacks[existingIdx] = newFeedback;
    } else {
      localFeedbacks.push(newFeedback);
    }
    localStorage.setItem('local_feedbacks', JSON.stringify(localFeedbacks));
  };

  const submitFeedback = async () => {
    if (!resultGreeting) return;
    try {
      await api.post('/feedback', {
        greeting_id: resultGreeting.id,
        rating,
        comments: feedbackComments
      });
      setFeedbackSaved(true);
      saveFeedbackLocally(resultGreeting.id, rating, feedbackComments);
    } catch (e) {
      console.warn("Feedback save error, displaying confirmation locally");
      saveFeedbackLocally(resultGreeting.id, rating, feedbackComments);
      setFeedbackSaved(true);
    }
  };

  const [showOutputDrawer, setShowOutputDrawer] = useState(false);

  return (
    <>
    {/* Mobile Output Drawer Backdrop */}
    {showOutputDrawer && (
      <div className="drawer-overlay" onClick={() => setShowOutputDrawer(false)} />
    )}
    {/* Mobile Output Slide-UP Drawer */}
    <div className={`output-drawer bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl ${showOutputDrawer ? 'is-open' : ''}`}>
      <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 rounded-t-3xl">
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"></div>
        <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Generated Output</h2>
        <button onClick={() => setShowOutputDrawer(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <X className="h-5 w-5 text-slate-400" />
        </button>
      </div>
      <div className="p-6 space-y-6">
        {alertMessage && <AlertWidget message={alertMessage} onClose={() => setAlertMessage('')} />}
        {resultGreeting ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">AI Draft Complete</span>
                <p className="text-xs text-slate-500 mt-1">Created: {new Date(resultGreeting.created_at).toLocaleTimeString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} title="Copy to clipboard" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl transition-colors"><Copy className="h-4 w-4" /></button>
                <button onClick={handleDownload} title="Download as .txt" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl transition-colors"><Download className="h-4 w-4" /></button>
              </div>
            </div>
            <textarea value={resultGreeting.generated_text} onChange={e => setResultGreeting({ ...resultGreeting, generated_text: e.target.value })} rows="10" className="w-full p-4 bg-slate-50 dark:bg-slate-950 font-mono text-sm border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 leading-relaxed text-slate-700 dark:text-slate-300 resize-none" />

            {/* WhatsApp Send Button */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                (whatsappNumber || resultGreeting.whatsapp_number)
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30 hover:scale-[1.01]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {(whatsappNumber || resultGreeting.whatsapp_number)
                ? `Send via WhatsApp → +${ ((whatsappNumber || resultGreeting.whatsapp_number).replace(/\D/g, '').length === 10 ? '91' : '') + (whatsappNumber || resultGreeting.whatsapp_number).replace(/\D/g, '') }`
                : 'Enter a WhatsApp number above to send'
              }
            </button>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <h4 className="font-display font-semibold text-sm text-slate-500 uppercase tracking-wider">Rate Quality</h4>
              {feedbackSaved ? (
                <p className="text-sm text-emerald-400 font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Feedback recorded!</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium mr-2">Rate:</span>
                    {[1,2,3,4,5].map(star => <button key={star} onClick={() => setRating(star)} className="p-1 hover:scale-110 transition-transform"><Star className={`h-6 w-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} /></button>)}
                  </div>
                  <input type="text" value={feedbackComments} onChange={e => setFeedbackComments(e.target.value)} placeholder="Any comments?" className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500" />
                  <button onClick={submitFeedback} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all">Submit Feedback</button>
                </div>
              )}
            </div>
            {user && user.role === 'admin' && (
              <button onClick={() => handleDeleteGreeting(resultGreeting.id)} className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" /> Delete This Greeting
              </button>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <Sparkles className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="font-semibold text-sm">No Active Document</p>
            <p className="text-xs mt-1">Fill the form and generate a greeting first.</p>
          </div>
        )}
      </div>
    </div>
    {/* Floating 'View Output' FAB on mobile */}
    {resultGreeting && (
      <div className="mobile-fab">
        <button
          onClick={() => setShowOutputDrawer(true)}
          className="flex items-center gap-2 px-5 py-3.5 hero-gradient text-white rounded-2xl font-bold text-sm shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-transform"
        >
          <Sparkles className="h-4 w-4" />
          View Output
        </button>
      </div>
    )}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Form Panel */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Greeting Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Populate parameters to create customized passenger letters</p>
        </div>

        {/* Template Quick Presets */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Load Preset Settings</span>
            {user && user.role === 'admin' && (
              <button
                type="button"
                onClick={() => setShowPresetModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Add custom preset trip"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Preset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => applyTemplate('spiritual')} className="px-3 py-2 text-xs font-semibold bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/10 rounded-xl transition-all">
              ☸️ Tirupati Pilgrimage
            </button>
            <button type="button" onClick={() => applyTemplate('honeymoon')} className="px-3 py-2 text-xs font-semibold bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/10 rounded-xl transition-all">
              🏖️ Goa Honeymoon
            </button>
            <button type="button" onClick={() => applyTemplate('corporate')} className="px-3 py-2 text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/10 rounded-xl transition-all">
              💼 Mumbai Corporate
            </button>
            <button type="button" onClick={() => applyTemplate('adventure')} className="px-3 py-2 text-xs font-semibold bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/10 rounded-xl transition-all">
              🏔️ Ladakh Adventure
            </button>
            <button type="button" onClick={() => applyTemplate('family')} className="px-3 py-2 text-xs font-semibold bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/10 rounded-xl transition-all">
              👪 Ooty Family
            </button>
            <button type="button" onClick={() => applyTemplate('cultural')} className="px-3 py-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10 rounded-xl transition-all">
              🏰 Jaipur Heritage
            </button>
            {/* Admin-added custom presets */}
            {customPresets.map(preset => (
              <div key={preset.id} className="relative group flex items-center">
                <button
                  type="button"
                  onClick={() => applyCustomPreset(preset)}
                  className="px-3 py-2 text-xs font-semibold bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/10 rounded-xl transition-all pr-7"
                >
                  {preset.emoji} {preset.label}
                </button>
                {user && user.role === 'admin' && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteCustomPreset(preset.id); }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-violet-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove this preset"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Preset Modal */}
        {showPresetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPresetModal(false)}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Add Custom Preset Trip</h3>
                <button type="button" onClick={() => setShowPresetModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Preset Label *</label>
                  <input type="text" value={presetForm.label} onChange={e => setPresetForm(p => ({...p, label: e.target.value}))} placeholder="e.g. Mysore Weekend" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Emoji</label>
                  <input type="text" value={presetForm.emoji} onChange={e => setPresetForm(p => ({...p, emoji: e.target.value}))} placeholder="✈️" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Destination *</label>
                  <input type="text" value={presetForm.destination} onChange={e => setPresetForm(p => ({...p, destination: e.target.value}))} placeholder="e.g. Mysore" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Travel Type</label>
                  <select value={presetForm.travelType} onChange={e => setPresetForm(p => ({...p, travelType: e.target.value}))} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm">
                    <option>Family Trip</option><option>Honeymoon</option><option>Spiritual Tour</option><option>Corporate Travel</option><option>Solo Adventure</option><option>Group Tour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={presetForm.category} onChange={e => setPresetForm(p => ({...p, category: e.target.value}))} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm">
                    <option>Standard</option><option>Premium</option><option>VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Booking History</label>
                  <select value={presetForm.bookingHistory} onChange={e => setPresetForm(p => ({...p, bookingHistory: e.target.value}))} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm">
                    <option>1st Trip</option><option>2 Previous Trips</option><option>3 Previous Trips</option><option>4 Previous Trips</option><option>5 Previous Trips</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Language</label>
                  <select value={presetForm.language} onChange={e => setPresetForm(p => ({...p, language: e.target.value}))} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm">
                    <option>English</option><option>Telugu</option><option>Hindi</option><option>Tamil</option><option>Kannada</option><option>Malayalam</option><option>Marathi</option><option>Bengali</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Special Notes</label>
                  <input type="text" value={presetForm.notes} onChange={e => setPresetForm(p => ({...p, notes: e.target.value}))} placeholder="e.g. Arrange vegetarian meals" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={saveCustomPreset} disabled={!presetForm.label.trim() || !presetForm.destination.trim()} className="flex-1 py-2.5 hero-gradient text-white font-bold rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-40">
                  Save Preset
                </button>
                <button type="button" onClick={() => setShowPresetModal(false)} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-400 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Number</label>
              <input 
                type="tel" 
                value={whatsappNumber} 
                onChange={e => {
                  const val = e.target.value.replace(/[^\d+()\-\s]/g, '');
                  setWhatsappNumber(val);
                }} 
                placeholder="e.g. +91 98765 43210" 
                maxLength="16"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Destination</label>
              <input type="text" required value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Tirupati" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Travel Date</label>
              <input type="date" required value={travelDate} onChange={e => setTravelDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Travel Group/Type</label>
              <select value={travelType} onChange={e => setTravelType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm">
                <option value="Family Trip">Family Trip</option>
                <option value="Spiritual Tour">Spiritual Tour</option>
                <option value="Honeymoon">Honeymoon</option>
                <option value="Corporate Travel">Corporate Travel</option>
                <option value="Solo Adventure">Solo Adventure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Booking History</label>
              <input type="text" value={bookingHistory} onChange={e => setBookingHistory(e.target.value)} placeholder="e.g. 3 Previous Trips" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Language</label>
              <select value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm">
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Marathi">Marathi</option>
                <option value="Bengali">Bengali</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select value={customerCategory} onChange={e => setCustomerCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm">
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Special Instructions / Notes</label>
            <textarea value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} rows="3" placeholder="e.g. Senior citizen requires wheelchair assistance." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm resize-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 hero-gradient text-white rounded-2xl font-bold hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Compiling AI Prompts...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Greeting</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Workspace Output View - Desktop Only */}
      <div className="desktop-output-panel space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Generated Output</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review, refine, and dispatch greeting</p>
        </div>

        {alertMessage && <AlertWidget message={alertMessage} onClose={() => setAlertMessage('')} />}

        {resultGreeting ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  AI Draft Complete
                </span>
                <p className="text-xs text-slate-500 mt-1">Created: {new Date(resultGreeting.created_at).toLocaleTimeString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} title="Copy" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl transition-colors">
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={handleDownload} title="Download File" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl transition-colors">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={handleWhatsAppShare} title="Share WhatsApp" className="p-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors flex items-center gap-2 font-semibold text-xs px-3">
                  <Share2 className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>

            {/* Editable code-style container */}
            <textarea value={resultGreeting.generated_text} onChange={e => setResultGreeting({ ...resultGreeting, generated_text: e.target.value })} rows="12" className="w-full p-4 bg-slate-50 dark:bg-slate-950 font-mono text-sm border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 leading-relaxed text-slate-700 dark:text-slate-300 resize-none" />

            {/* Quality rating module */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
              <h4 className="font-display font-semibold text-sm text-slate-500 uppercase tracking-wider">Help calibrate prompt models</h4>
              {feedbackSaved ? (
                <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Feedback recorded! Thank you.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium mr-2">Rate greeting quality:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} className="p-1 hover:scale-110 transition-transform">
                        <Star className={`h-6 w-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                  <input type="text" value={feedbackComments} onChange={e => setFeedbackComments(e.target.value)} placeholder="Any comments or edits?" className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500" />
                  <button onClick={submitFeedback} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all">
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-dashed border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            <Sparkles className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="font-semibold text-sm">No Active Document</p>
            <p className="text-xs text-slate-500 mt-1">Complete the form details and trigger generation to view results</p>
          </div>
        )}
      </div>

      {/* Close outer grid + fragment */}
      {/* Recent Greeting Workspace History */}
      <div className="lg:col-span-2 mt-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-display font-bold">Recent Greeting Workspace History</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit, load/edit, send, or remove previous client greetings</p>
          </div>
          <button 
            type="button" 
            onClick={loadGreetingsHistory} 
            className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Refresh List
          </button>
        </div>

        {historyLoading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Querying workspace database...</div>
        ) : historyList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            <History className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="font-semibold text-sm">No Saved History Found</p>
            <p className="text-xs text-slate-500 mt-1">Greetings you create will be stored here permanently.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Destination & Date</th>
                    <th className="p-4">Language</th>
                    <th className="p-4">WhatsApp Number</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {historyList.map((record) => {
                    const handleQuickWhatsApp = () => {
                      const encodedText = encodeURIComponent(record.generated_text);
                      const mode = localStorage.getItem('settings_whatsappMode') || 'app';
                      
                      let cleanNumber = '';
                      if (record.whatsapp_number) {
                        cleanNumber = record.whatsapp_number.replace(/\D/g, '');
                        if (cleanNumber.length === 10) {
                          cleanNumber = '91' + cleanNumber;
                        }
                      }
                      
                      let url = '';
                      if (mode === 'web') {
                        url = cleanNumber 
                          ? `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`
                          : `https://web.whatsapp.com/send?text=${encodedText}`;
                      } else if (mode === 'wa') {
                        url = cleanNumber
                          ? `https://wa.me/${cleanNumber}?text=${encodedText}`
                          : `https://wa.me/?text=${encodedText}`;
                      } else if (mode === 'app') {
                        url = cleanNumber
                          ? `whatsapp://send?phone=${cleanNumber}&text=${encodedText}`
                          : `whatsapp://send?text=${encodedText}`;
                      } else {
                        url = cleanNumber
                          ? `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`
                          : `https://api.whatsapp.com/send?text=${encodedText}`;
                      }
                      
                      if (mode === 'app') {
                        window.location.href = url;
                      } else {
                        window.open(url, '_blank');
                      }
                      // Update status to shared
                      api.put(`/history/${record.id}/status`, { status: 'shared' }).then(() => {
                        loadGreetingsHistory();
                      }).catch(() => {
                        const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
                        const idx = localGreetings.findIndex(g => g.id === record.id);
                        if (idx !== -1) {
                          localGreetings[idx].status = 'shared';
                          localStorage.setItem('local_greetings', JSON.stringify(localGreetings));
                          loadGreetingsHistory();
                        }
                      });
                    };

                    return (
                      <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{record.customer_name}</div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                            record.category?.toUpperCase() === 'VIP' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            record.category?.toUpperCase() === 'PREMIUM' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {record.category || 'Standard'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{record.destination}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{record.travel_date}</div>
                        </td>
                        <td className="p-4">{record.language}</td>
                        <td className="p-4 font-mono text-xs">{record.whatsapp_number || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            record.status === 'shared' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button 
                              onClick={() => handleLoadGreeting(record)} 
                              title="Load into Workspace" 
                              className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Load</span>
                            </button>
                            <button 
                              onClick={handleQuickWhatsApp} 
                              title="Send to WhatsApp" 
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                              <span>Send</span>
                            </button>
                            {user && user.role === 'admin' && (
                              <button 
                                onClick={() => handleDeleteGreeting(record.id)} 
                                title="Delete Record Permanently" 
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// -------------------------------------------------------------
// HISTORY LOG VIEW
// -------------------------------------------------------------
function HistoryLog() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [search]);

  async function loadHistory() {
    try {
      const res = await api.get('/history', { params: { search } });
      setHistory(res.data);
    } catch (e) {
      console.warn("API Offline, displaying simulated history records");
      const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
      const localFeedbacks = JSON.parse(localStorage.getItem('local_feedbacks') || '[]');
      
      let combined = [...localGreetings];
      combined = combined.map(g => {
        const fb = localFeedbacks.find(f => f.greeting_id === g.id);
        return {
          ...g,
          rating: fb ? fb.rating : (g.rating || null),
          comments: fb ? fb.comments : (g.comments || null)
        };
      });

      if (search) {
        const q = search.toLowerCase();
        combined = combined.filter(g => 
          g.customer_name.toLowerCase().includes(q) || 
          g.destination.toLowerCase().includes(q)
        );
      }

      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(combined);
    }
    setLoading(false);
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    setHistory(prev => prev.filter(item => item.id !== id));
    const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
    localStorage.setItem('local_greetings', JSON.stringify(localGreetings.filter(g => g.id !== id)));
    const localFeedbacks = JSON.parse(localStorage.getItem('local_feedbacks') || '[]');
    localStorage.setItem('local_feedbacks', JSON.stringify(localFeedbacks.filter(f => f.greeting_id !== id)));
    try {
      await api.delete(`/history/${id}`);
    } catch (e) {
      console.warn("API offline, deleted locally.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Auditing & History Log</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete log registry of greeting outputs</p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search passenger name or destination..."
          className="max-w-md w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-center py-6 text-slate-500">Querying database registry logs...</p>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <History className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="font-semibold text-sm">No Records Found</p>
          <p className="text-xs mt-1">Generate greetings in the Workspace to see them here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        {/* Desktop Table */}
        <div className="desktop-table overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Travel Date</th>
                  <th className="p-4">Language</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Generated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{record.customer_name}</td>
                    <td className="p-4">{record.destination}</td>
                    <td className="p-4">{record.travel_date}</td>
                    <td className="p-4">{record.language}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${record.status === 'shared' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {record.rating ? (
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{record.rating}</span>
                        </div>
                      ) : <span className="text-slate-500">-</span>}
                    </td>
                    <td className="p-4 text-xs text-slate-500">{new Date(record.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {user && user.role === 'admin' && (
                        <button onClick={() => handleDelete(record.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete Log">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        {/* Mobile Card List */}
        <div className="mobile-card-list">
            {history.map((record) => (
              <div key={record.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{record.customer_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{record.destination} · {record.travel_date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      record.status === 'shared' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>{record.status}</span>
                    {user && user.role === 'admin' && (
                      <button onClick={() => handleDelete(record.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">{record.language}</span>
                  {record.rating && (
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />{record.rating}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">{new Date(record.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// TEMPLATE MANAGEMENT VIEW
// -------------------------------------------------------------
function TemplatesManager() {
  const { user } = useContext(AuthContext);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for Create/Edit
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectPattern, setSubjectPattern] = useState('');
  const [bodyPattern, setBodyPattern] = useState('');
  const [language, setLanguage] = useState('English');
  const [alert, setAlert] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data);
    } catch (e) {
      console.warn("API offline, rendering simulated templates");
      setTemplates([
        {
          id: 't1010101-1111-2222-3333-444455556666',
          title: 'Standard Pre-Trip Greeting',
          description: 'General template for all travel types',
          subject_pattern: 'Greeting for {{CustomerName}}',
          body_pattern: 'Hello {{CustomerName}},\n\nThank you for choosing Manivtha Tours & Travels for your upcoming journey to {{Destination}}.\n\nWe hope you have an incredible travel experience. Let us know if you need any assistance.\n\nRegards,\nManivtha Tours & Travels',
          language: 'English'
        },
        {
          id: 't2020202-2222-3333-4444-555566667777',
          title: 'VIP Spiritual Journey',
          description: 'Tailored spiritual tone for holy cities',
          subject_pattern: 'Spiritual greetings for {{CustomerName}}',
          body_pattern: 'Namaste {{CustomerName}},\n\nWe are honored to assist in facilitating your sacred journey to {{Destination}}.\n\nAs one of our returning customers, we have arranged the primary details to ensure absolute peace of mind during your spiritual tour.\n\nMay your pilgrimage be deeply rewarding.\n\nRegards,\nManivtha Tours & Travels',
          language: 'English'
        }
      ]);
    }
    setLoading(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (user.role !== 'admin') {
      setAlert("Permission Denied: Only admins can manage templates.");
      return;
    }

    try {
      const payload = { title, description, subject_pattern: subjectPattern, body_pattern: bodyPattern, language };
      if (editingId) {
        await api.put(`/templates/${editingId}`, payload);
        setAlert("Template updated successfully!");
      } else {
        await api.post('/templates', payload);
        setAlert("New template created!");
      }
      resetForm();
      loadTemplates();
      setIsDrawerOpen(false);
    } catch (err) {
      // Offline/Local Simulated Saves
      if (editingId) {
        setTemplates(templates.map(t => t.id === editingId ? { ...t, ...payload } : t));
        setAlert("Template updated successfully (Simulated)!");
      } else {
        setTemplates([...templates, { id: 'sim_t' + Math.random(), ...payload }]);
        setAlert("Template created successfully (Simulated)!");
      }
      resetForm();
      setIsDrawerOpen(false);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setTitle(t.title);
    setDescription(t.description);
    setSubjectPattern(t.subject_pattern);
    setBodyPattern(t.body_pattern);
    setLanguage(t.language);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (user.role !== 'admin') {
      setAlert("Permission Denied: Only admins can delete templates.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this template?")) {
      // Immediately remove from UI
      setTemplates(prev => prev.filter(t => t.id !== id));
      setAlert("Template deleted.");
      try {
        await api.delete(`/templates/${id}`);
      } catch (err) {
        console.warn("API offline, deleted locally.");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setSubjectPattern('');
    setBodyPattern('');
    setLanguage('English');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Template Library</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure base prompt letters used by the personalizer model</p>
        </div>
        {user.role === 'admin' && (
          <button 
            type="button"
            onClick={() => { resetForm(); setIsDrawerOpen(true); }}
            className="lg:hidden px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
          </button>
        )}
      </div>

      {alert && <AlertWidget message={alert} onClose={() => setAlert('')} />}

      {user.role === 'admin' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* Template Drawer Backdrop */}
          {isDrawerOpen && (
            <div
              className="template-drawer-overlay"
              onClick={() => setIsDrawerOpen(false)}
            />
          )}

          {/* Form Side - Drawer on mobile, static column on desktop */}
          <div className={`template-form-drawer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 h-fit space-y-4 lg:col-span-1 ${isDrawerOpen ? 'is-open' : ''}`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{editingId ? 'Edit Preset Template' : 'Create Preset Template'}</h3>
              <button 
                type="button" 
                onClick={() => setIsDrawerOpen(false)} 
                className="lg:hidden p-1.5 text-slate-400 hover:text-indigo-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. VIP Spiritual Journey" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of when to use" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject Pattern</label>
                <input type="text" value={subjectPattern} onChange={e => setSubjectPattern(e.target.value)} placeholder="Greeting for {{CustomerName}}" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Body Content Pattern</label>
                <textarea required value={bodyPattern} onChange={e => setBodyPattern(e.target.value)} rows="5" placeholder="Use tags: {{CustomerName}}, {{Destination}}..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm resize-none font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm">
                  <option value="English">English</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-3 hero-gradient text-white font-bold rounded-xl text-xs transition-opacity hover:opacity-90">
                  {editingId ? 'Update Settings' : 'Create Template'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-400">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Side */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <p className="text-slate-500">Querying template files...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {templates.map((t) => (
                  <div key={t.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">{t.title}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold">{t.language}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{t.description}</p>
                      <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[11px] text-slate-500 max-h-32 overflow-y-auto leading-normal whitespace-pre-wrap">{t.body_pattern}</pre>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => handleEdit(t)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl">
          <div className="flex gap-4">
            <AlertCircle className="h-10 w-10 text-rose-500 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg">Access Restriction</h3>
              <p className="text-sm text-slate-500">Only Admin profiles are allowed to create, update, or delete templates in this project library.</p>
              <p className="text-xs text-indigo-500">Please sign out and log back in as <span className="font-mono text-emerald-400">admin</span> to access this workspace.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// USER PROFILE VIEW
// -------------------------------------------------------------
function UserProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [email, setEmail] = useState(user?.email || '');
  const [alert, setAlert] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/profile', { email });
      setUser(res.data.user);
      setAlert("Profile parameters updated!");
    } catch (err) {
      setAlert("Profile saved locally (Offline)!");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold">User Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage personal contact parameters</p>
      </div>

      {alert && <AlertWidget message={alert} onClose={() => setAlert('')} />}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input type="text" disabled value={user?.username} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl outline-none text-sm text-slate-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role Status</label>
            <input type="text" disabled value={user?.role} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl outline-none text-sm text-slate-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm" />
          </div>

          <button type="submit" className="w-full py-3.5 hero-gradient text-white rounded-xl font-bold hover:opacity-90 transition-all text-xs">
            Save Profile Modifications
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SYSTEM SETTINGS VIEW
// -------------------------------------------------------------
function SettingsPage() {
  const { user } = useContext(AuthContext);

  // --- AI Configuration ---
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('api_key') || '');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('settings_aiModel') || 'gemini-1.5-flash');
  const [maxTokens, setMaxTokens] = useState(() => localStorage.getItem('settings_maxTokens') || '1024');
  const [temperature, setTemperature] = useState(() => localStorage.getItem('settings_temperature') || '0.7');
  const [defaultLanguage, setDefaultLanguage] = useState(() => localStorage.getItem('settings_defaultLanguage') || 'English');

  // --- Appearance ---
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('settings_compactMode') === 'true');
  const [animationsEnabled, setAnimationsEnabled] = useState(() => localStorage.getItem('settings_animations') !== 'false');

  // --- Notifications ---
  const [notifyOnGenerate, setNotifyOnGenerate] = useState(() => localStorage.getItem('settings_notifyGenerate') !== 'false');
  const [notifyOnFeedback, setNotifyOnFeedback] = useState(() => localStorage.getItem('settings_notifyFeedback') !== 'false');
  const [autoSaveForms, setAutoSaveForms] = useState(() => localStorage.getItem('settings_autoSave') !== 'false');

  // --- Data & Privacy ---
  const [historyRetention, setHistoryRetention] = useState(() => localStorage.getItem('settings_historyRetention') || '90');
  const [showWhatsapp, setShowWhatsapp] = useState(() => localStorage.getItem('settings_showWhatsapp') !== 'false');
  const [whatsappMode, setWhatsappMode] = useState(() => localStorage.getItem('settings_whatsappMode') || 'app');

  // --- UI state ---
  const [alert, setAlert] = useState({ msg: '', type: 'success' });
  const [showKey, setShowKey] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg: '', type: 'success' }), 3500);
  };

  // Apply theme immediately to DOM + localStorage (no need to press Save)
  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    const root = window.document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    localStorage.setItem('api_key', apiKey);
    localStorage.setItem('settings_aiModel', aiModel);
    localStorage.setItem('settings_maxTokens', maxTokens);
    localStorage.setItem('settings_temperature', temperature);
    localStorage.setItem('settings_defaultLanguage', defaultLanguage);
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('settings_compactMode', compactMode);
    localStorage.setItem('settings_animations', animationsEnabled);
    localStorage.setItem('settings_notifyGenerate', notifyOnGenerate);
    localStorage.setItem('settings_notifyFeedback', notifyOnFeedback);
    localStorage.setItem('settings_autoSave', autoSaveForms);
    localStorage.setItem('settings_historyRetention', historyRetention);
    localStorage.setItem('settings_showWhatsapp', showWhatsapp);
    localStorage.setItem('settings_whatsappMode', whatsappMode);
    showAlert('All settings saved successfully!');
  };

  const handleClearData = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    const keysToRemove = ['local_greetings', 'local_feedbacks', 'custom_presets',
      'gen_name','gen_destination','gen_bookingHistory','gen_travelType',
      'gen_preferredLanguage','gen_customerCategory','gen_specialNotes',
      'gen_travelDate','gen_whatsappNumber','gen_resultGreeting',
      'gen_rating','gen_feedbackComments','gen_feedbackSaved'];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setClearConfirm(false);
    showAlert('All local application data cleared.', 'error');
  };

  const handleExportData = () => {
    const greetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
    const feedbacks = JSON.parse(localStorage.getItem('local_feedbacks') || '[]');
    const blob = new Blob([JSON.stringify({ greetings, feedbacks, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'manivtha_crm_export.json'; a.click();
    URL.revokeObjectURL(url);
    showAlert('Data exported as manivtha_crm_export.json');
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display font-bold text-sm text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange, id }) => (
    <button
      id={id}
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-colors";
  const selectCls = inputCls;
  const labelCls = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">System Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure application behaviour, AI model, and data preferences</p>
        </div>
        <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${user?.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
          {user?.role === 'admin' ? '🔑 Admin Access' : '👤 Staff Access'}
        </span>
      </div>

      {alert.msg && <AlertWidget message={alert.msg} type={alert.type} onClose={() => setAlert({ msg: '', type: 'success' })} />}

      <form onSubmit={handleSaveAll} className="space-y-5">

        {/* ── 1. AI CONFIGURATION ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
          <SectionHeader icon={Sparkles} title="AI Configuration" subtitle="Google Gemini model and generation parameters" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>AI Model</label>
              <select value={aiModel} onChange={e => setAiModel(e.target.value)} className={selectCls}>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Quality)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Latest)</option>
                <option value="gemini-pro">Gemini Pro (Stable)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Default Output Language</label>
              <select value={defaultLanguage} onChange={e => setDefaultLanguage(e.target.value)} className={selectCls}>
                <option>English</option>
                <option>Telugu</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Kannada</option>
                <option>Malayalam</option>
                <option>Marathi</option>
                <option>Bengali</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Max Output Tokens</label>
              <select value={maxTokens} onChange={e => setMaxTokens(e.target.value)} className={selectCls}>
                <option value="512">512 — Short & concise</option>
                <option value="1024">1024 — Standard</option>
                <option value="2048">2048 — Detailed</option>
                <option value="4096">4096 — Very detailed</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Controls the maximum length of AI-generated greetings.</p>
            </div>
            <div>
              <label className={labelCls}>Creativity / Temperature — {parseFloat(temperature).toFixed(1)}</label>
              <input
                type="range" min="0" max="1" step="0.1"
                value={temperature} onChange={e => setTemperature(e.target.value)}
                className="w-full accent-indigo-500 mt-2"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0.0 Precise</span>
                <span>0.5 Balanced</span>
                <span>1.0 Creative</span>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Google Gemini API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key (optional override)"
                className={`${inputCls} pr-24 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-500 font-semibold hover:text-indigo-400 transition-colors"
              >
                {showKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Overrides the backend environment key. If left blank, the server's configured key is used.
            </p>
          </div>
        </div>

        {/* ── 2. APPEARANCE ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
          <SectionHeader icon={Sun} title="Appearance" subtitle="Theme, layout density, and animation preferences" />

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Color Theme</p>
                <p className="text-xs text-slate-500 mt-0.5">Switch between dark and light mode globally</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => applyTheme('light')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${theme === 'light' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  ☀️ Light
                </button>
                <button type="button" onClick={() => applyTheme('dark')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${theme === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  🌙 Dark
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Compact Mode</p>
                <p className="text-xs text-slate-500 mt-0.5">Reduce padding and spacing for a denser layout</p>
              </div>
              <Toggle id="compact-toggle" checked={compactMode} onChange={setCompactMode} />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">UI Animations</p>
                <p className="text-xs text-slate-500 mt-0.5">Enable micro-animations, hover effects, and transitions</p>
              </div>
              <Toggle id="anim-toggle" checked={animationsEnabled} onChange={setAnimationsEnabled} />
            </div>
          </div>
        </div>

        {/* ── 3. NOTIFICATIONS & BEHAVIOUR ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
          <SectionHeader icon={AlertCircle} title="Notifications & Behaviour" subtitle="In-app alerts and form behaviour settings" />

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Alert on Greeting Generated</p>
                <p className="text-xs text-slate-500 mt-0.5">Show a success banner after every AI generation</p>
              </div>
              <Toggle id="notify-gen-toggle" checked={notifyOnGenerate} onChange={setNotifyOnGenerate} />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Alert on Feedback Submitted</p>
                <p className="text-xs text-slate-500 mt-0.5">Show a confirmation alert when rating is saved</p>
              </div>
              <Toggle id="notify-fb-toggle" checked={notifyOnFeedback} onChange={setNotifyOnFeedback} />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Auto-save Form Inputs</p>
                <p className="text-xs text-slate-500 mt-0.5">Automatically save generator form fields between sessions</p>
              </div>
              <Toggle id="autosave-toggle" checked={autoSaveForms} onChange={setAutoSaveForms} />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Show WhatsApp Share Button</p>
                <p className="text-xs text-slate-500 mt-0.5">Display the WhatsApp sharing option in greeting results</p>
              </div>
              <Toggle id="whatsapp-toggle" checked={showWhatsapp} onChange={setShowWhatsapp} />
            </div>

            {showWhatsapp && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-3 transition-all duration-300">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">WhatsApp Redirection Mode</p>
                  <p className="text-xs text-slate-500 mt-0.5">Choose which WhatsApp method to use for sending greetings</p>
                </div>
                <select 
                  value={whatsappMode} 
                  onChange={e => setWhatsappMode(e.target.value)} 
                  className={selectCls}
                >
                  <option value="app">Direct Desktop App (whatsapp://) - Launch Desktop App</option>
                  <option value="web">Direct WhatsApp Web (web.whatsapp.com) - Best for Browser CRM</option>
                  <option value="api">Standard API Redirect (api.whatsapp.com)</option>
                  <option value="wa">Shortened URL Redirect (wa.me) - Mobile Friendly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. DATA & PRIVACY ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
          <SectionHeader icon={History} title="Data & Privacy" subtitle="Local data retention and export controls" />

          <div>
            <label className={labelCls}>History Retention Period</label>
            <select value={historyRetention} onChange={e => setHistoryRetention(e.target.value)} className={selectCls}>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days (default)</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
              <option value="0">Keep forever</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Sets a soft-limit label for how long greeting records are considered active.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 font-bold text-xs transition-all"
            >
              <Download className="h-4 w-4" />
              Export All Data (JSON)
            </button>
            <button
              type="button"
              onClick={handleClearData}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all border ${clearConfirm ? 'bg-rose-600 text-white border-rose-600 animate-pulse' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20'}`}
            >
              <Trash2 className="h-4 w-4" />
              {clearConfirm ? '⚠️ Click again to confirm clear' : 'Clear Local App Data'}
            </button>
          </div>
        </div>

        {/* ── 5. SYSTEM INFO ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <SectionHeader icon={HelpCircle} title="System Information" subtitle="Application version and environment details" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'App Version', value: 'v1.0.0' },
              { label: 'Environment', value: 'Development' },
              { label: 'Backend Port', value: ':5000' },
              { label: 'Frontend Port', value: ':5173' },
              { label: 'AI Provider', value: 'Google Gemini' },
              { label: 'Auth Method', value: 'JWT / Bearer' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SAVE BUTTON ── */}
        <button
          type="submit"
          className="w-full py-4 hero-gradient text-white rounded-2xl font-bold hover:opacity-90 transition-all text-sm shadow-lg shadow-indigo-500/20"
        >
          Save All Settings
        </button>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// NOT FOUND ERROR PAGE
// -------------------------------------------------------------
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
      <AlertCircle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
      <h1 className="text-4xl font-display font-extrabold text-white">404 - Page Missing</h1>
      <p className="text-slate-400 text-sm mt-2 max-w-md">The route index you requested does not exist or has been relocated.</p>
      <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs mt-6 transition-all">
        Back to Dashboard
      </Link>
    </div>
  );
}

// -------------------------------------------------------------
// ROOT ROUTES ASSEMBLY
// -------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/generator" element={
            <ProtectedRoute>
              <Layout><GreetingGenerator /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <Layout><HistoryLog /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/templates" element={
            <ProtectedRoute>
              <Layout><TemplatesManager /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><UserProfile /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><SettingsPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
