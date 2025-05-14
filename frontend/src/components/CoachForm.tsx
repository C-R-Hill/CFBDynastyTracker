import React, { useState } from 'react';
import api, { Coach, CreateCoachData, Dynasty } from '../services/api';

interface CoachFormProps {
  dynasty: Dynasty;
  onCoachCreated?: (coach: Coach) => void;
  currentCoaches: Coach[];
}

const MAX_COACHES = 8;

const CoachForm: React.FC<CoachFormProps> = ({ dynasty, onCoachCreated, currentCoaches }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CreateCoachData, 'dynastyId'>>({
    firstName: '',
    lastName: '',
    college: '',
    position: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentCoaches.length >= MAX_COACHES) {
      setError(`Cannot add more coaches. Maximum limit of ${MAX_COACHES} coaches reached.`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Define as any to avoid linter error for extra properties
      const coachData: any = {
        ...formData,
        dynastyId: dynasty._id,
        seasons: [
          {
            year: 2024,
            wins: 0,
            losses: 0,
            isEditable: true,
            college: formData.college,
            position: formData.position,
            confChamp: false,
            postSeason: 'none',
            bowlGame: '',
            bowlOpponent: '',
            bowlResult: false,
            playoffSeed: undefined,
            playoffResult: 'none',
          }
        ],
        currentYear: 2024
      };
      
      const newCoach = await api.createCoach(coachData);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        college: '',
        position: '',
      });
      
      // Notify parent component
      if (onCoachCreated) {
        onCoachCreated(newCoach);
      }
    } catch (err) {
      setError('Failed to create coach. Please try again.');
      console.error('Error creating coach:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isLoading || currentCoaches.length >= MAX_COACHES}
              placeholder="Nick"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isLoading || currentCoaches.length >= MAX_COACHES}
              placeholder="Saban"
            />
          </div>

          <div>
            <label htmlFor="college" className="block text-sm font-medium text-gray-700">
              College
            </label>
            <input
              type="text"
              id="college"
              name="college"
              value={formData.college}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isLoading || currentCoaches.length >= MAX_COACHES}
              placeholder="Alabama"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isLoading || currentCoaches.length >= MAX_COACHES}
            >
              <option value="">Select Position</option>
              <option value="HC">Head Coach (HC)</option>
              <option value="OC">Offensive Coordinator (OC)</option>
              <option value="DC">Defensive Coordinator (DC)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || currentCoaches.length >= MAX_COACHES}
          >
            {isLoading ? 'Creating...' : 'Create Coach'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CoachForm; 