'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewQuiz() {
  const router = useRouter();
  
  // State variables to hold form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(''); 
  const [loading, setLoading] = useState(false);

  // 1. On Load: Get the current User ID from the backend
  useEffect(() => {
    fetch('http://localhost:3000/lti/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log("🔍 Current User Data:", data);
        
        // We look for the ID in 'id' (our new standard) or 'sub' (JWT standard)
        const foundId = data.id || data.sub;
        
        if (foundId) {
          setUserId(foundId);
        } else {
          console.error("❌ User ID not found. Are you logged in?");
          // Optional: Redirect to login if no user found
          // router.push('/login');
        }
      })
      .catch(err => console.error("Auth check failed", err));
  }, []);

  // 2. The Submit Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop page refresh

    if (!userId) {
      alert("⚠️ Error: You are not logged in properly. User ID is missing.");
      return;
    }

    setLoading(true);

    try {
      // Send data to the Backend
      const res = await fetch('http://localhost:3000/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          userId // connect the quiz to "Dev Diana"
        }),
      });

      if (res.ok) {
        console.log("✅ Quiz Saved!");
        router.push('/dashboard'); // Go back home on success
      } else {
        const err = await res.json();
        alert(`Failed to save: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection Error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">✍️ Create New Quiz</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block font-bold mb-2 text-gray-700">Quiz Title</label>
          <input 
            required
            className="w-full border-2 border-gray-300 p-3 rounded text-lg focus:border-purple-500 outline-none" 
            placeholder="e.g. Intro to Biology - Week 1"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block font-bold mb-2 text-gray-700">Description</label>
          <textarea 
            className="w-full border-2 border-gray-300 p-3 rounded h-32 focus:border-purple-500 outline-none" 
            placeholder="Instructions for the student..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button 
            type="button"
            onClick={() => router.back()}
            className="text-gray-500 px-6 py-3 font-bold hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}