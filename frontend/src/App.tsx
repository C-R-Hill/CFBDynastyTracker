import React, { useState, useEffect } from 'react'
import CoachForm from './components/CoachForm'
import DynastySelector from './components/DynastySelector'
import { Dynasty, Coach } from './services/api'
import api from './services/api'

function App() {
  const [selectedDynasty, setSelectedDynasty] = useState<Dynasty | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [updatingCoach, setUpdatingCoach] = useState<string | null>(null);

  // Fetch coaches when dynasty is selected
  useEffect(() => {
    const fetchCoaches = async () => {
      if (!selectedDynasty) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getCoaches(selectedDynasty._id);
        setCoaches(data);
      } catch (err: any) {
        // Only set error if it's not a 404 (no coaches found)
        if (err.response?.status !== 404) {
          setError('Failed to fetch coaches. Please try again later.');
          console.error('Error fetching coaches:', err);
        } else {
          // If it's a 404, just set empty coaches list
          setCoaches([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoaches();
  }, [selectedDynasty]);

  const handleCoachCreated = (newCoach: Coach) => {
    setCoaches(prevCoaches => [newCoach, ...prevCoaches]);
    setShowCreateForm(false); // Hide form after successful creation
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRecordUpdate = async (coachId: string, wins: number, losses: number) => {
    if (!selectedDynasty) return;
    
    try {
      setUpdatingCoach(coachId);
      const updatedCoach = await api.updateCoach(selectedDynasty._id, coachId, { wins, losses });
      setCoaches(prevCoaches => 
        prevCoaches.map(coach => 
          coach._id === coachId ? updatedCoach : coach
        )
      );
    } catch (err) {
      console.error('Error updating coach record:', err);
    } finally {
      setUpdatingCoach(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            CFB Companion App
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {selectedDynasty ? (
              <div>
                {/* Dynasty Header */}
                <div className="mb-6 flex items-center justify-between bg-white shadow-sm rounded-lg p-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedDynasty.name}</h2>
                    <p className="text-sm text-gray-500">Started {formatDate(selectedDynasty.startDate)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDynasty(null);
                      setCoaches([]);
                      setShowCreateForm(false);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Change Dynasty
                  </button>
                </div>

                {/* Create Coach Section */}
                <div className="mb-6">
                  {showCreateForm ? (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">Create New Coach</h3>
                          <button
                            onClick={() => setShowCreateForm(false)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <CoachForm 
                          dynasty={selectedDynasty} 
                          onCoachCreated={handleCoachCreated}
                          currentCoaches={coaches}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={coaches.length >= 8}
                    >
                      {coaches.length >= 8 ? 'Maximum Coaches Reached' : 'Add New Coach'}
                    </button>
                  )}
                </div>

                {/* Coaches List Section */}
                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
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
                )}
                
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : coaches.length > 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="border-t border-gray-200">
                      <ul className="divide-y divide-gray-200">
                        {coaches.map((coach) => (
                          <li key={coach._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium text-blue-600">
                                    {coach.firstName} {coach.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {coach.college}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <label htmlFor={`wins-${coach._id}`} className="text-sm text-gray-500">
                                      Wins:
                                    </label>
                                    <input
                                      type="number"
                                      id={`wins-${coach._id}`}
                                      min="0"
                                      value={coach.wins}
                                      onChange={(e) => {
                                        const wins = parseInt(e.target.value) || 0;
                                        if (wins >= 0) {
                                          handleRecordUpdate(coach._id!, wins, coach.losses);
                                        }
                                      }}
                                      className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                      disabled={updatingCoach === coach._id}
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <label htmlFor={`losses-${coach._id}`} className="text-sm text-gray-500">
                                      Losses:
                                    </label>
                                    <input
                                      type="number"
                                      id={`losses-${coach._id}`}
                                      min="0"
                                      value={coach.losses}
                                      onChange={(e) => {
                                        const losses = parseInt(e.target.value) || 0;
                                        if (losses >= 0) {
                                          handleRecordUpdate(coach._id!, coach.wins, losses);
                                        }
                                      }}
                                      className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                      disabled={updatingCoach === coach._id}
                                    />
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Win %: {coach.winPercentage}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">Please create a coach to continue.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DynastySelector onDynastySelect={setSelectedDynasty} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 