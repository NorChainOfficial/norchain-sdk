/**
 * SettingsSection component - matches iOS SettingsSection design
 * Groups related settings with a title
 */

import React from 'react';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div className="w-full px-6 py-4">
      {/* Section Title */}
      <h2 className="text-xs font-semibold text-white/50 uppercase mb-3">
        {title}
      </h2>
      
      {/* Section Content */}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

