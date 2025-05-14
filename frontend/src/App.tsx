import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'  // Bootstrap CSS first
import './index.css'  // Our custom CSS after to override Bootstrap
import CoachForm from './components/CoachForm'
import DynastySelector from './components/DynastySelector'
import TeamSelector from './components/TeamSelector'
import TeamSymbol from './components/TeamSymbol'
import { Dynasty, Coach, UpdateSeasonData, Season } from './services/api'
import api from './services/api'
import { Menu } from '@headlessui/react'
import { teams } from './data/teams'
import { bowlGames } from './data/bowls'
import { bowlTeams } from './data/opponent'
import { Modal, Form, Button } from 'react-bootstrap'
import LandingPage from './components/LandingPage'

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
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [pendingSeasonUpdates, setPendingSeasonUpdates] = useState<Coach[]>([]);
  const [auth, setAuth] = useState<{ token: string | null, user: any | null }>({
    token: localStorage.getItem('token'),
    user: null
  });
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState('HC');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const applyTeamColors = (team: Team) => {
    // Apply colors to CSS variables
    document.documentElement.style.setProperty('--primary-color', team.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', team.secondaryColor);
    // Apply background color to body but don't set text color globally
    document.body.style.backgroundColor = team.primaryColor;
  };

  useEffect(() => {
    if (auth.token && !auth.user) {
      // Fetch user info
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(user => {
          if (user) setAuth(a => ({ ...a, user }));
          else setAuth({ token: null, user: null });
        })
        .catch(() => setAuth({ token: null, user: null }));
    }
  }, [auth.token]);

  const handleAuth = (token: string, user: any) => {
    localStorage.setItem('token', token);
    setAuth({ token, user });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };

  // Load favorite team from backend on login
  useEffect(() => {
    const fetchFavoriteTeam = async () => {
      if (auth.token && auth.user) {
        try {
          const favoriteTeamName = await api.getFavoriteTeam();
          if (favoriteTeamName) {
            const team = teams.find(t => t.name === favoriteTeamName);
            if (team) {
              setSelectedTeam(team);
              applyTeamColors(team);
            }
          } else {
            // If no favorite team is selected, apply default landing page colors
            document.documentElement.style.setProperty('--primary-color', '#1a202c');
            document.documentElement.style.setProperty('--secondary-color', '#ffffff');
            document.body.style.backgroundColor = '#1a202c';
          }
        } catch (err) {
          console.error('Failed to fetch favorite team:', err);
        }
      }
    };
    fetchFavoriteTeam();
  }, [auth.token, auth.user]);

  // Save favorite team to backend when it changes
  const handleTeamSelect = async (team: Team) => {
    setSelectedTeam(team);
    applyTeamColors(team);
    try {
      await api.setFavoriteTeam(team.name);
    } catch (err) {
      console.error('Failed to save favorite team:', err);
    }
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

  const handleSeasonUpdate = async (coachId: string, year: number, field: keyof UpdateSeasonData, value: any, playoffSeed?: number) => {
    let loadingTimeout: ReturnType<typeof setTimeout> | undefined;
    
    try {
      // Input validation
      if (!selectedDynasty) {
        setError('No dynasty selected');
        return;
      }

      // Find the current coach and season
      const coach = coaches.find(c => c._id === coachId);
      const season = coach?.seasons.find(s => s.year === year);
      
      if (!coach || !season) {
        setError('Could not find coach or season');
        return;
      }

      // Start a timer to show loading state only if the operation takes longer than 500ms
      loadingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 500);

      // Validate the value based on field type
      if (field === 'postSeason' && !['none', 'bowl', 'playoff'].includes(value)) {
        setError('Invalid post-season type');
        return;
      }

      if (field === 'playoffSeed' && (typeof value !== 'number' || value < 0)) {
        setError('Invalid playoff seed');
        return;
      }

      const updateData: UpdateSeasonData = {
        wins: season.wins,
        losses: season.losses,
        college: season.college,
        position: season.position,
        confChamp: season.confChamp,
        postSeason: season.postSeason,
        bowlGame: season.bowlGame,
        bowlOpponent: season.bowlOpponent,
        bowlResult: season.bowlResult,
        playoffSeed: season.playoffSeed,
        playoffResult: season.playoffResult
      };

      // Handle different field types appropriately
      if (field === 'postSeason') {
        updateData.postSeason = value as 'none' | 'bowl' | 'playoff';
        
        if (value === 'bowl') {
          updateData.bowlGame = '';
          updateData.bowlResult = false;
          updateData.playoffResult = 'none';
          updateData.playoffSeed = undefined;
        } else if (value === 'playoff') {
          updateData.bowlGame = '';
          updateData.bowlOpponent = '';
          updateData.bowlResult = false;
          updateData.playoffResult = 'none';
        } else {
          // value === 'none'
          updateData.bowlGame = '';
          updateData.bowlOpponent = '';
          updateData.bowlResult = false;
          updateData.playoffSeed = undefined;
          updateData.playoffResult = 'none';
        }
      } else if (field === 'playoffSeed') {
        updateData.playoffSeed = value;
        // Reset playoff result to 'none' if changing to seeds 1-4 and first_round_loss was selected
        if (value >= 1 && value <= 4 && season.playoffResult === 'first_round_loss') {
          updateData.playoffResult = 'none';
        }
      } else {
        updateData[field] = value;
      }

      // Clear any existing error
      setError(null);

      console.log('Sending update:', {
        coachId,
        year,
        updateData
      });

      const updatedCoach = await api.updateSeason(selectedDynasty._id, coachId, year, updateData);
      
      setCoaches(prevCoaches => 
        prevCoaches.map(coach => 
          coach._id === updatedCoach._id ? updatedCoach : coach
        )
      );
    } catch (error: any) {
      // Detailed error handling
      console.error('Error updating season:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update season';
      setError(errorMessage);
    } finally {
      // Clear the loading timeout and loading state
      clearTimeout(loadingTimeout);
      setIsLoading(false);
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
    } catch (err: any) {
      console.error('Error toggling season edit:', err);
    } finally {
      setUpdatingCoach(null);
    }
  };

  const handleOpenSeasonModal = () => {
    setPendingSeasonUpdates(coaches.map(coach => ({ ...coach })));
    setShowSeasonModal(true);
  };

  const handlePendingSeasonChange = (coachId: string, field: 'college' | 'position', value: string) => {
    setPendingSeasonUpdates(prev => prev.map(coach =>
      coach._id === coachId ? { ...coach, [field]: value } : coach
    ));
  };

  const handleConfirmSeasonModal = async () => {
    setShowSeasonModal(false);
    await handleStartNewSeason(pendingSeasonUpdates);
  };

  const handleStartNewSeason = async (updates?: Coach[]) => {
    if (!selectedDynasty) return;
    try {
      setIsLoading(true);
      
      // Start the new season first
      const newSeasonCoaches = await api.startNewSeason(selectedDynasty._id);
      
      // Then update the new season's college and position for each coach
      if (updates) {
        const updatePromises = updates.map(async (coach) => {
          const updatedCoach = newSeasonCoaches.find(c => c._id === coach._id);
          if (!updatedCoach) return null;
          
          // Get the new season's year
          const newYear = updatedCoach.currentYear;
          
          // Update the season with new college and position
          return api.updateSeason(
            selectedDynasty._id,
            coach._id!,
            newYear,
            {
              wins: 0,
              losses: 0,
              college: coach.college || '',
              position: coach.position || 'HC',
              confChamp: false
            }
          );
        });
        
        const finalCoaches = await Promise.all(updatePromises);
        setCoaches(finalCoaches.filter((c): c is Coach => c !== null));
      } else {
        setCoaches(newSeasonCoaches);
      }
    } catch (err: any) {
      console.error('Error starting new season:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollbackSeason = async () => {
    if (!selectedDynasty) return;
    const confirmed = window.confirm('Are you sure you want to roll back the current season? This will delete all data for the current season for every coach.');
    if (!confirmed) return;
    try {
      setIsLoading(true);
      const updatedCoaches = await api.rollbackSeason(selectedDynasty._id);
      setCoaches(updatedCoaches);
    } catch (err) {
      setError('Failed to roll back season. Please try again.');
      console.error('Error rolling back season:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToHome = () => {
    setSelectedDynasty(null);
    setCoaches([]);
    setShowCreateForm(false);
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

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const calculatePostSeasonRecord = (seasons: Season[]) => {
    let wins = 0;
    let losses = 0;

    seasons.forEach(season => {
      if (season.postSeason === 'bowl') {
        console.log(`Processing bowl game for ${season.year}:`, {
          bowlGame: season.bowlGame,
          bowlResult: season.bowlResult
        });
        
        if (season.bowlResult === true) {
          wins++;
          console.log(`Bowl win recorded for ${season.year}`);
        } else if (season.bowlResult === false) {
          losses++;
          console.log(`Bowl loss recorded for ${season.year}`);
        }
      } else if (season.postSeason === 'playoff') {
        switch (season.playoffResult) {
          case 'champion':
            wins += season.playoffSeed && season.playoffSeed <= 4 ? 3 : 4;
            console.log(`Playoff champion: ${season.playoffSeed && season.playoffSeed <= 4 ? 3 : 4} wins`);
            break;
          case 'championship_loss':
            wins += season.playoffSeed && season.playoffSeed <= 4 ? 2 : 3;
            losses += 1;
            console.log(`Championship loss: ${season.playoffSeed && season.playoffSeed <= 4 ? 2 : 3} wins, 1 loss`);
            break;
          case 'semifinal_loss':
            wins += season.playoffSeed && season.playoffSeed <= 4 ? 1 : 2;
            losses += 1;
            console.log(`Semifinal loss: ${season.playoffSeed && season.playoffSeed <= 4 ? 1 : 2} wins, 1 loss`);
            break;
          case 'second_round_loss':
            wins += season.playoffSeed && season.playoffSeed <= 4 ? 0 : 1;
            losses += 1;
            console.log(`Second round loss: ${season.playoffSeed && season.playoffSeed <= 4 ? 0 : 1} wins, 1 loss`);
            break;
          case 'first_round_loss':
            losses += 1;
            console.log('First round loss: 0 wins, 1 loss');
            break;
        }
      }
    });

    console.log('Final post-season record:', { wins, losses });
    const percentage = totalGames => (totalGames === 0 ? 0 : (wins / totalGames * 100).toFixed(1));
    return { wins, losses, percentage: percentage(wins + losses) };
  };

  const calculatePositionRecords = (seasons: Season[]) => {
    const records = {
      HC: { wins: 0, losses: 0 },
      OC: { wins: 0, losses: 0 },
      DC: { wins: 0, losses: 0 }
    };

    seasons.forEach(season => {
      if (season.position && records.hasOwnProperty(season.position)) {
        records[season.position].wins += season.wins;
        records[season.position].losses += season.losses;
      }
    });

    return records;
  };

  const formatRecord = (wins: number, losses: number) => {
    if (wins === 0 && losses === 0) return null;
    const percentage = ((wins / (wins + losses)) * 100).toFixed(1);
    return `${wins}-${losses} (${percentage}%)`;
  };

  const getLuminance = (color: string): number => {
    // Remove the '#' if present
    const hex = color.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance using WCAG formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance;
  };

  // Handler stubs
  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setSettingsSuccess('');
    try {
      if (!newUsername.trim()) {
        setUsernameError('Username cannot be empty');
        return;
      }
      const updatedUsername = await api.updateUsername(newUsername.trim());
      setSettingsSuccess('Username updated!');
      setAuth((prev) => prev && prev.user ? { ...prev, user: { ...prev.user, username: updatedUsername } } : prev);
      setNewUsername('');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setUsernameError(err.response.data.message);
      } else {
        setUsernameError('Failed to update username');
      }
    }
  };
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSettingsSuccess('');
    try {
      if (!oldPassword || !newPassword) {
        setPasswordError('Both fields are required');
        return;
      }
      const msg = await api.updatePassword(oldPassword, newPassword);
      setSettingsSuccess(msg);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError('Failed to update password');
      }
    }
  };

  if (!auth.token || !auth.user) {
    return <LandingPage onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--primary-color)' }}>
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
              {/* Username styled like TeamSymbol */}
              {auth.user && (
                <span
                  className="font-bold text-2xl mr-4"
                  style={{
                    color: selectedTeam
                      ? (getLuminance(selectedTeam.secondaryColor) > getLuminance(selectedTeam.primaryColor)
                          ? selectedTeam.secondaryColor
                          : selectedTeam.primaryColor)
                      : '#1a202c',
                    WebkitTextStroke: selectedTeam
                      ? `1px ${getLuminance(selectedTeam.secondaryColor) > getLuminance(selectedTeam.primaryColor)
                          ? selectedTeam.primaryColor
                          : selectedTeam.secondaryColor}`
                      : '1px #fff',
                    textShadow: selectedTeam
                      ? `1px 1px 0 ${getLuminance(selectedTeam.secondaryColor) > getLuminance(selectedTeam.primaryColor)
                          ? selectedTeam.primaryColor
                          : selectedTeam.secondaryColor}`
                      : '1px 1px 0 #fff',
                  }}
                >
                  {auth.user.username}
                </span>
              )}
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
                    {/* Settings option */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setShowSettingsModal(true)}
                          className={`${
                            active ? 'bg-primary text-white' : 'text-gray-900'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          Settings
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
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
        <div className="max-w-[120rem] mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {isLoading && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button 
                  className="absolute top-0 right-0 px-4 py-3" 
                  onClick={() => setError(null)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

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
                        onClick={handleOpenSeasonModal}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                      >
                        Start New Season
                      </button>
                      <button
                        onClick={handleRollbackSeason}
                        className="inline-flex items-center px-4 py-2 ml-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                      >
                        Roll Back Season
                      </button>
                    </div>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="border-t border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          {coaches.map((coach) => {
                            // Find the current season for this coach
                            const currentSeason = coach.seasons.find(s => s.year === coach.currentYear);
                            // Find the team data for the current college
                            const teamData = teams.find(t => t.name.toLowerCase() === (currentSeason?.college || '').toLowerCase());
                            const teamColor = teamData ? teamData.primaryColor : '#333';
                            return (
                              <li key={coach._id} className="px-6 py-6 sm:px-8 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 max-w-[calc(100%-120px)]">
                                    <div className="flex items-center justify-between mb-4">
                                      <p className="text-sm font-medium text-primary">
                                        {coach.firstName} {coach.lastName}
                                        {currentSeason && <span className="ml-2 text-gray-500">({currentSeason.position})</span>}
                                      </p>
                                    </div>
                                    
                                    {/* Seasons */}
                                    <div className="space-y-6">
                                      {coach.seasons
                                        .slice()
                                        .filter(season => typeof season.year === 'number' && season.year >= 2024)
                                        .sort((a, b) => b.year - a.year)
                                        .map((season) => {
                                          const seasonTeamData = teams.find(t => t.name.toLowerCase() === season.college.toLowerCase());
                                          const seasonStyle = season.confChamp && seasonTeamData ? { color: seasonTeamData.primaryColor } : {};
                                          
                                          return (
                                            <div key={season.year} className="grid grid-cols-[250px_minmax(900px,_1fr)] gap-6">
                                              <span className="text-sm text-gray-500" style={seasonStyle}>
                                                {season.year} {season.college} - {season.position}
                                                {season.playoffResult === 'champion' && (
                                                  <span className="ml-2" title="National Champion">👑</span>
                                                )}
                                              </span>
                                              <div className="flex items-center gap-x-8">
                                                <div className="flex items-center space-x-2">
                                                  <label htmlFor={`wins-${coach._id}-${season.year}`} className="text-sm text-gray-500 w-12">
                                                    Wins:
                                                  </label>
                                                  <input
                                                    type="number"
                                                    id={`wins-${coach._id}-${season.year}`}
                                                    min="0"
                                                    value={season.wins}
                                                    onChange={(e) => {
                                                      const wins = parseInt(e.target.value) || 0;
                                                      if (wins >= 0) {
                                                        handleSeasonUpdate(coach._id!, season.year, 'wins', wins);
                                                      }
                                                    }}
                                                    className="w-16 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                                    disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                  />
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                  <label htmlFor={`losses-${coach._id}-${season.year}`} className="text-sm text-gray-500 w-16">
                                                    Losses:
                                                  </label>
                                                  <input
                                                    type="number"
                                                    id={`losses-${coach._id}-${season.year}`}
                                                    min="0"
                                                    value={season.losses}
                                                    onChange={(e) => {
                                                      const losses = parseInt(e.target.value) || 0;
                                                      if (losses >= 0) {
                                                        handleSeasonUpdate(coach._id!, season.year, 'losses', losses);
                                                      }
                                                    }}
                                                    className="w-16 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                                    disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                  />
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                  <label htmlFor={`confChamp-${coach._id}-${season.year}`} className="text-sm text-gray-500 whitespace-nowrap">
                                                    Conf Champ:
                                                  </label>
                                                  <input
                                                    type="checkbox"
                                                    id={`confChamp-${coach._id}-${season.year}`}
                                                    checked={season.confChamp || false}
                                                    onChange={(e) => handleSeasonUpdate(coach._id!, season.year, 'confChamp', e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-300"
                                                    style={{
                                                      accentColor: seasonTeamData?.primaryColor,
                                                      color: seasonTeamData?.primaryColor
                                                    }}
                                                    disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                  />
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                  <label htmlFor={`postSeason-${coach._id}-${season.year}`} className="text-sm text-gray-500 whitespace-nowrap">
                                                    Post Season:
                                                  </label>
                                                  <select
                                                    id={`postSeason-${coach._id}-${season.year}`}
                                                    value={season.postSeason || 'none'}
                                                    onChange={(e) => handleSeasonUpdate(coach._id!, season.year, 'postSeason', e.target.value)}
                                                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                                    disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                  >
                                                    <option value="none">None</option>
                                                    <option value="bowl">Bowl</option>
                                                    <option value="playoff">Playoff</option>
                                                  </select>
                                                </div>

                                                {season.postSeason === 'bowl' && (
                                                  <>
                                                    <div className="flex items-center space-x-2">
                                                      <label htmlFor={`bowlGame-${coach._id}-${season.year}`} className="text-sm text-gray-500 whitespace-nowrap">
                                                        Bowl:
                                                      </label>
                                                      <select
                                                        id={`bowlGame-${coach._id}-${season.year}`}
                                                        value={season.bowlGame || ''}
                                                        onChange={(e) => handleSeasonUpdate(coach._id!, season.year, 'bowlGame', e.target.value)}
                                                        className="w-40 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                                        disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                      >
                                                        <option value="">Select Bowl</option>
                                                        {bowlGames.map((bowl) => (
                                                          <option key={bowl} value={bowl}>
                                                            {bowl}
                                                          </option>
                                                        ))}
                                                      </select>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                      <label htmlFor={`bowlOpponent-${coach._id}-${season.year}`} className="text-sm text-gray-500 whitespace-nowrap">
                                                        Opponent:
                                                      </label>
                                                      <select
                                                        id={`bowlOpponent-${coach._id}-${season.year}`}
                                                        value={season.bowlOpponent || ''}
                                                        onChange={(e) => handleSeasonUpdate(coach._id!, season.year, 'bowlOpponent', e.target.value)}
                                                        className="w-40 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                                        disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                      >
                                                        <option value="">Select Opponent</option>
                                                        {bowlTeams.map((opponent) => (
                                                          <option key={opponent} value={opponent}>
                                                            {opponent}
                                                          </option>
                                                        ))}
                                                      </select>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                      <label htmlFor={`bowlResult-${coach._id}-${season.year}`} className="text-sm text-gray-500 whitespace-nowrap">
                                                        Result:
                                                      </label>
                                                      <select
                                                        id={`bowlResult-${coach._id}-${season.year}`}
                                                        value={season.bowlResult ? 'win' : 'loss'}
                                                        onChange={(e) => handleSeasonUpdate(coach._id!, season.year, 'bowlResult', e.target.value === 'win')}
                                                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                                        disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                      >
                                                        <option value="win">Win</option>
                                                        <option value="loss">Loss</option>
                                                      </select>
                                                    </div>
                                                  </>
                                                )}

                                                {season.postSeason === 'playoff' && (
                                                  <>
                                                    <div className="flex items-center space-x-2">
                                                      <label htmlFor={`playoffSeed-${coach._id}-${season.year}`} className="text-sm text-gray-500 whitespace-nowrap">
                                                        Seed:
                                                      </label>
                                                      <select
                                                        id={`playoffSeed-${coach._id}-${season.year}`}
                                                        value={season.playoffSeed || ''}
                                                        onChange={(e) => handleSeasonUpdate(coach._id!, season.year, 'playoffSeed', parseInt(e.target.value) || undefined)}
                                                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                                        disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                      >
                                                        <option value="">Seed</option>
                                                        {[...Array(12)].map((_, i) => (
                                                          <option key={i + 1} value={i + 1}>
                                                            {i + 1}
                                                          </option>
                                                        ))}
                                                      </select>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                      <label htmlFor={`playoffResult-${coach._id}-${season.year}`} className="text-sm text-gray-500 whitespace-nowrap">
                                                        Result:
                                                      </label>
                                                      <select
                                                        id={`playoffResult-${coach._id}-${season.year}`}
                                                        value={season.playoffResult}
                                                        onChange={(e) => handleSeasonUpdate(coach._id!, season.year, 'playoffResult', e.target.value)}
                                                        className="w-40 rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                                                        disabled={updatingCoach === coach._id || (season.year !== coach.currentYear && !season.isEditable)}
                                                      >
                                                        <option value="none">Not Finished</option>
                                                        {(!season.playoffSeed || season.playoffSeed > 4) && (
                                                          <option value="first_round_loss">First Round Loss</option>
                                                        )}
                                                        <option value="second_round_loss">Second Round Loss</option>
                                                        <option value="semifinal_loss">Semifinal Loss</option>
                                                        <option value="championship_loss">Championship Loss</option>
                                                        <option value="champion">Champion</option>
                                                      </select>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>

                                    <div className="mt-2 text-sm text-gray-500 flex gap-x-6">
                                      <span>Career: {coach.wins}-{coach.losses} ({coach.winPercentage}%)</span>
                                      {(() => {
                                        const postSeasonRecord = calculatePostSeasonRecord(coach.seasons);
                                        return (
                                          <span>Post-Season: {postSeasonRecord.wins}-{postSeasonRecord.losses} ({postSeasonRecord.percentage}%)</span>
                                        );
                                      })()}
                                      {(() => {
                                        const positionRecords = calculatePositionRecords(coach.seasons);
                                        return (
                                          <>
                                            {Object.entries(positionRecords).map(([position, record]) => {
                                              const formattedRecord = formatRecord(record.wins, record.losses);
                                              if (formattedRecord) {
                                                return (
                                                  <span key={position}>
                                                    {position}: {formattedRecord}
                                                  </span>
                                                );
                                              }
                                              return null;
                                            })}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  {/* Current Team Display - Fixed width container */}
                                  <div className="w-[100px] flex justify-end shrink-0">
                                    {currentSeason && teamData && (
                                      <span
                                        className="text-sm font-bold px-3 py-1 rounded whitespace-nowrap"
                                        style={{ backgroundColor: teamColor, color: teamData.secondaryColor }}
                                      >
                                        {currentSeason.college}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </li>
                            )
                          })}
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
              <DynastySelector 
                onDynastySelect={setSelectedDynasty} 
                selectedTeam={selectedTeam}
                getTextContrastClass={getTextContrastClass}
              />
            )}
          </div>
        </div>
      </main>

      {showSeasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg shadow-lg p-6 w-full max-w-2xl" style={{ backgroundColor: 'var(--secondary-color)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--primary-color)' }}>
              Update Coach Positions for New Season
            </h2>
            <div className="space-y-4">
              {pendingSeasonUpdates.map(coach => (
                <div key={coach._id} className="flex items-center space-x-4">
                  <span className="w-32 font-medium" style={{ color: 'var(--primary-color)' }}>
                    {coach.firstName} {coach.lastName}
                  </span>
                  {(() => {
                    // Find the most recent season (highest year)
                    const mostRecentSeason = coach.seasons.reduce<Season | undefined>((latest, s) => !latest || s.year > latest.year ? s : latest, undefined);
                    // Always use the most recent season's college, fallback to coach.college if no seasons
                    const currentSchool = mostRecentSeason?.college || coach.college || 'Air Force';
                    return (
                      <select
                        value={currentSchool}
                        onChange={(e) => handlePendingSeasonChange(coach._id!, 'college', e.target.value)}
                        className="w-40 rounded-md shadow-sm sm:text-sm bg-opacity-90"
                        style={{ 
                          backgroundColor: 'var(--primary-color)',
                          color: 'var(--secondary-color)',
                          borderColor: 'var(--primary-color)'
                        }}
                      >
                        <option value="">Select Team</option>
                        {bowlTeams.map((team) => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                  {/* Find current season for this coach */}
                  {(() => {
                    const currentSeason = coach.seasons.find(s => s.year === coach.currentYear);
                    // Use the pending position update if it exists, otherwise use current position
                    const currentPosition = coach.position || currentSeason?.position || 'HC';
                    return (
                      <select
                        value={currentPosition}
                        onChange={(e) => handlePendingSeasonChange(coach._id!, 'position', e.target.value)}
                        className="w-40 rounded-md shadow-sm sm:text-sm bg-opacity-90"
                        style={{ 
                          backgroundColor: 'var(--primary-color)',
                          color: 'var(--secondary-color)',
                          borderColor: 'var(--primary-color)'
                        }}
                      >
                        <option value="HC">Head Coach (HC)</option>
                        <option value="OC">Offensive Coordinator (OC)</option>
                        <option value="DC">Defensive Coordinator (DC)</option>
                      </select>
                    );
                  })()}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowSeasonModal(false)}
                className="px-4 py-2 rounded-md hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--primary-color)',
                  color: 'var(--secondary-color)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSeasonModal}
                className="px-4 py-2 rounded-md hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--primary-color)',
                  color: 'var(--secondary-color)'
                }}
              >
                Start New Season
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Modal show={showSettingsModal} onHide={() => setShowSettingsModal(false)}>
        <Modal.Header
          closeButton
          style={{
            backgroundColor: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
            color: selectedTeam ? selectedTeam.secondaryColor : '#fff',
          }}
        >
          <Modal.Title>Account Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: selectedTeam ? selectedTeam.secondaryColor : '#fff',
            color: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
          }}
        >
          {settingsSuccess && <div className="alert alert-success">{settingsSuccess}</div>}
          <Form onSubmit={handleUsernameChange} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Change Username</Form.Label>
              <Form.Control
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                autoComplete="off"
                style={{
                  backgroundColor: selectedTeam ? selectedTeam.secondaryColor : '#fff',
                  color: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
                  borderColor: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
                }}
              />
              {usernameError && <div className="text-danger mt-1">{usernameError}</div>}
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              style={{
                backgroundColor: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
                color: selectedTeam ? selectedTeam.secondaryColor : '#fff',
                borderColor: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
              }}
            >
              Update Username
            </Button>
          </Form>
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
                style={{
                  backgroundColor: selectedTeam ? selectedTeam.secondaryColor : '#fff',
                  color: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
                  borderColor: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                style={{
                  backgroundColor: selectedTeam ? selectedTeam.secondaryColor : '#fff',
                  color: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
                  borderColor: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
                }}
              />
              {passwordError && <div className="text-danger mt-1">{passwordError}</div>}
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              style={{
                backgroundColor: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
                color: selectedTeam ? selectedTeam.secondaryColor : '#fff',
                borderColor: selectedTeam ? selectedTeam.primaryColor : '#1a202c',
              }}
            >
              Change Password
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default App 