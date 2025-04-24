import React, { useState, useEffect } from 'react';
import api, { Dynasty, CreateDynastyData } from '../services/api';

interface DynastySelectorProps {
  onDynastySelect: (dynasty: Dynasty | null) => void;
}

const DynastySelector: React.FC<DynastySelectorProps> = ({ onDynastySelect }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDynastyName, setNewDynastyName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dynasties, setDynasties] = useState<Dynasty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dynasties on component mount
  useEffect(() => {
    const fetchDynasties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getDynasties();
        setDynasties(data);
      } catch (err) {
        setError('Failed to fetch dynasties. Please try again later.');
        console.error('Error fetching dynasties:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynasties();
  }, []);

  const handleCreateDynasty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const newDynasty = await api.createDynasty({
        name: newDynastyName,
        startDate
      });
      setDynasties([newDynasty, ...dynasties]);
      onDynastySelect(newDynasty);
    } catch (err) {
      setError('Failed to create dynasty. Please try again.');
      console.error('Error creating dynasty:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dynasty Manager</h1>
        
        {!showCreateForm ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Existing Dynasty</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : dynasties.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {dynasties.map((dynasty) => (
                    <button
                      key={dynasty._id}
                      onClick={() => onDynastySelect(dynasty)}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{dynasty.name}</h3>
                        <p className="text-sm text-gray-500">Started {formatDate(dynasty.startDate)}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No dynasties found. Create your first one!</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Create New Dynasty
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Dynasty</h2>
            <form onSubmit={handleCreateDynasty} className="space-y-4">
              <div>
                <label htmlFor="dynastyName" className="block text-sm font-medium text-gray-700">
                  Dynasty Name
                </label>
                <input
                  type="text"
                  id="dynastyName"
                  value={newDynastyName}
                  onChange={(e) => setNewDynastyName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                  placeholder="e.g., Crimson Tide Legacy"
                />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                  min="2000-01-01"
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Select the date your dynasty begins
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Dynasty'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynastySelector; 