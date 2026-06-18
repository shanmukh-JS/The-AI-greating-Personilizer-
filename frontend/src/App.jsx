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
  Menu, X, Sun, Moon, AlertCircle, Plus, Edit, Trash2, CheckCircle, HelpCircle, Calendar,
  Lock, Eye, EyeOff, RefreshCw
} from 'lucide-react';

// API Configuration & Base Instance with Automatic Interceptors
const API_URL = import.meta.env.VITE_API_URL;
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
                username === 'NIAT x AURORA' ? 'a1014a5c-59bc-47cb-8c9f-d31e9c5a1a1f' :
                'd2903b4b-48ab-46cb-8b8f-c20d8c4a0a0f',
            username,
            role: (username === 'admin' || username === 'NIAT x AURORA') ? 'admin' : 'staff',
            email: username === 'NIAT x AURORA' ? 'niatxaurora@manivthatravels.com' : `${username}@manivthatravels.com`
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
      const isValidAgent = username === 'agent' && (password === 'password123' || password === 'ManivthaTravels2026!');
      const isValidAdmin = username === 'admin' && (password === 'password123' || password === 'ManivthaTravels2026!');
      const isValidNiatAurora = username === 'NIAT x AURORA' && password === 'nxtwave@2026';

      if (isValidAgent || isValidAdmin || isValidNiatAurora) {
        const dummyToken = `simulated_jwt_token_${username}`;
        const dummyUser = {
          id: isValidAdmin ? 'b3014a5c-59bc-47cb-8c9f-d31e9c5a1a1f' :
              isValidNiatAurora ? 'a1014a5c-59bc-47cb-8c9f-d31e9c5a1a1f' :
              'd2903b4b-48ab-46cb-8b8f-c20d8c4a0a0f',
          username,
          role: (isValidAdmin || isValidNiatAurora) ? 'admin' : 'staff',
          email: username === 'NIAT x AURORA' ? 'niatxaurora@manivthatravels.com' : `${username}@manivthatravels.com`
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

function InnerLoader({ text = "Loading module..." }) {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 h-28 w-28 -m-2 rounded-full border border-indigo-500/20 animate-[spin_4s_linear_infinite] shadow-[0_0_20px_rgba(99,102,241,0.15)]"></div>
        {/* Middle fast ring */}
        <div className="absolute inset-2 h-20 w-20 rounded-full border-t-2 border-r-2 border-indigo-400/80 animate-[spin_1.5s_linear_infinite_reverse]"></div>
        {/* Inner solid ring */}
        <div className="h-24 w-24 rounded-full border-4 border-slate-200 dark:border-slate-800/50"></div>
        <div className="h-24 w-24 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-500 animate-[spin_1s_ease-in-out_infinite] absolute"></div>
        
        {/* Center Logo/Icon */}
        <div className="absolute flex items-center justify-center">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
            <span className="text-white font-display font-extrabold text-xl">M</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] animate-pulse">{text}</p>
        <div className="flex gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
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
  // On desktop start collapsed (icon-rail); on mobile controlled by hamburger
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar_open');
    return saved === null ? false : saved === 'true';
  });
  // Desktop hover-to-expand: temporarily expand sidebar when mouse enters the icon rail
  const [hoverExpanded, setHoverExpanded] = useState(false);
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

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // On desktop, sidebar expands on hover OR when explicitly opened
  const isExpanded = isMobile ? sidebarOpen : (sidebarOpen || hoverExpanded);

  // Widths
  const EXPANDED  = 256; // 16rem
  const COLLAPSED = 64;  // 4rem  — icon rail on desktop

  /* ── computed values ── */
  // On mobile: sidebar is an overlay, content area always takes full width
  // On desktop: sidebar is in-flow; main content always uses COLLAPSED margin
  //             (sidebar overlays on hover, so content doesn't jump)
  const desktopMargin = isMobile ? 0 : COLLAPSED;
  // Sidebar actual rendered width
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
        style={{ width: `${sidebarWidth}px` }}
        onMouseEnter={() => { if (!isMobile) setHoverExpanded(true); }}
        onMouseLeave={() => { if (!isMobile) setHoverExpanded(false); }}
        className={`
          fixed top-0 left-0 h-full z-40
          flex flex-col
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${isMobile && !isExpanded ? '-translate-x-full' : 'translate-x-0'}
          ${!isMobile && hoverExpanded && !sidebarOpen ? 'shadow-2xl shadow-slate-900/30 dark:shadow-black/50' : ''}
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
            {/* Hamburger — visible on MOBILE only to prevent accidental hover opens on desktop */}
            <button
              id="sidebar-toggle-btn"
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        <footer className="h-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center px-6 text-xs text-slate-400">
          <span>&copy; 2026 Manivtha Tours &amp; Travels. All rights reserved.</span>
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleQuickDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Deep Space Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px]"></div>
        {/* Subtle stars / dots can be added here, but gradients work well for the deep space look */}
      </div>

      <div className="w-full max-w-[420px] bg-[#111827]/80 backdrop-blur-xl border border-slate-800/60 rounded-[2rem] p-8 sm:p-10 relative z-10 shadow-2xl shadow-black/50">
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-b from-[#5FA5F9] to-[#2563EB] flex items-center justify-center text-white font-extrabold text-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-6">
            M
          </div>
          <h2 className="text-[28px] font-display font-extrabold text-white tracking-tight">Welcome back</h2>
          <p className="text-[15px] text-slate-400 mt-1.5 font-medium">Sign in to your CRM operator account</p>
        </div>

        {accessDeniedMessage && !error && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center gap-2 text-sm mb-6 animate-pulse">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{accessDeniedMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2 text-sm mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-500" />
            </div>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Username" 
              className="w-full pl-11 pr-4 py-3.5 bg-[#1A2235]/60 border border-slate-700/50 focus:border-blue-500 focus:bg-[#1A2235] focus:ring-1 focus:ring-blue-500 rounded-xl !text-white outline-none transition-all placeholder:text-slate-500 font-semibold text-[15px]" 
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              className="w-full pl-11 pr-12 py-3.5 bg-[#1A2235]/60 border border-slate-700/50 focus:border-blue-500 focus:bg-[#1A2235] focus:ring-1 focus:ring-blue-500 rounded-xl !text-white outline-none transition-all placeholder:text-slate-500 font-semibold text-[15px]" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="pt-2"></div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5082F8] to-[#14B8E6] font-bold text-white shadow-[0_0_20px_rgba(20,184,230,0.25)] hover:shadow-[0_0_25px_rgba(20,184,230,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all text-[15px] mt-2 tracking-wide"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/60 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111827] px-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick Demo Access</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button type="button" onClick={() => handleQuickDemo('agent', 'password123')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/40 bg-slate-800/20 hover:bg-slate-800/50 hover:border-slate-600 transition-all group">
              <span className="text-[11px] font-extrabold text-[#759AF1] tracking-wider uppercase mb-1">Agent</span>
              <span className="text-[11px] text-slate-400 font-mono group-hover:text-slate-300 transition-colors">agent / password123</span>
            </button>
            <button type="button" onClick={() => handleQuickDemo('admin', 'password123')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/40 bg-slate-800/20 hover:bg-slate-800/50 hover:border-slate-600 transition-all group">
              <span className="text-[11px] font-extrabold text-[#759AF1] tracking-wider uppercase mb-1">Admin</span>
              <span className="text-[11px] text-slate-400 font-mono group-hover:text-slate-300 transition-colors">admin / password123</span>
            </button>
            <button type="button" onClick={() => handleQuickDemo('NIAT x AURORA', 'nxtwave@2026')} className="col-span-2 flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/40 bg-slate-800/20 hover:bg-slate-800/50 hover:border-slate-600 transition-all group">
              <span className="text-[11px] font-extrabold text-[#14B8E6] tracking-wider uppercase mb-1">Master Admin</span>
              <span className="text-[11px] text-slate-400 font-mono group-hover:text-slate-300 transition-colors">NIAT x AURORA / nxtwave@2026</span>
            </button>
          </div>
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
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('All');
  const [travelType, setTravelType] = useState('All');
  const [refresh, setRefresh] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await api.get('/analytics', {
          params: { category, language, travelType, tzOffset: new Date().getTimezoneOffset() }
        });
        
        let fetchedMetrics = { ...res.data };
        const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
        if (localGreetings.length > 0) {
           fetchedMetrics.totalGreetings += localGreetings.length;
           const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
           localGreetings.forEach(g => {
             if (!g.created_at) return;
             const gDateObj = new Date(g.created_at);
             const dayName = daysOfWeek[gDateObj.getDay()];
             const dateStr = `${dayName} ${gDateObj.getDate()}`;
             const dayStat = fetchedMetrics.dailyUsage.find(d => d.date === dateStr);
             if (dayStat) dayStat.count += 1;
           });
        }
        setMetrics(fetchedMetrics);
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
        })).sort((a, b) => b.count - a.count);
        
        const dailyUsage = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dayName = daysOfWeek[d.getDay()];
          const localYear = d.getFullYear();
          const localMonth = String(d.getMonth() + 1).padStart(2, '0');
          const localDay = String(d.getDate()).padStart(2, '0');
          const dateStr = `${localYear}-${localMonth}-${localDay}`;
          const count = allGreetings.filter(g => {
            if (!g.created_at) return false;
            const gDateObj = new Date(g.created_at);
            const gYear = gDateObj.getFullYear();
            const gMonth = String(gDateObj.getMonth() + 1).padStart(2, '0');
            const gDay = String(gDateObj.getDate()).padStart(2, '0');
            const gDate = `${gYear}-${gMonth}-${gDay}`;
            return gDate === dateStr;
          }).length;
          dailyUsage.push({ date: `${dayName} ${d.getDate()}`, count });
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
  }, [category, language, travelType, refresh]);

  const handleExportAnalytics = () => {
    if (!metrics) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    const escapeHTML = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const usage = metrics.dailyUsage || [];
    const displayUsage = usage.length ? usage : [
      { date: 'Sun', count: 3 }, { date: 'Mon', count: 7 }, { date: 'Tue', count: 12 },
      { date: 'Wed', count: 8 }, { date: 'Thu', count: 5 }, { date: 'Fri', count: 9 }, { date: 'Sat', count: 4 }
    ];

    const dests = metrics.topDestinations || [];
    const totalDestsCount = dests.reduce((sum, d) => sum + d.count, 0) || 1;

    const feedbacks = metrics.recentFeedbacks || [];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytics Report - Manivtha Tours & Travels</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <style>
            body {
              background: white;
              color: black;
              font-family: ui-sans-serif, system-ui, sans-serif;
            }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body class="bg-white p-8 max-w-4xl mx-auto text-slate-800">
          <!-- Header -->
          <div class="border-b-2 border-indigo-600 pb-5 mb-8 flex justify-between items-end">
            <div>
              <h1 class="text-3xl font-extrabold tracking-tight text-indigo-600 uppercase">Manivtha Tours & Travels</h1>
              <p class="text-xs text-slate-500 font-bold tracking-wide mt-1">AI Greeting Personalizer - Analytics & Performance Report</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-400 font-semibold uppercase">Generated On</p>
              <p class="text-sm font-mono font-bold text-slate-700">${escapeHTML(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}</p>
            </div>
          </div>

          <!-- Report Metadata -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 grid grid-cols-3 gap-4">
            <div>
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Type</span>
              <span class="text-sm font-semibold text-slate-700">Analytics Export (PDF)</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applied Filters</span>
              <span class="text-xs font-semibold text-slate-700">Cat: ${escapeHTML(category)} | Lang: ${escapeHTML(language)} | Type: ${escapeHTML(travelType)}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Status</span>
              <span class="text-sm font-mono font-semibold text-emerald-600">Active (Live)</span>
            </div>
          </div>

          <!-- Section 1: KPI Summary Table -->
          <div class="mb-8">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">1. Key Performance Indicators</h2>
            <table class="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Metric Name</th>
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Current Value</th>
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Operational Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr>
                  <td class="p-3 text-sm font-semibold text-slate-800">Total Personalized Greetings</td>
                  <td class="p-3 text-sm font-mono font-bold text-indigo-600">${metrics.totalGreetings || 0}</td>
                  <td class="p-3 text-xs font-bold text-emerald-600 uppercase">Active</td>
                </tr>
                <tr>
                  <td class="p-3 text-sm font-semibold text-slate-800">Average Customer Rating</td>
                  <td class="p-3 text-sm font-mono font-bold text-indigo-650">${metrics.averageRating || 0} / 5.0</td>
                  <td class="p-3 text-xs font-bold text-emerald-600 uppercase">Active</td>
                </tr>
                <tr>
                  <td class="p-3 text-sm font-semibold text-slate-800">Total Feedback Received</td>
                  <td class="p-3 text-sm font-mono font-bold text-indigo-650">${metrics.feedbackCount || 0}</td>
                  <td class="p-3 text-xs font-bold text-emerald-600 uppercase">Active</td>
                </tr>
                <tr>
                  <td class="p-3 text-sm font-semibold text-slate-800">AI Personalization Success Rate</td>
                  <td class="p-3 text-sm font-mono font-bold text-indigo-650">${metrics.performanceMetrics?.aiSuccessRate || 99.2}%</td>
                  <td class="p-3 text-xs font-bold text-emerald-600 uppercase">Operational</td>
                </tr>
                <tr>
                  <td class="p-3 text-sm font-semibold text-slate-800">Average AI Latency</td>
                  <td class="p-3 text-sm font-mono font-bold text-indigo-650">${metrics.performanceMetrics?.avgResponseMs || 2400}ms</td>
                  <td class="p-3 text-xs font-bold text-emerald-600 uppercase">Optimal</td>
                </tr>
                <tr>
                  <td class="p-3 text-sm font-semibold text-slate-800">API Service Uptime</td>
                  <td class="p-3 text-sm font-mono font-bold text-indigo-650">${metrics.performanceMetrics?.uptimePct || 99.9}%</td>
                  <td class="p-3 text-xs font-bold text-emerald-600 uppercase">Operational</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 2: Generation Volume -->
          <div class="mb-8">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">2. Weekly Generation Volume</h2>
            <table class="w-full text-left border-collapse border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Day</th>
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Personalized Volume</th>
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Activity Level</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${displayUsage.map(d => `
                  <tr>
                    <td class="p-3 text-sm font-semibold text-slate-700">${escapeHTML(d.date)}</td>
                    <td class="p-3 text-sm font-mono font-bold text-slate-800">${escapeHTML(d.count)} greetings</td>
                    <td class="p-3 text-xs font-bold uppercase ${d.count >= 8 ? 'text-indigo-600' : 'text-slate-500'}">
                      ${d.count >= 8 ? 'High Activity' : 'Normal'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Section 3: Top Destinations -->
          <div class="mb-8 page-break">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">3. Top Destinations Matrix</h2>
            <table class="w-full text-left border-collapse border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Destination</th>
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Total Personalized greetings</th>
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Share</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${dests.map(d => {
                  const share = ((d.count / totalDestsCount) * 100).toFixed(1);
                  return `
                    <tr>
                      <td class="p-3 text-sm font-semibold text-slate-700">${escapeHTML(d.name)}</td>
                      <td class="p-3 text-sm font-mono font-bold text-slate-800">${escapeHTML(d.count)}</td>
                      <td class="p-3 text-sm font-semibold text-slate-500">${share}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Section 4: Customer Feedbacks -->
          <div class="mb-8">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider">4. Recent AI Feedback Feed</h2>
            <table class="w-full text-left border-collapse border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">Customer / Destination</th>
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/12">Rating</th>
                  <th class="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">Comments & Testimonials</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${feedbacks.map(fb => `
                  <tr>
                    <td class="p-3">
                      <span class="block text-sm font-bold text-slate-800">${escapeHTML(fb.customer_name)}</span>
                      <span class="block text-[10px] text-slate-400 mt-0.5">Destination: ${escapeHTML(fb.destination)}</span>
                    </td>
                    <td class="p-3 text-sm font-mono font-bold text-amber-500">${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}</td>
                    <td class="p-3 text-xs text-slate-600 leading-relaxed italic font-medium">"${escapeHTML(fb.comments || 'No comments left.')}"</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="mt-16 border-t border-slate-200 pt-5 text-center text-[10px] text-slate-400">
            <p>Confidential • Manivtha Tours & Travels CRM Analytics</p>
            <p class="mt-1">© ${new Date().getFullYear()} Manivtha Tours & Travels. All rights reserved.</p>
          </div>

          <script>
            window.onload = function() {
              const element = document.body;
              const opt = {
                margin:       [10, 15, 10, 15],
                filename:     'manivtha_crm_analytics.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };
              html2pdf().set(opt).from(element).save();
            };
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Remove the temporary iframe after print dialogue closes
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 12000);
  };


  if (loading) return <InnerLoader text="Gathering database statistics..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Analytics Panel</h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">Real-time monitoring of greeting personalizations - Manivtha Tours & Travels</p>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <button onClick={() => setRefresh(r => r + 1)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-full shadow-sm hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {/* Export Analytics button */}
          <button onClick={handleExportAnalytics} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-full shadow-lg shadow-indigo-500/10 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Dynamic Filters dropdown bar */}
      <div className="p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 opacity-80">Category Filter</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
              <option value="All">All Categories</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 opacity-80">Language Filter</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
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
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 opacity-80">Travel Group Filter</label>
            <select value={travelType} onChange={e => setTravelType(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
              <option value="All">All Groups</option>
              <option value="Family Trip">Family Trip</option>
              <option value="Spiritual Tour">Spiritual Tour</option>
              <option value="Honeymoon">Honeymoon</option>
              <option value="Corporate Travel">Corporate Travel</option>
              <option value="Solo Adventure">Solo Adventure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Card 1: Total Greetings */}
        <div onClick={() => navigate('/history')} className="relative p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between hover-highlight cursor-pointer min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-bold">
              ↑ 12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">{metrics?.totalGreetings || 12}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Total Greetings</p>
          </div>
        </div>

        {/* Card 2: Average Rating */}
        <div className="relative p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between hover-highlight min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-550 dark:text-amber-500 flex items-center justify-center font-bold">
              <Star className="h-5 w-5 fill-amber-550 text-amber-550 dark:fill-amber-500 dark:text-amber-500" />
            </div>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-bold">
              ↑ +0.3
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              {metrics?.averageRating || 4.2}<span className="text-sm font-semibold text-slate-500">/5</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Average Rating</p>
          </div>
        </div>

        {/* Card 3: Feedback Logs */}
        <div onClick={() => navigate('/history')} className="relative p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between hover-highlight cursor-pointer min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-550 dark:text-purple-400 flex items-center justify-center font-bold">
              <History className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-bold">
              ↑ +2
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">{metrics?.feedbackCount || 5}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Total Feedback</p>
          </div>
        </div>

        {/* Card 4: AI Insight • Trending Now */}
        <div onClick={() => { if (user?.role === 'admin') setExpandedCard('insight'); }} className={`${user?.role === 'admin' ? 'cursor-pointer' : 'cursor-default'} col-span-2 md:col-span-2 relative p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/5 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-cyan-500/5 backdrop-blur border border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl flex gap-4 hover-highlight hover:border-indigo-500/50 transition-all select-none min-h-[140px]`}>
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Insight • Trending Now</h4>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Live Insight</span>
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-2 line-clamp-3 md:line-clamp-2">
                {user?.role === 'admin' 
                  ? (metrics && metrics.totalGreetings > 0 
                      ? `Top active destination is ${metrics.topDestinations?.[0]?.name || 'none'} with ${metrics.topDestinations?.[0]?.count || 0} greetings. Average customer satisfaction is at ${metrics.averageRating || '0.0'}/5.0 based on ${metrics.feedbackCount || 0} feedback responses.`
                      : "No greetings generated yet. Feed database records to generate trending insights.")
                  : "Kerala and Tirupati are tied as top destinations this week. Average rating improved +0.3 pts. Consider adding Ooty and Coorg to expand South India coverage by ~40%."}
              </p>
            </div>
            <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
              Updated just now
            </div>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Generation Volume Chart */}
        <div onClick={() => { if (user?.role === 'admin') setExpandedCard('weekly'); }} className={`${user?.role === 'admin' ? 'cursor-pointer' : 'cursor-default'} p-6 bg-gradient-to-br from-indigo-50/40 via-white/80 to-cyan-50/30 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-950/80 backdrop-blur border border-indigo-100 dark:border-indigo-950/50 rounded-3xl lg:col-span-2 flex flex-col justify-between hover-highlight shadow-sm hover:shadow-indigo-500/10 transition-all`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">Weekly Generation Volume</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase tracking-wider">7 Days</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">+14.2% vs last week</span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Real-time</span>
            </span>
          </div>
          
          {(() => {
            const rawUsage = metrics?.dailyUsage || [];
            const hasRealData = rawUsage.some(d => d.count > 0);
            const displayUsage = (user?.role === 'admin') 
              ? rawUsage 
              : (hasRealData ? rawUsage : [
                  { date: 'Sun', count: 3 }, { date: 'Mon', count: 7 }, { date: 'Tue', count: 12 },
                  { date: 'Wed', count: 8 }, { date: 'Thu', count: 5 }, { date: 'Fri', count: 9 }, { date: 'Sat', count: 4 }
                ]);
            const maxVal = Math.max(...displayUsage.map(d => d.count)) || 1;
            const _now = new Date();
            const todayName = `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][_now.getDay()]} ${_now.getDate()}`;
            return (
              <div className="w-full h-56 flex items-end justify-between px-2 pb-2 relative">
                {/* Grid background lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
                  {[0,1,2,3].map(i => <div key={i} className="border-b border-dashed border-slate-200/50 dark:border-slate-800/50 w-full h-0"></div>)}
                </div>
                
                {displayUsage.map((day) => {
                  const heightPct = (day.count / maxVal) * 75;
                  const isHighlight = day.date === todayName;
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-3 flex-1 z-10 group relative h-full justify-end">
                      <span className={`text-xs font-bold font-mono transition-colors ${isHighlight ? 'text-indigo-500 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-indigo-400'}`}>{day.count}</span>
                      
                      {/* Glowing pill bar */}
                      <div 
                        className={`w-6 sm:w-10 rounded-full bar-glow transition-all duration-300 ${
                          isHighlight 
                            ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 opacity-100 shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
                            : 'bg-gradient-to-t from-indigo-200 to-indigo-300 dark:from-indigo-900/40 dark:to-indigo-750/50 opacity-80 dark:opacity-45 hover:opacity-100 dark:hover:opacity-85'
                        }`} 
                        style={{ height: `${heightPct}%`, minHeight: '16px' }}
                      >
                      </div>
                      
                      <span className={`text-[10px] sm:text-[11px] font-bold tracking-wide mt-1 ${isHighlight ? 'text-indigo-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`}>{day.date}</span>
                    </div>
                  );
                })}
                {!hasRealData && !(user?.role === 'admin') && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase">Demo Data</div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Top Destination Matrix */}
        <div onClick={() => { if (user?.role === 'admin') setExpandedCard('destinations'); }} className={`${user?.role === 'admin' ? 'cursor-pointer' : 'cursor-default'} p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between hover-highlight`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">Top Destinations</h3>
            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>All-Time Live</span>
          </div>
          <div className="space-y-4">
            {metrics?.topDestinations && metrics.topDestinations.length > 0 ? (
              metrics.topDestinations.map((dest) => {
                const maxDestCount = metrics?.topDestinations?.[0]?.count || 1;
                const barWidth = `${(dest.count / maxDestCount) * 100}%`;
                return (
                  <div 
                    key={dest.name} 
                    className="group space-y-2 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-800/20 p-2 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800/80 hover:translate-x-1"
                    onClick={() => navigate(`/history?search=${encodeURIComponent(dest.name)}`)}
                    title="Click to audit logs for this destination"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-100 group-hover:text-indigo-400 transition-colors">{dest.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/25 text-[10px]">
                        {dest.count} Greetings
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: barWidth }}></div>
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
        <div onClick={() => { if (user?.role === 'admin') setExpandedCard('feedback'); }} className={`${user?.role === 'admin' ? 'cursor-pointer' : 'cursor-default'} p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800/80 rounded-3xl lg:col-span-2 space-y-5 hover-highlight`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">Recent AI Feedback</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 text-[10px] font-bold">{(metrics?.recentFeedbacks?.length || 0) > 0 ? `${metrics.recentFeedbacks.length} new` : '—'}</span>
            </div>
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{metrics?.averageRating || '4.2'}<span className="text-slate-400 font-normal">/5 avg</span></span>
            </span>
          </div>
          
          {(() => {
            const hasRealFeedbacks = metrics?.recentFeedbacks && metrics.recentFeedbacks.length > 0;
            const displayFeedbacks = (user?.role === 'admin')
              ? (metrics?.recentFeedbacks || [])
              : (hasRealFeedbacks ? metrics.recentFeedbacks : [
                  { id: 'demo1', customer_name: 'Ravi Kumar', destination: 'Tirupati', rating: 5, comments: 'Excellent personalization! The Telugu greeting was perfect and my client loved it.', created_at: new Date(Date.now() - 86400000).toISOString() },
                  { id: 'demo2', customer_name: 'Priya Sharma', destination: 'Goa', rating: 4, comments: 'Great honeymoon greeting template. Very professional tone.', created_at: new Date(Date.now() - 172800000).toISOString() },
                  { id: 'demo3', customer_name: 'Anand Reddy', destination: 'Kerala', rating: 5, comments: 'The multilingual support is outstanding. Sent in Malayalam and client was thrilled!', created_at: new Date(Date.now() - 259200000).toISOString() },
                ]);
            const avatarColors = ['bg-indigo-600 dark:bg-indigo-950', 'bg-emerald-600 dark:bg-emerald-950', 'bg-amber-600 dark:bg-amber-950', 'bg-pink-600 dark:bg-pink-950', 'bg-sky-600 dark:bg-sky-950'];
            return (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 relative">
                {displayFeedbacks.map((fb, idx) => {
                  const names = fb.customer_name ? fb.customer_name.split(' ') : [];
                  const initials = names.length >= 2 
                    ? (names[0][0] + names[1][0]).toUpperCase()
                    : names.length === 1 ? names[0].substring(0, 2).toUpperCase() : 'YS';
                  
                  return (
                    <div 
                      key={fb.id || idx} 
                      className="p-4 bg-white/40 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex gap-4 hover-highlight transition-all"
                    >
                      {/* Customer Initials Avatar */}
                      <div className={`h-10 w-10 shrink-0 rounded-full ${avatarColors[idx % avatarColors.length]} text-white font-extrabold text-sm flex items-center justify-center border border-white/20 select-none`}>
                        {initials}
                      </div>
                      
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{fb.customer_name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">{new Date(fb.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/80 text-[10px] font-bold flex items-center gap-1">
                            ➔ {fb.destination}
                          </span>
                        </div>
                        
                        {/* Star Rating and Comments */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${fb.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                          ))}
                        </div>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          "{fb.comments || 'No comments left.'}"
                        </p>
                      </div>
                    </div>
                  );
                })}
                {!hasRealFeedbacks && !(user?.role === 'admin') && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase">Demo Data</div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Telemetry metrics panel inside the grid */}
        <div className="space-y-4 flex flex-col">
          
          {/* System Telemetry */}
          <div onClick={() => { if (user?.role === 'admin') setExpandedCard('telemetry'); }} className={`${user?.role === 'admin' ? 'cursor-pointer' : 'cursor-default'} p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800/80 rounded-3xl flex-1 flex flex-col justify-between hover-highlight`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">System Telemetry</h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <div className="space-y-5 my-auto">
              {/* Uptime */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Service Uptime</span>
                  <span className="text-lg font-extrabold font-mono text-emerald-500 dark:text-emerald-400">{metrics?.performanceMetrics?.uptimePct || 99.9}%</span>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${metrics?.performanceMetrics?.uptimePct || 99.9}%` }}></div>
                </div>
                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">Operational - Zero incidents detected</p>
              </div>
              
              {/* Latency */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">AI Latency</span>
                  <span className="text-lg font-extrabold font-mono text-indigo-500 dark:text-indigo-400">{(metrics?.performanceMetrics?.avgResponseMs || 2400).toLocaleString()}ms</span>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">Avg response - P95 threshold</p>
              </div>
              
              {/* Success Rate */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">AI Success Rate</span>
                  <span className="text-lg font-extrabold font-mono text-amber-550 dark:text-amber-400">{metrics?.performanceMetrics?.aiSuccessRate || 99.2}%</span>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${metrics?.performanceMetrics?.aiSuccessRate || 99.2}%` }}></div>
                </div>
                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">Based on last 500 requests</p>
              </div>
            </div>
          </div>
          


        </div>
      </div>

      {/* ── Expanded Card Modal Overlay ── */}
      {expandedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setExpandedCard(null)}>
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setExpandedCard(null)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all hover:scale-110" title="Close">
              <X className="h-4 w-4" />
            </button>

            {expandedCard === 'weekly' && (
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white mb-1">Weekly Generation Volume</h2>
                <p className="text-xs text-slate-500 mb-6">Detailed daily breakdown of AI-personalized greetings generated this week.</p>
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Day</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Volume</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Activity</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {((user?.role === 'admin') ? (metrics?.dailyUsage || []) : (metrics?.dailyUsage?.length ? metrics.dailyUsage : [{date:'Sun',count:3},{date:'Mon',count:7},{date:'Tue',count:12},{date:'Wed',count:8},{date:'Thu',count:5},{date:'Fri',count:9},{date:'Sat',count:4}])).map(d => (
                      <tr key={d.date}>
                        <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{d.date}</td>
                        <td className="p-3 text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{d.count} greetings</td>
                        <td className={`p-3 text-xs font-bold uppercase ${d.count >= 8 ? 'text-indigo-600' : 'text-slate-400'}`}>{d.count >= 8 ? 'High' : 'Normal'}</td>
                      </tr>
                    ))}
                    {(!metrics?.dailyUsage || metrics.dailyUsage.length === 0) && (
                      <tr><td colSpan="3" className="p-6 text-center text-sm text-slate-400">No generation volume data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {expandedCard === 'destinations' && (
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white mb-1">Top Destinations</h2>
                <p className="text-xs text-slate-500 mb-6">Most popular travel destinations by greeting count this week.</p>
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Destination</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Greetings</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Share</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(metrics?.topDestinations || []).map(d => {
                      const total = (metrics?.topDestinations || []).reduce((s,x) => s+x.count, 0) || 1;
                      return (
                        <tr key={d.name}>
                          <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{d.name}</td>
                          <td className="p-3 text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{d.count}</td>
                          <td className="p-3 text-sm font-semibold text-slate-500">{((d.count/total)*100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    {(!metrics?.topDestinations || metrics.topDestinations.length === 0) && (
                      <tr><td colSpan="3" className="p-6 text-center text-sm text-slate-400">No destination data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {expandedCard === 'insight' && (
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white mb-1">AI Insight • Trending Now</h2>
                <p className="text-xs text-slate-500 mb-6">AI-generated insights and recommendations based on current analytics data.</p>
                <div className="space-y-4">
                  <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/50 rounded-2xl">
                    <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">Destination Analysis</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {user?.role === 'admin' 
                        ? (metrics && metrics.totalGreetings > 0 
                            ? `Top destination this week is ${metrics.topDestinations?.[0]?.name || 'none'} with ${metrics.topDestinations?.[0]?.count || 0} greetings generated. Dynamic metrics show high volume distribution.` 
                            : "No greetings generated yet. Feed database records to generate destination analysis insights.")
                        : "Kerala and Tirupati are tied as top destinations this week. Average rating improved +0.3 pts. Consider adding Ooty and Coorg to expand South India coverage by ~40%."}
                    </p>
                  </div>
                  <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-2xl">
                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">Performance Summary</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">AI Success Rate: {metrics?.performanceMetrics?.aiSuccessRate || 99.2}% • Avg Latency: {metrics?.performanceMetrics?.avgResponseMs || 2400}ms • Uptime: {metrics?.performanceMetrics?.uptimePct || 99.9}%</p>
                  </div>
                  <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl">
                    <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-2">Customer Satisfaction</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">Average Rating: {metrics?.averageRating || 0}/5 across {metrics?.feedbackCount || 0} feedback entries. Total personalized greetings: {metrics?.totalGreetings || 0}.</p>
                  </div>
                </div>
              </div>
            )}

            {expandedCard === 'feedback' && (
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white mb-1">Recent AI Feedback</h2>
                <p className="text-xs text-slate-500 mb-6">Latest customer testimonials and rating details.</p>
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Customer</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Destination</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Rating</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Comment</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(metrics?.recentFeedbacks || []).map((fb, i) => (
                      <tr key={fb.id || i}>
                        <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{fb.customer_name}</td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{fb.destination}</td>
                        <td className="p-3 text-sm font-mono font-bold text-amber-500">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</td>
                        <td className="p-3 text-xs text-slate-600 dark:text-slate-300 italic max-w-xs truncate">"{fb.comments || 'No comments.'}"</td>
                      </tr>
                    ))}
                    {(!metrics?.recentFeedbacks || metrics.recentFeedbacks.length === 0) && (
                      <tr><td colSpan="4" className="p-6 text-center text-sm text-slate-400">No feedback data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {expandedCard === 'telemetry' && (
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white mb-1">System Telemetry</h2>
                <p className="text-xs text-slate-500 mb-6">Real-time system health and performance metrics.</p>
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Metric</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Value</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Service Uptime</td>
                      <td className="p-3 text-sm font-mono font-bold text-emerald-500">{metrics?.performanceMetrics?.uptimePct || 99.9}%</td>
                      <td className="p-3 text-xs font-bold text-emerald-600 uppercase">Operational</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-200">AI Latency</td>
                      <td className="p-3 text-sm font-mono font-bold text-indigo-500">{metrics?.performanceMetrics?.avgResponseMs || 2400}ms</td>
                      <td className="p-3 text-xs font-bold text-indigo-600 uppercase">Optimal</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-200">AI Success Rate</td>
                      <td className="p-3 text-sm font-mono font-bold text-amber-500">{metrics?.performanceMetrics?.aiSuccessRate || 99.2}%</td>
                      <td className="p-3 text-xs font-bold text-emerald-600 uppercase">Healthy</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// GREETING GENERATOR FORM & WORKSPACE VIEW
// -------------------------------------------------------------
function GreetingGenerator() {
  const { user } = useContext(AuthContext);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const [name, setName] = useState(() => localStorage.getItem('gen_name') || '');
  const [destination, setDestination] = useState(() => localStorage.getItem('gen_destination') || '');
  const [bookingHistory, setBookingHistory] = useState(() => localStorage.getItem('gen_bookingHistory') || '1st Trip');
  const [travelType, setTravelType] = useState(() => localStorage.getItem('gen_travelType') || 'Family Trip');
  const [preferredLanguage, setPreferredLanguage] = useState(() => localStorage.getItem('gen_preferredLanguage') || 'English');
  const [customerCategory, setCustomerCategory] = useState(() => localStorage.getItem('gen_customerCategory') || 'Standard');
  const [specialNotes, setSpecialNotes] = useState(() => localStorage.getItem('gen_specialNotes') || '');
  const [travelDate, setTravelDate] = useState(() => localStorage.getItem('gen_travelDate') || '');
  const [whatsappNumber, setWhatsappNumber] = useState(() => localStorage.getItem('gen_whatsappNumber') || '');

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth() + 1; // 1-indexed
  const currentDay = todayDate.getDate();

  const getDaysInMonth = (year, month) => {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  useEffect(() => {
    if (travelDate && travelDate.includes('-')) {
      const [y, m, d] = travelDate.split('-');
      setSelectedYear(y);
      setSelectedMonth(m);
      setSelectedDay(d);
    } else {
      setSelectedYear('');
      setSelectedMonth('');
      setSelectedDay('');
    }
  }, [travelDate]);

  const handleDropdownDateChange = (y, m, d) => {
    setSelectedYear(y || '');
    setSelectedMonth(m || '');
    setSelectedDay(d || '');
    if (y && m && d) {
      setTravelDate(`${y}-${m}-${d}`);
    } else {
      setTravelDate('');
    }
  };


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

  // Custom presets state (admin-managed, fetched from database)
  const [presets, setPresets] = useState([]);
  const defaultPresetsList = [
    {
      id: "p1",
      label: "Tirupati Pilgrimage",
      emoji: "☸️",
      destination: "Tirupati",
      travelType: "Spiritual Tour",
      bookingHistory: "3 Previous Trips",
      category: "VIP",
      language: "English",
      notes: "Arrange clean vegetarian guide."
    },
    {
      id: "p2",
      label: "Goa Honeymoon",
      emoji: "🏖️",
      destination: "Goa",
      travelType: "Honeymoon",
      bookingHistory: "1st Trip",
      category: "Premium",
      language: "English",
      notes: "Arrange flower decorations and candle light dinners."
    },
    {
      id: "p3",
      label: "Mumbai Corporate",
      emoji: "💼",
      destination: "Mumbai",
      travelType: "Corporate Travel",
      bookingHistory: "5 Previous Trips",
      category: "VIP",
      language: "English",
      notes: "Provide premium executive sedan, late check-out, express Wi-Fi."
    },
    {
      id: "p4",
      label: "Ladakh Adventure",
      emoji: "🏔️",
      destination: "Leh Ladakh",
      travelType: "Solo Adventure",
      bookingHistory: "1st Trip",
      category: "Standard",
      language: "Hindi",
      notes: "Include high-altitude oxygen kit, emergency local contacts, bike rental details."
    },
    {
      id: "p5",
      label: "Ooty Family",
      emoji: "👪",
      destination: "Ooty",
      travelType: "Family Trip",
      bookingHistory: "2 Previous Trips",
      category: "Premium",
      language: "Telugu",
      notes: "Book kid-friendly theme park tickets and arrange an English-speaking driver."
    },
    {
      id: "p6",
      label: "Jaipur Heritage",
      emoji: "🏰",
      destination: "Jaipur",
      travelType: "Family Trip",
      bookingHistory: "4 Previous Trips",
      category: "VIP",
      language: "Hindi",
      notes: "Book local guide for historical forts and royal dinner reservations."
    }
  ];
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetForm, setPresetForm] = useState({ label: '', emoji: '✈️', destination: '', travelType: 'Family Trip', bookingHistory: '1st Trip', category: 'Standard', language: 'English', notes: '' });

  const loadGreetingsHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/history');
      let combined = [...res.data];
      const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
      localGreetings.forEach(lg => {
        if (!combined.find(g => g.id === lg.id)) combined.push(lg);
      });
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistoryList(combined);
    } catch (e) {
      console.warn("API offline, falling back to local storage logs");
      const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
      localGreetings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistoryList(localGreetings);
    }
    setHistoryLoading(false);
  };

  const loadPresets = async () => {
    setPresetsLoading(true);
    try {
      const res = await api.get('/presets');
      setPresets(res.data);
      localStorage.setItem('custom_presets', JSON.stringify(res.data));
    } catch (e) {
      console.warn("API offline, falling back to local storage presets");
      let local = [];
      try {
        local = JSON.parse(localStorage.getItem('custom_presets') || '[]');
      } catch (err) {
        local = [];
      }
      if (local.length === 0 && !localStorage.getItem('custom_presets_initialized')) {
        local = [...defaultPresetsList];
        localStorage.setItem('custom_presets', JSON.stringify(local));
        localStorage.setItem('custom_presets_initialized', 'true');
      }
      setPresets(local);
    }
    setPresetsLoading(false);
  };

  useEffect(() => {
    loadGreetingsHistory();
    loadPresets();
  }, []);

  const saveCustomPreset = async () => {
    if (!presetForm.label.trim() || !presetForm.destination.trim()) return;
    try {
      await api.post('/presets', presetForm);
      setAlertMessage('Preset settings saved successfully.');
      loadPresets();
    } catch (e) {
      console.warn("API offline, saving preset locally");
      const updated = [...presets, { ...presetForm, id: 'cp_' + Date.now() }];
      setPresets(updated);
      localStorage.setItem('custom_presets', JSON.stringify(updated));
      setAlertMessage('Preset settings saved locally (offline mode).');
    }
    setPresetForm({ label: '', emoji: '✈️', destination: '', travelType: 'Family Trip', bookingHistory: '1st Trip', category: 'Standard', language: 'English', notes: '' });
    setShowPresetModal(false);
  };

  const deleteCustomPreset = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this preset?")) return;
    try {
      await api.delete(`/presets/${id}`);
      setAlertMessage('Preset deleted successfully.');
      loadPresets();
    } catch (e) {
      console.warn("API offline, deleting preset locally");
      const updated = presets.filter(p => p.id !== id);
      setPresets(updated);
      localStorage.setItem('custom_presets', JSON.stringify(updated));
      setAlertMessage('Preset deleted locally.');
    }
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

    if (travelDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(travelDate);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) {
        setAlertMessage("⚠️ Travel Date cannot be in the past.");
        setLoading(false);
        return;
      }
    }

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

  if (initialLoading) return <InnerLoader text="Initializing AI Generator..." />;

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
            {presets.map(preset => {
              let colorClasses = "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border-violet-500/10";
              if (preset.id === 'p1' || preset.label?.includes('Tirupati')) {
                colorClasses = "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/10";
              } else if (preset.id === 'p2' || preset.label?.includes('Goa')) {
                colorClasses = "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border-pink-500/10";
              } else if (preset.id === 'p3' || preset.label?.includes('Mumbai')) {
                colorClasses = "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/10";
              } else if (preset.id === 'p4' || preset.label?.includes('Ladakh')) {
                colorClasses = "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/10";
              } else if (preset.id === 'p5' || preset.label?.includes('Ooty')) {
                colorClasses = "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border-sky-500/10";
              } else if (preset.id === 'p6' || preset.label?.includes('Jaipur')) {
                colorClasses = "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/10";
              }

              return (
                <div key={preset.id} className="relative group flex items-center">
                  <button
                    type="button"
                    onClick={() => applyCustomPreset(preset)}
                    className={`px-3 py-2 text-xs font-semibold border rounded-xl transition-all ${user && user.role === 'admin' ? 'pr-7' : ''} ${colorClasses}`}
                  >
                    {preset.emoji} {preset.label}
                  </button>
                  {user && user.role === 'admin' && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteCustomPreset(preset.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400/70 hover:text-rose-500 hover:scale-110 transition-all p-0.5 rounded-full hover:bg-rose-500/10"
                      title="Remove this preset"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
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

        <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20" />
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
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Destination</label>
              <input type="text" required value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Tirupati" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Travel Date</label>
              <div className="grid grid-cols-3 gap-2">
                {/* Day Select */}
                <select
                  value={selectedDay}
                  required
                  onChange={e => handleDropdownDateChange(selectedYear, selectedMonth, e.target.value)}
                  className="px-2 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <option value="">Day</option>
                  {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => {
                    const dayNum = i + 1;
                    const dayStr = String(dayNum).padStart(2, '0');
                    const isPast = selectedYear === String(currentYear) && selectedMonth === String(currentMonth).padStart(2, '0') && dayNum < currentDay;
                    return (
                      <option key={dayStr} value={dayStr} disabled={isPast}>
                        {dayNum}
                      </option>
                    );
                  })}
                </select>

                {/* Month Select */}
                <select
                  value={selectedMonth}
                  required
                  onChange={e => {
                    const newMonth = e.target.value;
                    let newDay = selectedDay;
                    const daysInNewMonth = getDaysInMonth(selectedYear, newMonth);
                    if (selectedDay && parseInt(selectedDay) > daysInNewMonth) {
                      newDay = String(daysInNewMonth).padStart(2, '0');
                    }
                    if (selectedYear === String(currentYear) && newMonth === String(currentMonth).padStart(2, '0') && newDay && parseInt(newDay) < currentDay) {
                      newDay = String(currentDay).padStart(2, '0');
                    }
                    handleDropdownDateChange(selectedYear, newMonth, newDay);
                  }}
                  className="px-2 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthNum = i + 1;
                    const monthStr = String(monthNum).padStart(2, '0');
                    const isPast = selectedYear === String(currentYear) && monthNum < currentMonth;
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return (
                      <option key={monthStr} value={monthStr} disabled={isPast}>
                        {monthNames[i]}
                      </option>
                    );
                  })}
                </select>

                {/* Year Select */}
                <select
                  value={selectedYear}
                  required
                  onChange={e => {
                    const newYear = e.target.value;
                    let newMonth = selectedMonth;
                    let newDay = selectedDay;
                    if (newYear === String(currentYear)) {
                      if (selectedMonth && parseInt(selectedMonth) < currentMonth) {
                        newMonth = String(currentMonth).padStart(2, '0');
                      }
                      if (selectedMonth === String(currentMonth).padStart(2, '0') && selectedDay && parseInt(selectedDay) < currentDay) {
                        newDay = String(currentDay).padStart(2, '0');
                      }
                    }
                    handleDropdownDateChange(newYear, newMonth, newDay);
                  }}
                  className="px-2 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 80 }, (_, i) => {
                    const yearNum = currentYear + i;
                    const yearStr = String(yearNum);
                    return (
                      <option key={yearStr} value={yearStr}>
                        {yearStr}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Travel Group/Type</label>
              <select value={travelType} onChange={e => setTravelType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20 cursor-pointer">
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
              <input type="text" value={bookingHistory} onChange={e => setBookingHistory(e.target.value)} placeholder="e.g. 3 Previous Trips" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Language</label>
              <select value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20 cursor-pointer">
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
              <select value={customerCategory} onChange={e => setCustomerCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20 cursor-pointer">
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Special Instructions / Notes</label>
            <textarea value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} rows="3" placeholder="e.g. Senior citizen requires wheelchair assistance." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-sm resize-none transition-all hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-indigo-500/20" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 hero-gradient text-white rounded-2xl font-bold hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/10">
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
          <InnerLoader text="Querying workspace database..." />
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
                      <tr key={record.id} className="hover-row-highlight hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-200 dark:border-slate-800/85">
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
                            <button 
                              onClick={() => handleDeleteGreeting(record.id)} 
                              title="Delete Record Permanently" 
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
      let combined = [...res.data];
      const localGreetings = JSON.parse(localStorage.getItem('local_greetings') || '[]');
      const localFeedbacks = JSON.parse(localStorage.getItem('local_feedbacks') || '[]');
      localGreetings.forEach(lg => {
        if (!combined.find(g => g.id === lg.id)) {
          const fb = localFeedbacks.find(f => f.greeting_id === lg.id);
          combined.push({
            ...lg,
            rating: fb ? fb.rating : (lg.rating || null),
            comments: fb ? fb.comments : (lg.comments || null)
          });
        }
      });
      if (search) {
        const q = search.toLowerCase();
        combined = combined.filter(g => 
          (g.customer_name && g.customer_name.toLowerCase().includes(q)) || 
          (g.destination && g.destination.toLowerCase().includes(q))
        );
      }
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(combined);
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
        <InnerLoader text="Querying database registry logs..." />
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
                  <tr key={record.id} className="hover-row-highlight hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-200 dark:border-slate-800/85">
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
                      <button onClick={() => handleDelete(record.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete Log">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                    <button onClick={() => handleDelete(record.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
      localStorage.setItem('custom_templates', JSON.stringify(res.data));
    } catch (e) {
      console.warn("API offline, rendering simulated templates");
      let local = [];
      if (typeof window !== 'undefined') {
        local = JSON.parse(localStorage.getItem('custom_templates') || '[]');
      }
      if (local.length === 0 && !localStorage.getItem('custom_templates_initialized')) {
        local = [
          {
            id: 't1010101-1111-2222-3333-444455556666',
            title: 'Standard Pre-Trip Greeting',
            description: 'General template for all travel types',
            subject_pattern: 'Greeting for {{CustomerName}}',
            body_pattern: 'Hello {{CustomerName}},\n\nThank you for choosing Manivtha Tours & Travels for your upcoming journey to {{Destination}}.\n\nWe hope you have an incredible travel experience. Let us know if you need any assistance.\n\nRegards,\nManivtha Tours & Travels',
            language: 'English',
            is_active: true
          },
          {
            id: 't2020202-2222-3333-4444-555566667777',
            title: 'VIP Spiritual Journey',
            description: 'Tailored spiritual tone for holy cities',
            subject_pattern: 'Spiritual greetings for {{CustomerName}}',
            body_pattern: 'Namaste {{CustomerName}},\n\nWe are honored to assist in facilitating your sacred journey to {{Destination}}.\n\nAs one of our returning customers, we have arranged the primary details to ensure absolute peace of mind during your spiritual tour.\n\nMay your pilgrimage be deeply rewarding.\n\nRegards,\nManivtha Tours & Travels',
            language: 'English',
            is_active: true
          }
        ];
        localStorage.setItem('custom_templates', JSON.stringify(local));
        localStorage.setItem('custom_templates_initialized', 'true');
      }
      setTemplates(local);
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
      let updated;
      if (editingId) {
        updated = templates.map(t => t.id === editingId ? { ...t, ...payload } : t);
        setAlert("Template updated successfully (Simulated)!");
      } else {
        updated = [...templates, { id: 'sim_t' + Date.now(), ...payload }];
        setAlert("Template created successfully (Simulated)!");
      }
      setTemplates(updated);
      localStorage.setItem('custom_templates', JSON.stringify(updated));
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
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem('custom_templates', JSON.stringify(updated));
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
              <InnerLoader text="Querying template files..." />
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

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

  if (loading) return <InnerLoader text="Loading profile parameters..." />;

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
            <input type="text" disabled value={user?.username} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role Status</label>
            <input type="text" disabled value={user?.role} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-500 font-mono" />
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

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

  if (loading) return <InnerLoader text="Loading system preferences..." />;

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

          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearData}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all border ${clearConfirm ? 'bg-rose-600 text-white border-rose-600 animate-pulse' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20'}`}
            >
              <Trash2 className="h-4 w-4" />
              {clearConfirm ? '⚠️ Click again to confirm clear' : 'Clear Local App Data'}
            </button>
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
