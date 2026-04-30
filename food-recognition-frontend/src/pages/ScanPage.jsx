import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';
import CameraUpload from '../components/CameraUpload';
import NutritionCard from '../components/NutritionCard';
import RecipeList from '../components/RecipeList';

export default function ScanPage() {
  const [result, setResult] = useState(null);

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
            onResult={setResult} 
          />
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