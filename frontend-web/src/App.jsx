import React, { useState, useEffect } from 'react';
import { apiService } from './api';
import Dashboard from './components/Dashboard';
import LogActivity from './components/LogActivity';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userId, setUserId] = useState(localStorage.getItem('ecotrack_user_id') || '');
  const [userName, setUserName] = useState(localStorage.getItem('ecotrack_user_name') || '');
  const [userBaseline, setUserBaseline] = useState(localStorage.getItem('ecotrack_user_baseline') || '');
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Onboarding registration form state
  const [regName, setRegName] = useState('Jane Doe');
  const [regBaseline, setRegBaseline] = useState('450');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);

  // Fetch dashboard when userId changes
  useEffect(() => {
    if (userId) {
      fetchDashboard();
    }
  }, [userId]);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getDashboard(userId);
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    if (e) e.preventDefault();
    setRegError(null);
    setRegLoading(true);
    try {
      const data = await apiService.createUser(regName, regBaseline);
      localStorage.setItem('ecotrack_user_id', data.id);
      localStorage.setItem('ecotrack_user_name', data.name);
      localStorage.setItem('ecotrack_user_baseline', data.baseline_footprint.toString());
      setUserId(data.id);
      setUserName(data.name);
      setUserBaseline(data.baseline_footprint.toString());
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogActivity = async (type, value) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMsg('');
    try {
      const log = await apiService.logActivity(userId, type, value);
      setSuccessMsg(`Logged ${log.calculated_co2} kg CO2!`);
      // Refresh dashboard
      await fetchDashboard();
      
      // Auto return to dashboard after short delay
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('dashboard');
      }, 1500);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetUser = () => {
    localStorage.removeItem('ecotrack_user_id');
    localStorage.removeItem('ecotrack_user_name');
    localStorage.removeItem('ecotrack_user_baseline');
    setUserId('');
    setUserName('');
    setUserBaseline('');
    setDashboardData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-eco-darkBg text-gray-100 flex flex-col font-sans">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-eco-darkCard/80 backdrop-blur-md border-b border-eco-darkBorder">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="text-2xl">🌍</span>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-eco-100 to-eco-500 bg-clip-text text-transparent">
              EcoTrack
            </span>
          </div>

          {/* Navigation Links */}
          {userId && (
            <nav className="flex items-center gap-1 md:gap-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-eco-900/60 text-eco-100 border border-eco-500/20'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setSubmitError(null);
                  setSuccessMsg('');
                  setActiveTab('log-activity');
                }}
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'log-activity'
                    ? 'bg-eco-900/60 text-eco-100 border border-eco-500/20'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Log Activity
              </button>
            </nav>
          )}

          {/* Profile Card / Reset */}
          {userId ? (
            <div className="hidden sm:flex items-center gap-3 bg-eco-darkCard/50 border border-eco-darkBorder py-1.5 px-3 rounded-full text-xs">
              <div className="flex flex-col items-end">
                <span className="font-bold text-gray-200">{userName}</span>
                <span className="text-gray-500 font-medium">Limit: {userBaseline} kg</span>
              </div>
              <button
                onClick={handleResetUser}
                title="Log out / reset account"
                className="bg-gray-800 hover:bg-gray-700 text-gray-400 font-black p-1.5 rounded-full hover:text-red-400 transition-colors"
              >
                🔄
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
              Prototype Mode
            </span>
          )}
        </div>
      </header>

      {/* 2. Main Content Frame */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 md:px-8 py-8">
        {!userId ? (
          /* Onboarding Register Form */
          <div className="max-w-md mx-auto bg-eco-darkCard border border-eco-darkBorder rounded-3xl p-8 shadow-2xl space-y-6 mt-12 animate-fadeIn">
            <div>
              <span className="text-4xl">🌱</span>
              <h2 className="text-2xl font-black text-white mt-4">Welcome to EcoTrack</h2>
              <p className="text-gray-400 text-sm mt-1">
                To start tracking carbon emissions, set up a test user profile locally.
              </p>
            </div>

            {regError && (
              <div className="bg-red-950/15 border border-red-900/35 text-red-400 rounded-xl p-4 text-xs font-medium">
                ⚠️ {regError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Test User Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-eco-darkBg border border-eco-darkBorder text-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-eco-500 focus:border-eco-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Target Monthly Baseline (kg CO₂)
                </label>
                <input
                  type="number"
                  required
                  value={regBaseline}
                  onChange={(e) => setRegBaseline(e.target.value)}
                  className="w-full bg-eco-darkBg border border-eco-darkBorder text-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-eco-500 focus:border-eco-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-eco-900 hover:bg-eco-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {regLoading ? 'Creating Profile...' : 'Get Started'}
              </button>
            </form>
          </div>
        ) : (
          /* Navigation content tabs */
          <div className="w-full">
            {activeTab === 'dashboard' && (
              <Dashboard
                dashboardData={dashboardData}
                isLoading={isLoading}
                error={error}
                onRetry={fetchDashboard}
                onCreateUser={handleResetUser}
              />
            )}
            
            {activeTab === 'log-activity' && (
              <LogActivity
                onLogActivity={handleLogActivity}
                isSubmitting={isSubmitting}
                error={submitError}
                successMsg={successMsg}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-eco-darkBorder bg-eco-darkCard/25 py-6">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} EcoTrack Prototype. Built with React, Vite, and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
