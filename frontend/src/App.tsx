import React, { useState, useEffect } from 'react'
import CoachForm from './components/CoachForm'
import DynastySelector from './components/DynastySelector'
import TeamSelector from './components/TeamSelector'
import TeamSymbol from './components/TeamSymbol'
import { Dynasty, Coach } from './services/api'
import api from './services/api'
import { Menu } from '@headlessui/react'

interface Team {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

function App() {
  const [selectedDynasty, setSelectedDynasty] = useState<Dynasty | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [updatingCoach, setUpdatingCoach] = useState<string | null>(null);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Load selected team from localStorage on component mount
  useEffect(() => {
    const savedTeam = localStorage.getItem('selectedTeam');
    if (savedTeam) {
      const team = JSON.parse(savedTeam);
      setSelectedTeam(team);
      applyTeamColors(team);
    }
  }, []);

  // Save selected team to localStorage when it changes
  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam));
    }
  }, [selectedTeam]);

  const applyTeamColors = (team: Team) => {
    document.documentElement.style.setProperty('--primary-color', team.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', team.secondaryColor);
  };

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

  const handleSeasonUpdate = async (coachId: string, year: number, wins: number, losses: number) => {
    if (!selectedDynasty) return;
    
    try {
      setUpdatingCoach(coachId);
      const updatedCoach = await api.updateSeason(selectedDynasty._id, coachId, year, { wins, losses });
      setCoaches(prevCoaches => 
        prevCoaches.map(coach => 
          coach._id === coachId ? updatedCoach : coach
        )
      );
    } catch (err) {
      console.error('Error updating season stats:', err);
    } finally {
      setUpdatingCoach(null);
    }
  };

  const handleToggleSeasonEdit = async (coachId: string, year: number) => {
    if (!selectedDynasty) return;
    
    try {
      setUpdatingCoach(coachId);
      const updatedCoach = await api.toggleSeasonEdit(selectedDynasty._id, coachId, year);
      setCoaches(prevCoaches => 
        prevCoaches.map(coach => 
          coach._id === coachId ? updatedCoach : coach
        )
      );
    } catch (err) {
      console.error('Error toggling season edit:', err);
    } finally {
      setUpdatingCoach(null);
    }
  };

  const handleStartNewSeason = async () => {
    if (!selectedDynasty) return;
    
    try {
      setIsLoading(true);
      const updatedCoaches = await api.startNewSeason(selectedDynasty._id);
      setCoaches(updatedCoaches);
    } catch (err) {
      console.error('Error starting new season:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToHome = () => {
    setSelectedDynasty(null);
    setCoaches([]);
    setShowCreateForm(false);
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    applyTeamColors(team);
  };

  const isLightColor = (color: string): boolean => {
    // Remove the '#' if present
    const hex = color.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance using WCAG formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
  };

  const getTextContrastClass = (color: string, size: 'sm' | 'md' | 'lg' = 'md'): string => {
    // Only apply contrast effects to large text using secondary color
    if (size === 'lg' && isLightColor(color)) {
      return 'text-contrast-lg';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-primary">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReturnToHome}
              className={`text-3xl font-bold text-secondary hover:opacity-90 transition-colors ${
                selectedTeam ? getTextContrastClass(selectedTeam.secondaryColor, 'lg') : ''
              }`}
            >
              College Football Dynasty Tracker
            </button>
            <div className="flex items-center">
              <TeamSymbol team={selectedTeam} />
              <Menu as="div" className="relative">
                <Menu.Button className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <span className="sr-only">Open menu</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleReturnToHome}
                          className={`${
                            active ? 'bg-primary text-white' : 'text-gray-900'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          Home
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setShowTeamSelector(true)}
                          className={`${
                            active ? 'bg-primary text-white' : 'text-gray-900'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          Change Favorite Team
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            // TODO: Implement logout functionality
                            console.log('Logout clicked');
                          }}
                          className={`${
                            active ? 'bg-primary text-white' : 'text-gray-900'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          Log Out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <TeamSelector
        isOpen={showTeamSelector}
        onClose={() => setShowTeamSelector(false)}
        onTeamSelect={handleTeamSelect}
        currentTeam={selectedTeam}
      />

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {selectedDynasty ? (
              <div>
                {/* Dynasty Header */}
                <div className="mb-6 flex items-center justify-between bg-white shadow-sm rounded-lg p-4">
                  <div>
                    <h2 className={`text-2xl font-bold text-secondary ${
                      selectedTeam ? getTextContrastClass(selectedTeam.secondaryColor, 'lg') : ''
                    }`}>
                      {selectedDynasty.name}
                    </h2>
                    <p className="text-sm text-gray-500">Started {formatDate(selectedDynasty.startDate)}</p>
                  </div>
                  <button
                    onClick={handleReturnToHome}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
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
                          <h3 className="text-lg font-medium text-primary">
                            Create New Coach
                          </h3>
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
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50"
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                  </div>
                ) : coaches.length > 0 ? (
                  <div>
                    <div className="mb-4 flex justify-end">
                      <button
                        onClick={handleStartNewSeason}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                      >
                        Start New Season
                      </button>
                    </div>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="border-t border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          {coaches.map((coach) => (
                            <li key={coach._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-primary">
                                      {coach.firstName} {coach.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {coach.college}
                                    </p>
                                  </div>
                                  
                                  {/* Seasons */}
                                  <div className="space-y-3">
                                    {coach.seasons
                                      .slice()
                                      .sort((a, b) => b.year - a.year)
                                      .map((season) => (
                                        <div key={season.year} className="flex items-center space-x-4">
                                          <span className="text-sm text-gray-500 w-16">
                                            {season.year}:
                                          </span>
                                          
                                          <div className="flex items-center space-x-2">
                                            <label htmlFor={`wins-${coach._id}-${season.year}`} className="text-sm text-gray-500">
                                              Wins:
                                            </label>
                                            <input
                                              key={`wins-${coach._id}-${season.year}-${season.isEditable}`}
                                              type="number"
                                              id={`wins-${coach._id}-${season.year}`}
                                              min="0"
                                              value={season.wins}
                                              onChange={(e) => {
                                                const wins = parseInt(e.target.value) || 0;
                                                if (wins >= 0) {
                                                  handleSeasonUpdate(coach._id!, season.year, wins, season.losses);
                                                }
                                              }}
                                              className="w-16 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                              disabled={updatingCoach === coach._id || (!season.isEditable && season.year !== coach.currentSeason)}
                                            />
                                          </div>
                                          
                                          <div className="flex items-center space-x-2">
                                            <label htmlFor={`losses-${coach._id}-${season.year}`} className="text-sm text-gray-500">
                                              Losses:
                                            </label>
                                            <input
                                              key={`losses-${coach._id}-${season.year}-${season.isEditable}`}
                                              type="number"
                                              id={`losses-${coach._id}-${season.year}`}
                                              min="0"
                                              value={season.losses}
                                              onChange={(e) => {
                                                const losses = parseInt(e.target.value) || 0;
                                                if (losses >= 0) {
                                                  handleSeasonUpdate(coach._id!, season.year, season.wins, losses);
                                                }
                                              }}
                                              className="w-16 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                              disabled={updatingCoach === coach._id || (!season.isEditable && season.year !== coach.currentSeason)}
                                            />
                                          </div>

                                          {/* Edit/Save Controls - Only show for past seasons */}
                                          {season.year !== coach.currentSeason && (
                                            <div className="flex items-center space-x-2">
                                              {season.isEditable ? (
                                                <button
                                                  onClick={() => handleToggleSeasonEdit(coach._id!, season.year)}
                                                  className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                                                  disabled={updatingCoach === coach._id}
                                                  title="Save changes"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                  </svg>
                                                </button>
                                              ) : (
                                                <button
                                                  onClick={() => handleToggleSeasonEdit(coach._id!, season.year)}
                                                  className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                  disabled={updatingCoach === coach._id}
                                                  title="Enable editing"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                  </svg>
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>

                                  <div className="mt-2 text-sm text-gray-500">
                                    Career: {coach.wins}-{coach.losses} ({coach.winPercentage}%)
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
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