import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Camera, Send, Trash2 } from 'lucide-react';

const UpdatesTab = ({ currentUser }) => {
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handleAddStory = async () => {
    if (newStory.trim() || selectedImage) {
      const formData = new FormData();
      formData.append('content', newStory);
      formData.append('username', currentUser.username);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      try {
        const response = await fetch('/api/stories', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          fetchStories();
          setNewStory('');
          setSelectedImage(null);
          setIsAdding(false);
        }
      } catch (error) {
        console.error('Error adding story:', error);
      }
    }
  };

  const handleDeleteStory = async (id) => {
    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchStories();
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900">Stories</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-gray-200/20 rounded-full hover:bg-white/90 transition-all shadow-sm"
        >
          <PlusCircle size={20} className="text-gray-900" />
          <span className="text-sm font-semibold text-gray-900">New Story</span>
        </button>
      </div>

      {/* Add Story Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Create Story</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-gray-500 hover:text-gray-700 rounded-full p-2 hover:bg-gray-100/50"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <textarea
                value={newStory}
                onChange={(e) => setNewStory(e.target.value)}
                placeholder="Share something..."
                className="w-full p-4 bg-gray-50/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none text-gray-900 text-lg"
                rows={4}
              />
              {selectedImage && (
                <div className="relative w-full h-40 bg-gray-100 rounded-2xl overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <label className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100/50 rounded-full transition-colors cursor-pointer">
                  <Camera size={20} />
                  <span className="text-sm font-medium">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleAddStory}
                  className="flex items-center gap-2 px-8 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Send size={20} />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stories List */}
      <div className="space-y-6">
        {stories && stories.map((story) => (
          <div
            key={story.id}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100/20 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                  {story.username.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">{story.username}</h3>
                  <span className="text-xs text-gray-400">{new Date(story.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteStory(story.id)}
                className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <p className="text-2xl font-semibold text-gray-900 leading-relaxed mb-4">{story.content}</p>
            {story.image_url && (
              <div className="mt-4 rounded-2xl overflow-hidden">
                <img
                  src={story.image_url}
                  alt="Story"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdatesTab;
