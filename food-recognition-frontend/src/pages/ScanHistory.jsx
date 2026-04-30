import React, { useState, useEffect } from 'react';
import { History, Wand2, ScanLine, Clock, Flame, Calendar, Bookmark, Check, AlertCircle, Info } from 'lucide-react';
import apiClient from '../api/client';

export default function ScanHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [savingIds, setSavingIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/api/v1/history');
        setHistory(response.data.history);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp + 'Z'); 
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSaveToCookbook = async (item) => {
    if (savingIds.includes(item._id) || savedIds.includes(item._id)) return;
    
    setSavingIds(prev => [...prev, item._id]);
    
    try {
      await apiClient.post('/api/v1/save', {
        title: item.title,
        ingredients: item.ingredients || [],
        calories: item.calories || 0,
        instructions: item.instructions || ["Recipe recovered from old history log. Instructions unavailable."],
        health_tags: item.health_tags || []
      });
      
      setSavedIds(prev => [...prev, item._id]);
      
      // HUMANIZED SUCCESS MESSAGE
      showToast("All tucked into your cookbook! 📖", "success");
      
    } catch (error) {
      console.error("Failed to save from history", error);
      
      if (error.response && error.response.status === 400) {
          // HUMANIZED DUPLICATE MESSAGE (Using 'info' instead of 'error')
          showToast("Looks like you already saved this one! 😉", "info");
      } else {
          // HUMANIZED ERROR MESSAGE
          showToast("Uh oh, that didn't go through. Mind trying again? 😅", "error");
      }
    } finally {
      setSavingIds(prev => prev.filter(id => id !== item._id));
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-brand-green">
        <div className="flex flex-col items-center gap-4">
          <History size={48} className="animate-bounce" />
          <p className="font-bold text-xl">Loading your activity log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8 relative pb-12">
      <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
           <History className="text-brand-green" /> Activity History
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          A log of all the meals you've generated and ingredients you've scanned.
        </p>
      </header>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border-2 border-dashed border-gray-200 dark:border-dark-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <Clock size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No history yet</h2>
          <p className="text-gray-500">Go generate some recipes or scan some food to start building your log!</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-brand-green/20 dark:border-brand-green/10 ml-6 pl-8 space-y-8">
          
          {history.map((item) => {
            const { date, time } = formatDateTime(item.timestamp);
            const isGeneration = item.action_type === "generated_recipe";
            const isSaving = savingIds.includes(item._id);
            const isSaved = savedIds.includes(item._id);

            return (
              <div key={item._id} className="relative bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
                
                <div className={`absolute -left-[43px] top-6 w-10 h-10 rounded-full flex items-center justify-center border-4 border-gray-50 dark:border-dark-bg z-10 ${isGeneration ? 'bg-brand-green text-white' : 'bg-blue-500 text-white'}`}>
                  {isGeneration ? <Wand2 size={16} /> : <ScanLine size={16} />}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isGeneration ? 'text-brand-green' : 'text-blue-500'}`}>
                        {isGeneration ? 'AI Generated Recipe' : 'Food Scan'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  </div>
                  
                  <div className="flex flex-col sm:items-end text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {date}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {time}</span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2 text-sm font-bold text-brand-green">
                      <span className="flex items-center gap-1"><Flame size={16} /> {item.calories} Calories</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      <span className="font-semibold text-gray-900 dark:text-white">Ingredients Used: </span> 
                      {item.ingredients?.join(', ') || 'N/A'}
                    </p>
                  </div>
                  
                  {isGeneration && (
                    <button 
                      onClick={() => handleSaveToCookbook(item)}
                      disabled={isSaving || isSaved}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isSaved ? 'bg-brand-green text-white cursor-not-allowed' : 'bg-white dark:bg-dark-card border border-brand-green text-brand-green hover:bg-brand-green hover:text-white'}`}
                    >
                      {isSaved ? <><Check size={16} /> Saved to Cookbook</> : <><Bookmark size={16} /> {isSaving ? 'Saving...' : 'Save Recipe'}</>}
                    </button>
                  )}
                </div>
                
              </div>
            );
          })}
        </div>
      )}

      {/* UPDATED: DYNAMIC TOAST STYLING */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-white 
            ${toast.type === 'error' ? 'bg-red-500' : 
              toast.type === 'info' ? 'bg-gray-800 dark:bg-gray-700' : 
              'bg-brand-green'}`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : 
             toast.type === 'info' ? <Info size={20} /> : 
             <Check size={20} />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}