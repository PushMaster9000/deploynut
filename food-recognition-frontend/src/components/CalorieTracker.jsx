import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Target, Calendar as CalendarIcon, Activity } from 'lucide-react';
import apiClient from '../api/client';

export default function CalorieTracker({ onAction }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calorieData, setCalorieData] = useState({}); 
  const [loading, setLoading] = useState(true);

  const [goal, setGoal] = useState(2000);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchMonthData = async () => {
    setLoading(true);
    try {
      const d = new Date();
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const response = await apiClient.get(`/api/v1/calories/?date=${localDate}`);
      
      const dataMap = {};
      response.data.weekly_data.forEach(log => {
        dataMap[log.date] = log.calories;
      });
      
      setCalorieData(dataMap);
      setGoal(response.data.goal);
      setWeeklyData(response.data.weekly_data); 
    } catch (error) {
      console.error("Failed to fetch calorie data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [currentDate]);

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    setIsUpdatingGoal(true);
    try {
      await apiClient.put('/api/v1/calories/goal', { goal: Number(goal) });
      if (onAction) onAction(); 
    } catch (error) {
      console.error("Failed to update goal", error);
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  // Calendar Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startingDay = getFirstDayOfMonth(year, month);
  const todayStr = formatDate(new Date());

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // The blank spaces before the first day of the month
  const blanks = Array.from({ length: startingDay }, (_, i) => (
    <div key={`blank-${i}`} className="p-2 sm:p-3 border border-transparent"></div>
  ));
  
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const loopDate = new Date(year, month, day);
    const dateStr = formatDate(loopDate);
    const cals = calorieData[dateStr] || 0;
    
    const isToday = dateStr === todayStr;
    const hasData = cals > 0;
    const metGoal = hasData && cals <= goal;
    const overGoal = hasData && cals > goal;

    return (
      // THE FIX: Added a subtle border to the cell container to separate the numbers cleanly
      <div key={day} className="relative group flex items-center justify-center p-2 sm:p-3 border border-gray-200 dark:border-gray-700/50 rounded-[1.25rem] hover:border-gray-300 dark:hover:border-gray-600/70 transition-colors">
        <div 
          className={`relative flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-2xl transition-all duration-300 ease-out
            ${isToday ? 'bg-brand-green text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] font-bold scale-110 ring-4 ring-brand-green/20' 
            : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80'}
            ${hasData && !isToday ? (overGoal ? 'bg-red-50 dark:bg-red-500/10 ring-1 ring-red-200 dark:ring-red-500/30 text-red-600 dark:text-red-400 font-bold' 
            : 'bg-orange-50 dark:bg-orange-500/10 ring-1 ring-orange-200 dark:ring-orange-500/30 text-orange-500 font-bold') : ''}
          `}
        >
          <span className="text-sm sm:text-[15px] z-10">{day}</span>
          
          {hasData && !isToday && (
            <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${overGoal ? 'bg-red-400' : 'bg-orange-500'}`}></div>
          )}
        </div>

        {/* Floating Calendar Tooltip */}
        {hasData && (
          <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center z-20 w-max animate-fade-in-down">
            <div className="bg-gray-900 dark:bg-gray-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xl ring-1 ring-white/10">
              <Flame size={12} className={overGoal ? "text-red-400" : "text-orange-400"} /> 
              {cals} kcal
            </div>
            <div className="w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 -mt-1 ring-1 ring-white/10 border-t-0 border-l-0"></div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 relative overflow-hidden">
      
      {/* Decorative Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
              <CalendarIcon size={20} />
            </div>
            Intake Calendar
          </h2>
          <p className="text-sm text-gray-500 font-medium ml-11">Review your daily logging history.</p>
        </div>
        
        {/* Sleek Month Navigator */}
        <div className="flex items-center gap-1 bg-gray-50/80 dark:bg-dark-bg/80 backdrop-blur-md p-1.5 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800">
          <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <span className="font-bold text-gray-900 dark:text-white min-w-[120px] text-center text-[13px] uppercase tracking-widest">
            {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-12 relative z-10">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {blanks}
          {days}
        </div>
      </div>

      {/* ========================================== */}
      {/* GRAPH SECTION                              */}
      {/* ========================================== */}
      <div className="mt-12 pt-10 border-t border-gray-100 dark:border-gray-800 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
                <Activity size={18} />
              </div>
              Weekly Trends
            </h3>
            <p className="text-sm text-gray-500 font-medium ml-9">Your last 7 days vs your daily target.</p>
          </div>
          
          {/* Apple-style Goal Pill */}
          <form onSubmit={handleUpdateGoal} className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-full ring-1 ring-gray-200 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-orange-500/50 transition-all group">
            <div className="flex items-center pl-3 pr-2 border-r border-gray-200 dark:border-gray-700">
              <Target size={14} className="text-gray-400 group-focus-within:text-orange-500 transition-colors mr-1.5" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Goal</span>
            </div>
            <input 
              type="number" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-16 bg-transparent border-none px-2 py-1 text-[13px] font-black text-gray-900 dark:text-white outline-none text-center"
            />
            <button 
              type="submit" 
              disabled={isUpdatingGoal}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all disabled:opacity-50 tracking-wide"
            >
              {isUpdatingGoal ? '...' : 'Save'}
            </button>
          </form>
        </div>

        {/* Graph Container with Premium Dotted Grid Background */}
        <div className="relative h-72 w-full flex items-end justify-between gap-2 sm:gap-6 px-2 sm:px-6 pb-2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] rounded-3xl pt-10 border border-gray-100 dark:border-gray-800/50">
          
          {(() => {
            const maxVal = Math.max(goal, ...weeklyData.map(d => d.calories), 2500); 
            const goalHeightPercentage = (goal / maxVal) * 100;

            return (
              <>
                {/* Neon Goal Line */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-dashed border-orange-500/50 z-0 pointer-events-none flex items-end justify-end pb-1 pr-4 transition-all duration-700"
                  style={{ bottom: `${goalHeightPercentage}%` }}
                >
                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-gray-900 px-2.5 py-1 rounded-full relative top-3 shadow-sm ring-1 ring-orange-500/20 tracking-widest uppercase">
                    Target {goal}
                  </span>
                </div>

                {/* Vertical Pill Bars */}
                {weeklyData.map((dayData, idx) => {
                  const hasData = dayData.calories > 0;
                  const rawPercentage = maxVal > 0 ? (dayData.calories / maxVal) * 100 : 0;
                  const displayHeight = hasData ? Math.max(Math.min(rawPercentage, 100), 10) : 0;
                  const isOverGoal = dayData.calories > goal;
                  const dayName = new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div key={idx} className="relative flex flex-col items-center flex-1 h-full justify-end pb-8 z-10">
                      
                      {/* Floating Calorie Badge */}
                      {hasData && (
                        <div className={`mb-3 px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm ring-1 z-20 transition-colors ${
                          isOverGoal 
                            ? "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/20 dark:text-red-400" 
                            : "bg-white text-gray-900 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 dark:text-white"
                        }`}>
                          {dayData.calories}
                        </div>
                      )}

                      {/* 3D Glass Pill Bar */}
                      <div 
                        className="w-full max-w-[36px] relative group flex justify-center items-end"
                        style={{ height: `${displayHeight}%`, minHeight: hasData ? '32px' : '0px' }}
                      >
                        <div className={`absolute inset-0 rounded-t-2xl shadow-sm transition-all duration-700 ease-out border-t border-l border-white/20
                          ${isOverGoal ? 'bg-gradient-to-b from-red-400 to-red-500' : 'bg-gradient-to-b from-orange-400 to-orange-500'}
                        `}>
                          {/* Inner glass highlight */}
                          <div className="absolute top-0 left-0 right-0 h-full w-1/2 bg-white/10 rounded-tl-2xl"></div>
                        </div>
                      </div>
                      
                      {/* Modern X-Axis Label */}
                      <span className={`text-[10px] font-black absolute bottom-0 uppercase tracking-widest ${hasData ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
                        {dayName}
                      </span>
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}