import React, { useState } from 'react';
import { Search, Clock, Zap, ChefHat, Heart, X, CheckCircle2, AlertCircle } from 'lucide-react';
import recipesData from '../data/recipes.json'; 
import apiClient from '../api/client'; 

export default function RecommendedRecipes({ onAction }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [toast, setToast] = useState(null);
  
  // This state temporarily holds clicked recipes to make the heart red for 2 seconds
  const [justClicked, setJustClicked] = useState(new Set());

  const filteredRecipes = recipesData.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (recipe.health_tags && recipe.health_tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleHeartClick = async (e, recipe) => {
    e.stopPropagation(); 
    
    setJustClicked(prev => new Set(prev).add(recipe.name));
    
    setTimeout(() => {
      setJustClicked(prev => {
        const next = new Set(prev);
        next.delete(recipe.name);
        return next;
      });
    }, 2000); 

    try {
      // 1. Get the exact local date in YYYY-MM-DD format
      const d = new Date();
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      // 2. Attach it to the recipe data
      const payload = { ...recipe, date: localDate };

      // 3. Send the updated payload
      await apiClient.post('/api/auth/toggle-save', payload);
      
      showToast(`🥘 Saved to Cookbook & 🔥 Logged Calories!`);

      if (onAction) onAction();

    } catch (error) {
      showToast("Failed to log meal.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 relative">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-200 dark:border-dark-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <ChefHat className="text-brand-green" /> Famous Indian Recipes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Discover hand-picked iconic dishes.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search recipes or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-green outline-none text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Grid Layout */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => {
            
            // Check if this specific recipe was just clicked
            const isRed = justClicked.has(recipe.name);

            return (
              <div 
                key={recipe.id} 
                onClick={() => setSelectedRecipe(recipe)} 
                className="group flex flex-col bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-dark-border overflow-hidden hover:border-brand-green hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="h-48 overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm text-gray-900 dark:text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                      {recipe.health_tags && recipe.health_tags[0]}
                    </span>
                  </div>
                  
                  {/* UNIFIED HEART BUTTON */}
                  <button 
                    onClick={(e) => handleHeartClick(e, recipe)}
                    title="Log to Calendar & Save to Cookbook"
                    className="absolute top-3 right-3 p-2 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-md hover:bg-white rounded-full transition-all shadow-sm"
                  >
                    <Heart 
                      size={18} 
                      className={isRed ? "text-red-500 transition-colors" : "text-gray-500 dark:text-gray-300 transition-colors"} 
                      fill={isRed ? "currentColor" : "none"} 
                    />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 mb-4 group-hover:text-brand-green transition-colors">
                    {recipe.name}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={16} className="text-gray-400" /> {recipe.time}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Zap size={16} className="text-brand-orange" /> {recipe.calories}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-dark-card rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No recipes found</h3>
        </div>
      )}

      {/* RECIPE DETAILS MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedRecipe(null)}></div>
          <div className="bg-white dark:bg-dark-card w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10 border border-gray-200 dark:border-dark-border">
            <div className="relative h-64 sm:h-72 shrink-0">
              <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>
              <button onClick={() => setSelectedRecipe(null)} className="absolute top-4 right-4 p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-3xl font-bold text-white mb-3 leading-tight">{selectedRecipe.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
                  <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md"><Clock size={16} /> {selectedRecipe.time}</span>
                  <span className="flex items-center gap-1.5 bg-brand-orange/20 text-brand-orange px-3 py-1.5 rounded-full backdrop-blur-md border border-brand-orange/30"><Zap size={16} /> {selectedRecipe.calories}</span>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Ingredients</h3>
                  <ul className="space-y-3">
                    {selectedRecipe.ingredients?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-gray-600 dark:text-gray-300 text-sm">
                        <CheckCircle2 size={18} className="text-brand-green shrink-0 mt-0.5" /><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-7">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Instructions</h3>
                  <div className="space-y-5">
                    {selectedRecipe.instructions?.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm border border-brand-green/20">{idx + 1}</div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pt-1.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[110] animate-fade-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-white 
            ${toast.type === 'error' ? 'bg-red-500' : 'bg-brand-green'}`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}