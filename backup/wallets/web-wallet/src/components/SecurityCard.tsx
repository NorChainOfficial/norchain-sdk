/**
 * SecurityCard component - matches iOS SecurityCard design
 * Glassmorphism style with gradient background
 */

import React from 'react';

interface SecurityCardProps {
  icon?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  hasArrow?: boolean;
  onClick: () => void;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = '#10B981',
  hasArrow = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="relative w-full p-4 mb-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Icon and Text */}
        <div className="flex items-center flex-1">
          {icon && (
            <div className="w-8 h-8 mr-3 flex items-center justify-center">
              <span className="text-2xl">{icon}</span>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-white/60 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Badge and Arrow */}
        <div className="flex items-center gap-2">
          {badge && (
            <span
              className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
              style={{ backgroundColor: badgeColor }}
            >
              {badge}
            </span>
          )}
          
          {hasArrow && (
            <svg
              className="w-4 h-4 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

