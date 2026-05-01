import React, { useState } from 'react';
import { ScanLine, Wand2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CameraUpload from '../components/CameraUpload';
import NutritionCard from '../components/NutritionCard';
import RecipeList from '../components/RecipeList';

export default function ScanPage() {
  const [result, setResult] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const navigate = useNavigate();

  const handleResult = (newResult) => {
    setResult(newResult);
    if (newResult && newResult.detected_food) {
      const food = newResult.detected_food;
      setIngredients(prev => prev.includes(food) ? prev : [...prev, food]);
    }
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (item) => {
    setIngredients(ingredients.filter(i => i !== item));
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <header className="mb-8 flex items-center gap-4">
        <div className="bg-brand-green/10 p-3 rounded-xl text-brand-green">
            <ScanLine size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan Food Image</h1>
            <p className="text-gray-500 dark:text-gray-400">Upload a photo for AI-powered analysis and recipes.</p>
        </div>
      </header>

      <div className="space-y-8">
        {/* Main: Scanner Area */}
        <div className="bg-white dark:bg-dark-card p-1 rounded-2xl border border-gray-200 dark:border-dark-border shadow-lg relative z-10 transition-colors">
          <CameraUpload 
            appliances={[]} // Sending empty arrays so backend stays happy
            constraints={[]} 
            onResult={handleResult} 
          />
        </div>

        {/* Ingredients List Section */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm transition-colors">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Ingredients</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {ingredients.length > 0 ? (
              ingredients.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-lg text-sm font-medium animate-fade-in">
                  {item}
                  <button onClick={() => removeIngredient(item)} className="hover:bg-brand-green/20 rounded-full p-0.5"><X size={14} /></button>
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400 italic">No ingredients added yet.</span>
            )}
          </div>
          <form onSubmit={handleAddIngredient} className="flex gap-2">
            <input 
              type="text" 
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Add another ingredient..."
              className="flex-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-brand-green outline-none transition-colors"
            />
            <button type="submit" disabled={!newIngredient.trim()} className="bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Add
            </button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-brand-green/10 p-6 rounded-2xl border border-brand-green/20 gap-4">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Ready to cook?</h3>
                <p className="text-gray-600 dark:text-gray-400">Take your <span className="font-bold text-brand-green">{ingredients.length}</span> ingredients to our AI kitchen and generate a custom recipe.</p>
            </div>
            <button 
                onClick={() => navigate('/dashboard/generate-recipes', { state: { ingredients: ingredients } })}
                className="w-full md:w-auto bg-brand-green text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-colors shadow-lg shadow-brand-green/20 shrink-0"
            >
                <Wand2 size={20} /> Generate AI Recipe
            </button>
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-fade-in space-y-10">
            <NutritionCard 
               foodInfo={result.food_info} 
               confidence={result.confidence} 
               detectedFood={result.detected_food} 
            />
            
            <div id="recipes">
               <RecipeList recipes={result.matching_recipes} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}