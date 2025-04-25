import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { teams, Team } from '../data/teams';

interface TeamSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamSelect: (team: Team) => void;
  currentTeam: Team | null;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ isOpen, onClose, onTeamSelect, currentTeam }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-4">
            Select Your Favorite Team
          </Dialog.Title>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  onTeamSelect(team);
                  onClose();
                }}
                className={`flex items-center p-3 rounded-lg border ${
                  currentTeam?.id === team.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full mr-3"
                  style={{ 
                    backgroundColor: team.primaryColor,
                    border: `2px solid ${team.secondaryColor}`
                  }}
                />
                <span className="font-medium text-gray-900">{team.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default TeamSelector; 