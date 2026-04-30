import React, { useState, useEffect } from 'react';
import { ChefHat, Flame, ThumbsUp, ThumbsDown, ExternalLink, X, Users, MessageCircle, Send, Plus, Bookmark, ArrowLeft, Trash2, Pencil, Check, AlertCircle, Info, Image as ImageIcon } from 'lucide-react';
import apiClient from '../api/client';
import { useUser } from '../context/UserContext';

export default function CommunityHub() {
  const { user } = useUser(); 
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [replyInputs, setReplyInputs] = useState({}); 
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postTypeChoice, setPostTypeChoice] = useState(null); 
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // --- CUSTOM POST FORM STATE ---
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customPostImageFile, setCustomPostImageFile] = useState(null);
  const [customImagePreview, setCustomImagePreview] = useState(null); 

  const [myRecipesForSharing, setMyRecipesForSharing] = useState([]);
  const [selectedRecipeTitleToShare, setSelectedRecipeTitleToShare] = useState('');

  // EDIT & DELETE STATES
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // TOAST NOTIFICATION STATE
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchCommunityRecipes = async () => {
    try {
      const response = await apiClient.get('/api/v1/community/');
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error("Failed to fetch community recipes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityRecipes();
  }, []);

  const fetchMyRecipesForSharing = async () => {
    try {
      const response = await apiClient.get('/api/v1/saved');
      setMyRecipesForSharing(response.data.recipes);
    } catch (error) {
      console.error("Failed to fetch saved recipes", error);
    }
  };

  // IMAGE PREVIEW HANDLER
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomPostImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // CUSTOM DELETE LOGIC
  const executeDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeletingId(postToDelete);
    try {
      await apiClient.delete(`/api/v1/community/${postToDelete}`);
      setRecipes(prev => prev.filter(p => p._id !== postToDelete));
      showToast("Post deleted successfully! 🗑️", "success");
    } catch (error) {
      console.error("Failed to delete post", error);
      showToast("Failed to delete post. Please try again. 😅", "error");
    } finally {
      setIsDeletingId(null);
      setPostToDelete(null); 
    }
  };

  // EDIT LOGIC
  const startEditing = (post) => {
    setEditingPostId(post._id);
    setEditContent(post.post_type === 'custom' ? post.text : post.title);
  };

  const submitEdit = async (post) => {
    if (!editContent.trim()) {
      setEditingPostId(null);
      return;
    }
    
    try {
      const payload = post.post_type === 'custom' ? { text: editContent } : { title: editContent };
      await apiClient.put(`/api/v1/community/${post._id}`, payload);
      
      setRecipes(prev => prev.map(p => p._id === post._id ? { ...p, ...payload } : p));
      setEditingPostId(null);
      showToast("Edits saved! ✏️", "success");
    } catch (error) {
      showToast("Failed to save edits.", "error");
    }
  };

  const handleVote = async (recipeId, currentVote, voteType) => {
    const newVote = currentVote === voteType ? "none" : voteType;
    setRecipes(prevRecipes => prevRecipes.map(recipe => {
      if (recipe._id === recipeId) {
        let newUp = recipe.upvotes;
        let newDown = recipe.downvotes;
        if (currentVote === "up") newUp = Math.max(0, newUp - 1);
        if (currentVote === "down") newDown = Math.max(0, newDown - 1);
        if (newVote === "up") newUp += 1;
        if (newVote === "down") newDown += 1;
        return { ...recipe, user_vote: newVote, upvotes: newUp, downvotes: newDown };
      }
      return recipe;
    }));
    try {
      await apiClient.post(`/api/v1/community/${recipeId}/vote`, { vote_type: newVote });
    } catch (error) { fetchCommunityRecipes(); }
  };

  const handleReplySubmit = async (recipeId) => {
    const text = replyInputs[recipeId];
    if (!text || !text.trim()) return;
    setIsSubmittingReply(true);
    try {
      const response = await apiClient.post(`/api/v1/community/${recipeId}/reply`, { text: text.trim() });
      setRecipes(prev => prev.map(recipe => {
        if (recipe._id === recipeId) {
          return { ...recipe, replies: [...(recipe.replies || []), response.data.reply] };
        }
        return recipe;
      }));
      setReplyInputs(prev => ({ ...prev, [recipeId]: '' }));
      showToast("Comment added!", "success");
    } catch (error) {
      if (error.response?.status === 400) {
        showToast("You have already replied to this post! 😉", "info");
      } else {
        showToast("Failed to post reply.", "error");
      }
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleCreatePostSubmit = async () => {
    if (isSubmittingPost || !postTypeChoice) return;
    setIsSubmittingPost(true);

    try {
      let payload = {};
      
      if (postTypeChoice === 'custom') {
        if (!customTitle.trim()) { showToast("Please give your recipe a title!", "error"); setIsSubmittingPost(false); return; }
        
        // --- NEW CLOUDINARY LOGIC ---
        let cloudinaryUrl = null;
        if (customPostImageFile) {
          try {
            const formData = new FormData();
            formData.append('file', customPostImageFile);
            
            const uploadRes = await apiClient.post('/api/v1/community/upload-image', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            cloudinaryUrl = uploadRes.data.url;
          } catch (uploadError) {
            showToast("Failed to upload image.", "error");
            setIsSubmittingPost(false);
            return;
          }
        }
        // -----------------------------

        payload = {
          post_type: 'custom',
          title: customTitle.trim(), 
          text: customDescription.trim(),
          image: cloudinaryUrl, // <-- Injected Cloudinary URL here
          ingredients: customIngredients.split('\n').filter(i => i.trim() !== ''),
          calories: 0, 
          instructions: customInstructions.split('\n').filter(i => i.trim() !== '')
        };
      } else {
        if (!selectedRecipeTitleToShare) { showToast("Please select a recipe!", "error"); setIsSubmittingPost(false); return; }
        const recipeToShare = myRecipesForSharing.find(r => r.title === selectedRecipeTitleToShare);
        payload = {
          post_type: 'recipe',
          title: recipeToShare.title,
          ingredients: recipeToShare.ingredients,
          calories: recipeToShare.calories,
          instructions: recipeToShare.instructions,
          health_tags: recipeToShare.health_tags || []
        };
      }

      await apiClient.post('/api/v1/community/share', payload);
      
      // Reset everything after success
      setIsCreatingPost(false); 
      setPostTypeChoice(null); 
      setCustomTitle('');
      setCustomDescription('');
      setCustomIngredients('');
      setCustomInstructions('');
      setCustomImagePreview(null);
      setCustomPostImageFile(null);
      setSelectedRecipeTitleToShare('');
      
      fetchCommunityRecipes();
      showToast("Successfully shared with the community! 🎉", "success");
    } catch (error) {
      if (error.response?.status === 400) {
        showToast("You already shared this to the community! 😉", "info");
      } else {
        showToast("Failed to share post.", "error");
      }
    } finally { setIsSubmittingPost(false); }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-brand-green">
        <div className="flex flex-col items-center gap-4">
          <Users size={48} className="animate-bounce" />
          <p className="font-bold text-xl">Loading the feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8 relative pb-12">
      
      <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
             <Users className="text-brand-green" /> Community Feed
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            See what other chefs are cooking, rate recipes, and share your own!
          </p>
        </div>
        <button 
          onClick={() => setIsCreatingPost(true)}
          className="bg-brand-green hover:bg-brand-green-hover text-white px-5 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20 shrink-0"
        >
          <Plus size={20} /> Create a Post
        </button>
      </header>

      {recipes.length === 0 ? (
        <div className="bg-white dark:bg-dark-card border-2 border-dashed border-gray-200 dark:border-dark-border rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <ChefHat size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">It's quiet in here...</h2>
          <p className="text-gray-500">Be the first to create a post or share a recipe!</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-8">
          {recipes.map((post) => {
            const replies = post.replies || [];
            const hasReplied = replies.some(r => r.user_email === user?.email);
            const isCustomPost = post.post_type === 'custom';
            
            const isAuthor = post.author_email === user?.email;
            const isEditing = editingPostId === post._id;

            return (
              <div key={post._id} className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
                
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-lg">
                      {post.author_username ? post.author_username[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{post.author_username}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isCustomPost ? 'Shared a post' : 'Shared a recipe to the community'}
                      </p>
                    </div>
                  </div>

                  {isAuthor && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditing(post)} className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-full transition-colors">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => setPostToDelete(post._id)} disabled={isDeletingId === post._id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  {isCustomPost ? (
                    <div className="space-y-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea 
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-32 bg-gray-50 dark:bg-dark-bg border border-brand-green rounded-xl p-3 text-sm focus:outline-none resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingPostId(null)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={() => submitEdit(post)} className="px-4 py-2 text-sm font-bold bg-brand-green text-white rounded-lg hover:bg-brand-green-hover flex items-center gap-2">
                              <Check size={16} /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post.title}</h3>
                          </div>
                          
                          {/* Render the description if it exists */}
                          {post.text && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 italic">
                              "{post.text}"
                            </p>
                          )}

                          {/* Render image if it exists */}
                          {post.image && (
                            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-4 mt-2">
                              <img src={post.image} alt="Post attachment" className="w-full max-h-96 object-cover" />
                            </div>
                          )}

                          {/* Because we formatted it as a recipe, we can use the Read Full Recipe button! */}
                          <button 
                            onClick={() => setSelectedRecipe(post)}
                            className="text-brand-green hover:text-brand-green-hover text-sm font-bold flex items-center gap-1 transition-colors bg-white dark:bg-dark-card px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 w-fit"
                          >
                            Read full recipe <ExternalLink size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        {isEditing ? (
                           <div className="flex-1 flex gap-2">
                             <input type="text" value={editContent} onChange={(e) => setEditContent(e.target.value)} className="flex-1 bg-white border border-brand-green rounded-lg px-3 py-1 text-sm outline-none" />
                             <button onClick={() => submitEdit(post)} className="p-1.5 bg-brand-green text-white rounded-lg"><Check size={16}/></button>
                             <button onClick={() => setEditingPostId(null)} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg"><X size={16}/></button>
                           </div>
                        ) : (
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post.title}</h3>
                        )}
                        
                        <span className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                          <Flame size={12}/> {post.calories} kcal
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        <span className="font-bold text-gray-900 dark:text-gray-200">Ingredients: </span> 
                        {post.ingredients?.join(', ')}
                      </p>
                      <button 
                        onClick={() => setSelectedRecipe(post)}
                        className="text-brand-green hover:text-brand-green-hover text-sm font-bold flex items-center gap-1 transition-colors bg-white dark:bg-dark-card px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 w-fit"
                      >
                        Read full recipe <ExternalLink size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
                  <span className="text-sm font-medium text-gray-500">Love this?</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleVote(post._id, post.user_vote, "up")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${post.user_vote === "up" ? 'bg-brand-green/10 text-brand-green' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      <ThumbsUp size={16} className={post.user_vote === "up" ? "fill-current" : ""} /> {post.upvotes || 0}
                    </button>
                    <button 
                      onClick={() => handleVote(post._id, post.user_vote, "down")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${post.user_vote === "down" ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      <ThumbsDown size={16} className={post.user_vote === "down" ? "fill-current" : ""} /> {post.downvotes || 0}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                    <MessageCircle size={16} /> Comments ({replies.length})
                  </div>
                  
                  {replies.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {replies.map((reply, idx) => (
                        <div key={idx} className="bg-white dark:bg-dark-card p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                              {reply.username ? reply.username[0].toUpperCase() : 'U'}
                            </div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">{reply.username}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm ml-7">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!hasReplied ? (
                    <div className="relative mt-2">
                      <input 
                        type="text" 
                        value={replyInputs[post._id] || ''}
                        onChange={(e) => setReplyInputs(prev => ({...prev, [post._id]: e.target.value}))}
                        placeholder="Write a comment..."
                        className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-full pl-5 pr-12 py-3 text-sm text-gray-900 dark:text-white focus:border-brand-green outline-none transition-colors shadow-sm"
                        disabled={isSubmittingReply}
                        onKeyDown={(e) => {
                          if(e.key === 'Enter') handleReplySubmit(post._id);
                        }}
                      />
                      <button 
                        onClick={() => handleReplySubmit(post._id)}
                        disabled={!replyInputs[post._id]?.trim() || isSubmittingReply}
                        className="absolute right-2 top-2 p-1.5 bg-brand-green text-white rounded-full hover:bg-brand-green-hover disabled:bg-gray-300 disabled:dark:bg-gray-700 transition-colors"
                      >
                        <Send size={16} className="ml-0.5 mt-0.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-center text-gray-500 italic mt-2">
                      You have already replied to this post.
                    </p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE POST MODAL */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-dark-border">
            
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-dark-bg">
              <div className="flex items-center gap-3">
                {postTypeChoice && (
                  <button onClick={() => setPostTypeChoice(null)} className="p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors">
                    <ArrowLeft size={18} className="text-gray-700 dark:text-gray-200" />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create a Post</h2>
              </div>
              <button onClick={() => { setIsCreatingPost(false); setPostTypeChoice(null); }} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-dark-card rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!postTypeChoice && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setPostTypeChoice('custom')} 
                    className="flex-1 bg-white dark:bg-dark-card p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-800 text-center hover:border-brand-green hover:bg-brand-green/5 transition-all group"
                  >
                    <div className="w-16 h-16 bg-gray-50 dark:bg-dark-bg rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-green/10 transition-colors">
                      <MessageCircle size={32} className="text-gray-400 group-hover:text-brand-green" />
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Custom Recipe</h4>
                    <p className="text-sm text-gray-500">Write your own recipe and attach a photo.</p>
                  </button>

                  <button 
                    onClick={() => { fetchMyRecipesForSharing(); setPostTypeChoice('recipe'); }} 
                    className="flex-1 bg-white dark:bg-dark-card p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-800 text-center hover:border-brand-green hover:bg-brand-green/5 transition-all group"
                  >
                    <div className="w-16 h-16 bg-gray-50 dark:bg-dark-bg rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-green/10 transition-colors">
                      <Bookmark size={32} className="text-gray-400 group-hover:text-brand-green" />
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Share a Recipe</h4>
                    <p className="text-sm text-gray-500">Pick a meal straight from your AI cookbook.</p>
                  </button>
                </div>
              )}

              {/* CUSTOM POST WORKFLOW (PROFESSIONAL FORM) */}
              {postTypeChoice === 'custom' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* TOP ROW: Image Left, Details Right */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    
                    {/* Image Upload - Top Left */}
                    <div className="w-full sm:w-1/3 shrink-0">
                      <label className="flex flex-col items-center justify-center w-full aspect-square bg-gray-50 dark:bg-dark-bg border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-brand-green hover:bg-brand-green/5 transition-all overflow-hidden relative group">
                        {customImagePreview ? (
                          <img src={customImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <ImageIcon size={32} className="text-gray-400 mb-2 group-hover:text-brand-green transition-colors" />
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Upload Photo</span>
                            <span className="text-xs text-gray-500 mt-1">Click to browse</span>
                          </div>
                        )}
                        <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
                      </label>
                      {customImagePreview && (
                        <button 
                          onClick={(e) => { e.preventDefault(); setCustomPostImageFile(null); setCustomImagePreview(null); }} 
                          className="w-full mt-2 py-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>

                    {/* Title & Description - Right */}
                    <div className="w-full sm:w-2/3 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipe Title</label>
                        <input 
                          type="text" 
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="e.g., Enter Recipe's Name..."
                          className="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Short Description</label>
                        <textarea 
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          placeholder="Tell us a little about this dish..."
                          className="w-full h-24 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-brand-green outline-none resize-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* INGREDIENTS SECTION */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ingredients (One per line)</label>
                    <textarea 
                      value={customIngredients}
                      onChange={(e) => setCustomIngredients(e.target.value)}
                      placeholder="2 cups of flour&#10;1 tsp of salt&#10;3 large eggs..."
                      className="w-full h-32 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:border-brand-green outline-none resize-none leading-relaxed transition-colors"
                    />
                  </div>

                  {/* STEPS SECTION */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Instructions (One per line)</label>
                    <textarea 
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="1. Preheat the oven to 350°F...&#10;2. Mix the dry ingredients together...&#10;3. Bake for 25 minutes..."
                      className="w-full h-32 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:border-brand-green outline-none resize-none leading-relaxed transition-colors"
                    />
                  </div>
                </div>
              )}

              {postTypeChoice === 'recipe' && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-bold text-sm text-gray-500 mb-2">Select from your Cookbook ({myRecipesForSharing.length})</h4>
                  <div className="max-h-80 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    {myRecipesForSharing.length > 0 ? (
                      myRecipesForSharing.map(recipe => (
                        <label key={recipe.title} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRecipeTitleToShare === recipe.title ? 'bg-brand-green/5 border-brand-green' : 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}>
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              checked={selectedRecipeTitleToShare === recipe.title} 
                              onChange={() => setSelectedRecipeTitleToShare(recipe.title)} 
                              className="w-4 h-4 text-brand-green focus:ring-brand-green" 
                            />
                            <h5 className="font-bold text-gray-900 dark:text-white">{recipe.title}</h5>
                          </div>
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md w-fit ml-7 sm:ml-0">
                            {recipe.calories} kcal
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-center p-8">
                        <ChefHat size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Your cookbook is empty!</p>
                        <p className="text-xs text-gray-500 mt-1">Go generate some recipes first.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {postTypeChoice && (
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card">
                <button 
                  onClick={handleCreatePostSubmit}
                  disabled={isSubmittingPost || (postTypeChoice === 'recipe' && !selectedRecipeTitleToShare) || (postTypeChoice === 'custom' && !customTitle.trim())}
                  className="w-full bg-brand-green hover:bg-brand-green-hover disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={20} /> {isSubmittingPost ? 'Posting...' : 'Share with Community'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL RECIPE VIEW MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-200 dark:border-dark-border">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gray-50 dark:bg-dark-bg">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedRecipe.title}</h2>
                <div className="flex gap-4 text-sm font-bold text-brand-green mt-2">
                  <span className="flex items-center gap-1"><Flame size={16} /> {selectedRecipe.calories} Calories</span>
                </div>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-dark-card rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              
              {selectedRecipe.text && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About this dish</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm italic border-l-4 border-brand-green/30 pl-3 py-1">"{selectedRecipe.text}"</p>
                </div>
              )}

              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ChefHat size={20} className="text-brand-green" /> Ingredients
                  </h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {selectedRecipe.ingredients.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-dark-bg/50 p-2 rounded-lg text-sm border border-gray-100 dark:border-gray-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Flame size={20} className="text-brand-green" /> Instructions
                  </h3>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {postToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center border border-gray-200 dark:border-dark-border">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Post?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Are you sure you want to permanently delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPostToDelete(null)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeletePost}
                disabled={isDeletingId === postToDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isDeletingId === postToDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC TOAST STYLING */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-fade-in">
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