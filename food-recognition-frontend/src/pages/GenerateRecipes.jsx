import React, { useState, useRef, useEffect } from 'react';
import { Wand2, CheckCircle, Search, X, ChefHat, Pencil, Minus, MessageSquare, Send, Bot, User, Settings2, Trash2, Plus, Bookmark, Flame } from 'lucide-react';
import apiClient from '../api/client';

const DEFAULT_PANTRY = [
  'Salt', 'Black Pepper', 'Olive Oil', 'Vegetable Oil', 'Garlic', 'Onion', 
  'Butter', 'Sugar', 'Flour', 'Water', 'Soy Sauce', 'Lemon Juice', 
  'Vinegar', 'Paprika', 'Cumin', 'Oregano', 'Chili Powder', 'Honey'
];

export default function GenerateRecipes() {
  const [pantryIngredients, setPantryIngredients] = useState(() => {
    const saved = localStorage.getItem('custom_pantry');
    return saved ? JSON.parse(saved) : DEFAULT_PANTRY;
  });
  const [isEditingPantry, setIsEditingPantry] = useState(false);
  const [newPantryInput, setNewPantryInput] = useState('');

  useEffect(() => {
    localStorage.setItem('custom_pantry', JSON.stringify(pantryIngredients));
  }, [pantryIngredients]);

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [isCommonExpanded, setIsCommonExpanded] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const messagesEndRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients(prev => prev.includes(ingredient) ? prev.filter(item => item !== ingredient) : [...prev, ingredient]);
  };

  const commonSelectedCount = pantryIngredients.filter(item => selectedIngredients.includes(item)).length;
  const isAllCommonSelected = commonSelectedCount === pantryIngredients.length && pantryIngredients.length > 0;
  const isSomeCommonSelected = commonSelectedCount > 0 && commonSelectedCount < pantryIngredients.length;

  const handleToggleAllCommon = () => {
    if (isAllCommonSelected) {
      setSelectedIngredients(prev => prev.filter(item => !pantryIngredients.includes(item)));
    } else {
      setSelectedIngredients(prev => {
        const newItems = pantryIngredients.filter(item => !prev.includes(item));
        return [...prev, ...newItems];
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && customInput.trim() !== '') {
      e.preventDefault();
      if (!selectedIngredients.includes(customInput.trim())) {
        setSelectedIngredients(prev => [...prev, customInput.trim()]);
      }
      setCustomInput('');
    }
  };

  const removeIngredient = (ingredientToRemove) => {
    setSelectedIngredients(prev => prev.filter(item => item !== ingredientToRemove));
  };

  const handleRemoveFromPantry = (itemToRemove) => {
    setPantryIngredients(prev => prev.filter(item => item !== itemToRemove));
    setSelectedIngredients(prev => prev.filter(item => item !== itemToRemove));
  };

  const handleAddToPantry = (e) => {
    if (e.key === 'Enter' && newPantryInput.trim() !== '') {
      e.preventDefault();
      const newItem = newPantryInput.trim();
      if (!pantryIngredients.includes(newItem)) {
        setPantryIngredients(prev => [...prev, newItem]);
      }
      setNewPantryInput('');
    }
  };

  const openChatbot = () => {
    setIsChatOpen(true);
    if (messages.length === 0) {
      setMessages([{ 
        role: 'ai', 
        text: `I see you have selected ${selectedIngredients.length} ingredients! Before I generate your recipe, please let me know: Do you have any dietary problems, health issues, or specific household items (like an oven or blender) I should consider?` 
      }]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsGenerating(true);
    setIsSaved(false); 

    try {
      const response = await apiClient.post('/api/v1/generate-recipes', { 
        ingredients: selectedIngredients,
        user_preferences: userMessage 
      });

      const recipeData = response.data.recipes[0];

      setGeneratedRecipe({
        title: recipeData.title,
        description: `A delicious AI-crafted meal using: ${recipeData.ingredients?.join(', ') || 'your selected ingredients'}.`,
        calories: recipeData.calories,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.instructions || [],
        health_tags: recipeData.health_tags || []
      });

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Perfect! I've created **${recipeData.title}** taking all your details into account. The full recipe is ready on the right. Enjoy your meal!` 
      }]);

    } catch (error) {
      console.error("Failed to generate recipe:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Sorry, I ran into an error in the kitchen. Please check the backend console to ensure your API key is working!" 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    setIsSaving(true);
    
    try {
      // Get the exact local date
      const d = new Date();
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const payload = {
        name: generatedRecipe.title,
        title: generatedRecipe.title,
        ingredients: generatedRecipe.ingredients || [],
        calories: String(generatedRecipe.calories || "0"),
        instructions: generatedRecipe.steps || [],
        health_tags: generatedRecipe.health_tags || ["AI Generated"],
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800", 
        time: "30 mins",
        date: localDate // <-- Tell the backend exactly what day it is!
      };

      const response = await apiClient.post('/api/auth/toggle-save', payload);

      if (response.data.status === 'saved' || response.data.status === 'removed') {
        setIsSaved(true);
      }
      
    } catch (error) {
      console.error("Failed to save recipe", error);
      alert("Failed to save recipe. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8 relative">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
           <Wand2 className="text-brand-green" /> Generate Recipes
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Select what you have in your kitchen, and let our AI create the perfect meal.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Ingredient Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm dark:shadow-none transition-colors">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pantry Basics</h2>
             </div>
             
             <div className="flex items-center justify-between bg-gray-50 dark:bg-dark-bg p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                <label className="flex items-center gap-3 cursor-pointer group select-none flex-1">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors 
                    ${isAllCommonSelected ? 'bg-brand-green border-brand-green' : isSomeCommonSelected ? 'bg-brand-green/80 border-brand-green' : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'}`}>
                     {isAllCommonSelected && <CheckCircle size={16} className="text-white" />}
                     {isSomeCommonSelected && <Minus size={16} className="text-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white font-bold text-sm">Common Ingredients</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{commonSelectedCount} of {pantryIngredients.length} selected</span>
                  </div>
                  <input type="checkbox" className="hidden" checked={isAllCommonSelected} onChange={handleToggleAllCommon} />
                </label>
                <button 
                  onClick={() => { setIsCommonExpanded(!isCommonExpanded); setIsEditingPantry(false); }}
                  className={`p-2 transition-colors rounded-lg flex items-center justify-center ${isCommonExpanded ? 'bg-brand-green/10 text-brand-green' : 'text-gray-400 hover:text-brand-green hover:bg-gray-100 dark:hover:bg-dark-bg'}`}
                >
                  <Pencil size={18} />
                </button>
             </div>

             {isCommonExpanded && (
               <div className="mt-4 animate-fade-in pl-2 border-l-2 border-brand-green/30 ml-3 pt-2">
                 <div className="flex justify-end mb-3">
                   <button 
                      onClick={() => setIsEditingPantry(!isEditingPantry)}
                      className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${isEditingPantry ? 'bg-brand-green text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-300 hover:text-brand-green'}`}
                   >
                     <Settings2 size={14} /> {isEditingPantry ? 'Done Editing' : 'Edit List'}
                   </button>
                 </div>

                 <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                   {pantryIngredients.map(ingredient => (
                     isEditingPantry ? (
                        <div key={ingredient} className="flex items-center justify-between bg-gray-50 dark:bg-dark-bg/50 p-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate pl-2">{ingredient}</span>
                          <button onClick={() => handleRemoveFromPantry(ingredient)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-md transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                     ) : (
                        <label key={ingredient} className="flex items-center gap-2 cursor-pointer group select-none hover:bg-gray-50 dark:hover:bg-dark-bg/50 p-1.5 rounded-lg transition-colors">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedIngredients.includes(ingredient) ? 'bg-brand-green border-brand-green' : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'}`}>
                              {selectedIngredients.includes(ingredient) && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm truncate ${selectedIngredients.includes(ingredient) ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>{ingredient}</span>
                            <input type="checkbox" className="hidden" checked={selectedIngredients.includes(ingredient)} onChange={() => toggleIngredient(ingredient)} />
                        </label>
                     )
                   ))}
                 </div>

                 {isEditingPantry && (
                    <div className="mt-4 relative">
                      <Plus className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      <input 
                        type="text"
                        value={newPantryInput}
                        onChange={(e) => setNewPantryInput(e.target.value)}
                        onKeyDown={handleAddToPantry}
                        placeholder="Add staple & press Enter..."
                        className="w-full bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:border-brand-green outline-none"
                      />
                    </div>
                 )}
               </div>
             )}
          </div>

          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm dark:shadow-none transition-colors">
             <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Search / Add Ingredients</h2>
             <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search or add ingredients (Press Enter)" 
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:border-brand-green outline-none transition-colors shadow-sm text-sm"
                />
             </div>
             <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Your Basket ({selectedIngredients.length})</p>
                <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    {selectedIngredients.length > 0 ? (
                        selectedIngredients.map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-lg text-sm font-medium animate-fade-in">
                                {item}
                                <button onClick={() => removeIngredient(item)} className="hover:bg-brand-green/20 rounded-full p-0.5"><X size={14} /></button>
                            </span>
                        ))
                    ) : (
                        <span className="text-sm text-gray-400 italic flex items-center w-full justify-center">No ingredients added yet.</span>
                    )}
                </div>
             </div>
          </div>
          
          <button 
              onClick={openChatbot}
              disabled={selectedIngredients.length === 0}
              className="w-full bg-brand-green hover:bg-brand-green-hover disabled:bg-gray-300 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20"
          >
              <MessageSquare size={20} /> Generate Recipes (AI)
          </button>
        </div>

        {/* RIGHT COLUMN: Recipe Display */}
        <div className="lg:col-span-7">
           {!generatedRecipe ? (
             <div className="bg-white dark:bg-dark-card border-2 border-dashed border-gray-200 dark:border-dark-border rounded-3xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px] transition-colors">
                <div className="w-24 h-24 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 rounded-full flex items-center justify-center mb-6">
                    <ChefHat size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your Kitchen Awaits</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Add your ingredients on the left, click generate, and chat with our AI to get a perfectly tailored recipe.
                </p>
             </div>
           ) : (
             <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-200 dark:border-dark-border shadow-sm h-full flex flex-col animate-fade-in">
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                   <div>
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{generatedRecipe.title}</h2>
                     <p className="text-brand-green font-medium">{generatedRecipe.calories} Calories • Custom Built</p>
                   </div>
                   <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center shrink-0">
                     <ChefHat size={32} />
                   </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-8">{generatedRecipe.description}</p>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Instructions</h3>
                
                <div className="space-y-4 overflow-y-auto pr-2 pb-6 mb-2 flex-1">
                  {/* SAFE MAP FUNCTION */}
                  {generatedRecipe.steps?.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 pt-1">{step}</p>
                    </div>
                  ))}
                </div>

                {/* NEW NUTRITION HIGHLIGHT SECTION */}
                <div className="bg-brand-green/5 dark:bg-brand-green/10 border border-brand-green/20 rounded-xl p-4 mb-6 mt-auto">
                   <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                     <Flame size={18} className="text-brand-green" /> Nutritional Estimate
                   </h4>
                   <p className="text-gray-600 dark:text-gray-300 text-sm">
                     Based on the strict quantities of the ingredients provided, this recipe contains approximately <strong className="text-brand-green text-lg">{generatedRecipe.calories}</strong> total calories.
                   </p>
                </div>

                <div className="pt-2">
                   <button 
                     onClick={handleSaveRecipe}
                     disabled={isSaved || isSaving}
                     className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${isSaved ? 'bg-brand-green text-white' : 'bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white'}`}
                   >
                     <Bookmark size={24} className={isSaved ? "fill-current" : ""} />
                     {isSaving ? 'Saving to Cookbook...' : isSaved ? 'Saved to My Recipes!' : 'Save Recipe to Cookbook'}
                   </button>
                </div>

             </div>
           )}
        </div>
      </div>

      {/* CHATBOT MODAL OVERLAY */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col h-[600px] border border-gray-200 dark:border-dark-border overflow-hidden">
            
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-dark-bg/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">NutriVision AI Chef</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customizing your recipe</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-dark-bg rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-dark-card">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-green text-white' : 'bg-gray-100 dark:bg-dark-bg text-brand-green'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-brand-green text-white rounded-tr-sm' : 'bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-bg text-brand-green flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800 rounded-tl-sm flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">Formulating recipe...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your preferences (e.g., I'm keto, only have a stove...)"
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-full pl-6 pr-14 py-4 text-gray-900 dark:text-white focus:border-brand-green outline-none transition-colors"
                  disabled={isGenerating}
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isGenerating}
                  className="absolute right-2 p-2.5 bg-brand-green text-white rounded-full hover:bg-brand-green-hover disabled:bg-gray-300 disabled:dark:bg-gray-700 transition-colors"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}
    </div>
  );
}