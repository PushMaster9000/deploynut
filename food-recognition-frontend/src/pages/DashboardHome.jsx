import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ScanLine, Flame, Heart, Sparkles, LayoutDashboard } from 'lucide-react';
import { useUser } from '../context/UserContext';
import apiClient from '../api/client';

import RecommendedRecipes from '../components/RecommendedRecipes'; 
import CalorieTracker from '../components/CalorieTracker';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [showTracker, setShowTracker] = useState(false);
  const [todayCalories, setTodayCalories] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [refreshKey, setRefreshKey] = useState(0); 

  const fetchStats = async () => {
    try {
      const d = new Date();
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const res = await apiClient.get(`/api/v1/calories/?date=${localDate}`);
      
      setTodayCalories(res.data.today_calories || 0);
      setTotalScans(res.data.total_scans || 0);
      setDailyGoal(res.data.goal || 2000);

    } catch (error) {
      console.error("Failed to load dashboard stats", error);
      
      // AUTO LOGOUT IF TOKEN EXPIRES
      if (error.response && error.response.status === 401) {
        alert("Your session expired. Please log in again.");
        localStorage.removeItem('token'); // Clear the dead token
        navigate('/login'); // Send them to the login page
      }
    }
  };

  useEffect(() => {
    if (user) fetchStats();
  }, [user, refreshKey]);

  if (!user) return <Navigate to="/login" replace />;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Chef';

  // --- DIET SCORE LOGIC ---
  const getDietScore = () => {
    if (todayCalories === 0) return { score: "-", text: "Log a meal to get started" };
    
    const ratio = todayCalories / dailyGoal;
    
    if (ratio >= 0.85 && ratio <= 1.15) return { score: "A+", text: "Perfectly on track!" };
    if (ratio > 1.15 && ratio <= 1.3) return { score: "B", text: "A bit over your goal." };
    if (ratio > 1.3) return { score: "C", text: "Significantly over daily goal." };
    if (ratio > 0.4 && ratio < 0.85) return { score: "B+", text: "Looking healthy!" };
    
    return { score: "C+", text: "Need to eat more today!" };
  };

  const dietStatus = getDietScore();

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            Hello, {firstName} <Sparkles className="text-brand-orange" size={24} />
          </h1>
          <p className="text-gray-500">Track your nutrition and discover new recipes.</p>
        </div>
        
        <button 
          onClick={() => setShowTracker(!showTracker)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
            showTracker 
            ? 'bg-gray-800 text-white' 
            : 'bg-brand-green text-white hover:bg-brand-green-hover'
          }`}
        >
          <LayoutDashboard size={20} />
          {showTracker ? 'Close Tracker' : 'Track Calories'}
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOTAL SCANS */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
           <div className="flex items-center gap-3 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
             <ScanLine size={16} /> Total Scans
           </div>
           <p className="text-4xl font-bold text-gray-900 dark:text-white">{totalScans}</p>
        </div>
        
        {/* CALORIES TODAY */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-brand-orange/30 shadow-sm">
           <div className="flex items-center gap-3 mb-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
             <Flame size={16} /> Calories Today
           </div>
           <p className="text-4xl font-bold text-gray-900 dark:text-white">{todayCalories}</p>
           <p className="text-sm text-gray-500 mt-1">Goal: {dailyGoal} kcal</p>
        </div>
        
        {/* DYNAMIC DIET SCORE */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
           <div className="flex items-center gap-3 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
             <Heart size={16} className={dietStatus.score === "A+" ? "text-brand-green" : ""} /> Diet Score
           </div>
           <p className={`text-4xl font-bold ${
              dietStatus.score === "A+" ? "text-brand-green" : 
              dietStatus.score === "C" ? "text-red-500" : 
              "text-gray-900 dark:text-white"
           }`}>
             {dietStatus.score}
           </p>
           <p className="text-sm text-gray-500 mt-1 font-medium">{dietStatus.text}</p>
        </div>
      </div>

      {showTracker && (
        <div className="border-4 border-brand-green/20 rounded-[2.5rem] p-2 shadow-2xl animate-fade-in-down">
          <CalorieTracker key={refreshKey} onAction={() => setRefreshKey(prev => prev + 1)} />
        </div>
      )}

      <div className="pt-8">
        <RecommendedRecipes onAction={() => setRefreshKey(prev => prev + 1)} />
      </div>
    </div>
  );
}