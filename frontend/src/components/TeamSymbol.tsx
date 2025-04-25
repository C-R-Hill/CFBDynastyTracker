import React from 'react';
import { Team } from '../data/teams';

interface TeamSymbolProps {
  team: Team | null;
}

const getLuminance = (color: string): number => {
  // Remove the '#' if present
  const hex = color.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance using WCAG formula
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const TeamSymbol: React.FC<TeamSymbolProps> = ({ team }) => {
  if (!team) return null;

  // Check if secondary color is lighter than primary
  const primaryLuminance = getLuminance(team.primaryColor);
  const secondaryLuminance = getLuminance(team.secondaryColor);
  
  // If secondary is lighter, swap the colors
  const textColor = secondaryLuminance > primaryLuminance ? team.secondaryColor : team.primaryColor;
  const outlineColor = secondaryLuminance > primaryLuminance ? team.primaryColor : team.secondaryColor;

  return (
    <div 
      className="flex items-center mr-4"
      title={`${team.name} Colors`}
    >
      <span 
        className="font-bold text-2xl"
        style={{ 
          color: textColor,
          WebkitTextStroke: `1px ${outlineColor}`,
          textShadow: `1px 1px 0 ${outlineColor}`,
        }}
      >
        {team.name}
      </span>
    </div>
  );
};

export default TeamSymbol; 