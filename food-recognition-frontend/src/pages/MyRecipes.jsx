import React, { useState, useEffect } from 'react';
import { ChefHat, Flame, Tag, X, ExternalLink, UtensilsCrossed, Trash2, Check, AlertCircle, Info } from 'lucide-react';
import apiClient from '../api/client';

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // Track which recipes are currently being deleted
  const [isDeleting, setIsDeleting] = useState({});
  // Toast notification state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await apiClient.get('/api/v1/saved');
        setRecipes(response.data.recipes);
      } catch (error) {
        console.error("Failed to fetch saved recipes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleDelete = async (recipeTitle) => {
    if (isDeleting[recipeTitle]) return;

    if (!window.confirm(`Are you sure you want to delete '${recipeTitle}' from your cookbook?`)) {
      return; 
    }

    // Optimistically remove it from the UI for a snappy feel
    setIsDeleting(prev => ({ ...prev, [recipeTitle]: true }));
    const originalRecipes = [...recipes];
    setRecipes(prev => prev.filter(recipe => recipe.title !== recipeTitle));

    try {
      // Use encodeURIComponent in case the recipe title has spaces or special characters
      await apiClient.delete(`/api/v1/delete/${encodeURIComponent(recipeTitle)}`);
      showToast(`'${recipeTitle}' has been tucked away for good! 🗑️`, 'success');
    } catch (error) {
      console.error("Failed to delete recipe", error);
      // If it fails, put the recipe back on the screen
      setRecipes(originalRecipes);
      showToast(`Uh oh, that didn't go through. Mind trying again? 😅`, 'error');
    } finally {
      setIsDeleting(prev => ({ ...prev, [recipeTitle]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-brand-green">
        <div className="flex flex-col items-center gap-4">
          <ChefHat size={48} className="animate-bounce" />
          <p className="font-bold text-xl">Loading your cookbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8 relative pb-12">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
           <UtensilsCrossed className="text-brand-green" /> My Recipes
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your personal collection of AI-generated culinary creations.
        </p>
      </header>

      {recipes.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border-2 border-dashed border-gray-200 dark:border-dark-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <ChefHat size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cookbook is empty!</h2>
          <p className="text-gray-500">Go to the Generate Recipes tab to start saving your favorite meals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe._id || recipe.title} className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{recipe.title}</h3>
                <div className="bg-brand-green/10 text-brand-green px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 text-sm font-bold">
                  <Flame size={14} /> {recipe.calories}
                </div>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                <span className="font-bold text-gray-700 dark:text-gray-300">Ingredients:</span> {recipe.ingredients?.join(', ')}
              </p>

              <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                {recipe.health_tags?.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDelete(recipe.title)}
                  disabled={isDeleting[recipe.title]}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${isDeleting[recipe.title] ? 'bg-red-50 dark:bg-red-900/20 text-red-400 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500'}`}
                >
                  {isDeleting[recipe.title] ? 'Deleting...' : <><Trash2 size={16}/> Delete</>}
                </button>
                <button 
                  onClick={() => setSelectedRecipe(recipe)}
                  className="flex-1 bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP MODAL FOR FULL RECIPE VIEW */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-200 dark:border-dark-border">
            
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gray-50 dark:bg-dark-bg">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedRecipe.title}</h2>
                <div className="flex gap-4 text-sm font-bold text-brand-green">
                  <span className="flex items-center gap-1"><Flame size={16} /> {selectedRecipe.calories} Calories</span>
                </div>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-dark-card rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <ChefHat size={20} className="text-brand-green" /> Ingredients
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  {selectedRecipe.ingredients?.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-dark-bg/50 p-2 rounded-lg text-sm border border-gray-100 dark:border-gray-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Flame size={20} className="text-brand-green" /> Instructions
                </h3>
                <div className="space-y-4">
                  {selectedRecipe.instructions?.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC TOAST STYLING */}
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