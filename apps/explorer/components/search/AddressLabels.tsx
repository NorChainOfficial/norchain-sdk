'use client';

import React, { useState, useEffect } from 'react';

interface AddressLabel {
  address: string;
  label: string;
  type: 'account' | 'contract' | 'token' | 'exchange' | 'other';
  verified?: boolean;
}

interface AddressLabelsProps {
  address: string;
  onLabelChange?: (label: string) => void;
}

export function AddressLabels({ address, onLabelChange }: AddressLabelsProps): JSX.Element {
  const [labels, setLabels] = useState<AddressLabel[]>([]);
  const [userLabels, setUserLabels] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadLabels = async () => {
      setIsLoading(true);
      try {
        // Load user labels from localStorage
        const stored = localStorage.getItem('addressLabels');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserLabels(new Map(Object.entries(parsed)));
        }

        // Loads user-defined labels from localStorage
        // Known addresses can be loaded from API when available
        const knownAddresses: AddressLabel[] = [
          // Add known addresses here
        ];

        setLabels(knownAddresses);
      } catch (error) {
        console.error('Failed to load address labels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLabels();
  }, []);

  const getUserLabel = (addr: string): string | undefined => {
    return userLabels.get(addr.toLowerCase());
  };

  const saveUserLabel = (addr: string, label: string) => {
    const newLabels = new Map(userLabels);
    newLabels.set(addr.toLowerCase(), label);
    setUserLabels(newLabels);
    localStorage.setItem('addressLabels', JSON.stringify(Object.fromEntries(newLabels)));
    if (onLabelChange) {
      onLabelChange(label);
    }
  };

  const removeUserLabel = (addr: string) => {
    const newLabels = new Map(userLabels);
    newLabels.delete(addr.toLowerCase());
    setUserLabels(newLabels);
    localStorage.setItem('addressLabels', JSON.stringify(Object.fromEntries(newLabels)));
    if (onLabelChange) {
      onLabelChange('');
    }
  };

  const currentLabel = getUserLabel(address);
  const knownLabel = labels.find((l) => l.address.toLowerCase() === address.toLowerCase());

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {(currentLabel || knownLabel) && (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
          {currentLabel || knownLabel?.label}
        </span>
      )}
    </div>
  );
}

export function AddressLabelManager({ address }: { address: string }): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState('');
  const [savedLabel, setSavedLabel] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('addressLabels');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSavedLabel(parsed[address.toLowerCase()] || '');
      setLabel(parsed[address.toLowerCase()] || '');
    }
  }, [address]);

  const handleSave = () => {
    if (label.trim()) {
      const stored = localStorage.getItem('addressLabels') || '{}';
      const parsed = JSON.parse(stored);
      parsed[address.toLowerCase()] = label.trim();
      localStorage.setItem('addressLabels', JSON.stringify(parsed));
      setSavedLabel(label.trim());
      setIsEditing(false);
    }
  };

  const handleRemove = () => {
    const stored = localStorage.getItem('addressLabels') || '{}';
    const parsed = JSON.parse(stored);
    delete parsed[address.toLowerCase()];
    localStorage.setItem('addressLabels', JSON.stringify(parsed));
    setSavedLabel('');
    setLabel('');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter label..."
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            } else if (e.key === 'Escape') {
              setIsEditing(false);
              setLabel(savedLabel);
            }
          }}
        />
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setLabel(savedLabel);
          }}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {savedLabel ? (
        <>
          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {savedLabel}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
            title="Edit label"
          >
            ✏️
          </button>
          <button
            onClick={handleRemove}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            title="Remove label"
          >
            ✕
          </button>
        </>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Add Label
        </button>
      )}
    </div>
  );
}

