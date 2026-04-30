import React from 'react';
import { ChefHat, Clock, ChevronRight, Zap } from 'lucide-react';

export default function RecipeList({ recipes }) {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-border transition-colors">
        <ChefHat className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No matching recipes found</h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your kitchen appliances or health filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ChefHat className="text-brand-green" /> Recommended for You
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{recipes.length} Recipes Found</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recipes.map((recipe, index) => (
          <div 
            key={index} 
            className="group bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border hover:border-brand-green dark:hover:border-brand-green hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-green transition-colors">
                  {recipe.recipe_name || recipe.name || "Delicious Recipe"}
                </h4>
                {recipe.health_tags && recipe.health_tags.includes('low-sugar') && (
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Diabetic Friendly
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                {recipe.appliances && recipe.appliances.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-brand-orange" />
                    <span>Appliances: <span className="text-gray-700 dark:text-gray-300 font-medium">{recipe.appliances.join(', ')}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {/* Uses real prep time if it exists, otherwise falls back to a default */}
                  <span>{recipe.prep_time || "15-20 mins"}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-full text-gray-400 dark:text-gray-500 group-hover:bg-brand-green group-hover:text-white dark:group-hover:text-white transition-all">
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}