import React, { useState, useEffect } from 'react';
import api, { Dynasty, CreateDynastyData } from '../services/api';

interface Team {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

interface DynastySelectorProps {
  onDynastySelect: (dynasty: Dynasty | null) => void;
  selectedTeam: Team | null;
  getTextContrastClass: (color: string, size?: 'sm' | 'md' | 'lg') => string;
}

const DynastySelector: React.FC<DynastySelectorProps> = ({ onDynastySelect, selectedTeam, getTextContrastClass }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDynasty, setEditingDynasty] = useState<Dynasty | null>(null);
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

  const handleEditDynasty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDynasty) return;

    try {
      setIsLoading(true);
      setError(null);
      const updatedDynasty = await api.updateDynasty(editingDynasty._id, {
        name: newDynastyName,
        startDate
      });
      setDynasties(dynasties.map(d => d._id === updatedDynasty._id ? updatedDynasty : d));
      setShowEditForm(false);
      setEditingDynasty(null);
    } catch (err) {
      setError('Failed to update dynasty. Please try again.');
      console.error('Error updating dynasty:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDynasty = async (dynastyId: string) => {
    if (!window.confirm('Are you sure you want to delete this dynasty? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.deleteDynasty(dynastyId);
      setDynasties(dynasties.filter(d => d._id !== dynastyId));
    } catch (err) {
      setError('Failed to delete dynasty. Please try again.');
      console.error('Error deleting dynasty:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (dynasty: Dynasty) => {
    setEditingDynasty(dynasty);
    setNewDynastyName(dynasty.name);
    setStartDate(dynasty.startDate.split('T')[0]);
    setShowEditForm(true);
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
        <h1 className={`text-3xl font-bold text-secondary hover:opacity-90 transition-colors mb-8 ${
          selectedTeam ? getTextContrastClass(selectedTeam.secondaryColor, 'lg') : ''
        }`}>Dynasty Hub</h1>
        
        {!showCreateForm && !showEditForm ? (
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
                    <div
                      key={dynasty._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <button
                        onClick={() => onDynastySelect(dynasty)}
                        className="flex-1 text-left"
                      >
                        <h3 className="text-lg font-black hover:opacity-90 transition-colors"
                            style={{ 
                              color: selectedTeam?.secondaryColor || '#1a365d',
                              WebkitTextStroke: selectedTeam ? `1px ${selectedTeam.primaryColor}` : '1px rgba(0, 0, 0, 0.3)',
                              textShadow: selectedTeam ? 
                                `1px 1px 0 ${selectedTeam.primaryColor},
                                -1px -1px 0 ${selectedTeam.primaryColor},
                                1px -1px 0 ${selectedTeam.primaryColor},
                                -1px 1px 0 ${selectedTeam.primaryColor},
                                1px 0 0 ${selectedTeam.primaryColor},
                                -1px 0 0 ${selectedTeam.primaryColor},
                                0 1px 0 ${selectedTeam.primaryColor},
                                0 -1px 0 ${selectedTeam.primaryColor}`
                                : '1px 1px 0 rgba(0, 0, 0, 0.4)'
                            }}
                        >{dynasty.name}</h3>
                        <p className="text-sm text-gray-500">Started {formatDate(dynasty.startDate)}</p>
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(dynasty)}
                          className="p-2 text-gray-400 hover:text-blue-500"
                          title="Edit Dynasty"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteDynasty(dynasty._id)}
                          className="p-2 text-gray-400 hover:text-red-500"
                          title="Delete Dynasty"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors hover:opacity-90"
                style={{
                  backgroundColor: selectedTeam?.primaryColor || '#3B82F6',
                  borderColor: selectedTeam?.primaryColor || '#3B82F6'
                }}
                disabled={isLoading}
              >
                Create New Dynasty
              </button>
            </div>
          </div>
        ) : showEditForm ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Dynasty</h2>
            <form onSubmit={handleEditDynasty} className="space-y-4">
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
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingDynasty(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
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

              <div className="flex space-x-3">
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