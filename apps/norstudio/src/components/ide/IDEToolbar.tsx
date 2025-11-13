'use client'

import React from 'react'
import Link from 'next/link'
import {
  Code2,
  Play,
  Save,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import { APIStatusIndicator } from '@/components/api/APIStatusIndicator'

interface IDEToolbarProps {
  readonly projectName: string
  readonly hasUnsavedChanges?: boolean
  readonly onSave?: () => void
  readonly onCompile?: () => void
  readonly onDeploy?: () => void
}

export const IDEToolbar = ({
  projectName,
  hasUnsavedChanges = false,
  onSave,
  onCompile,
  onDeploy,
}: IDEToolbarProps): JSX.Element => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="h-14 bg-editor-sidebar dark:bg-editor-sidebar border-b border-gray-700 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>

        <div className="h-6 w-px bg-gray-700" />

        <div className="flex items-center space-x-3">
          <Code2 className="h-5 w-5 text-primary-500" />
          <div>
            <h1 className="text-sm font-semibold text-white">{projectName}</h1>
            {hasUnsavedChanges && (
              <p className="text-xs text-gray-400">Unsaved changes</p>
            )}
          </div>
        </div>
      </div>

      {/* Center Section - Actions */}
      <div className="flex items-center space-x-2">
        {onSave && (
          <ToolbarButton
            onClick={onSave}
            icon={<Save className="h-4 w-4" />}
            label="Save"
            shortcut="⌘S"
            variant={hasUnsavedChanges ? 'primary' : 'default'}
          />
        )}

        {onCompile && (
          <ToolbarButton
            onClick={onCompile}
            icon={<Code2 className="h-4 w-4" />}
            label="Compile"
            variant="default"
          />
        )}

        {onDeploy && (
          <ToolbarButton
            onClick={onDeploy}
            icon={<Play className="h-4 w-4" />}
            label="Deploy"
            variant="success"
          />
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        <APIStatusIndicator />

        <div className="h-6 w-px bg-gray-700" />

        <WalletConnect />

        <div className="h-6 w-px bg-gray-700" />

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <button
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  readonly icon: React.ReactNode
  readonly label: string
  readonly onClick: () => void
  readonly shortcut?: string
  readonly variant?: 'default' | 'primary' | 'success'
  readonly disabled?: boolean
}

function ToolbarButton({
  icon,
  label,
  onClick,
  shortcut,
  variant = 'default',
  disabled = false,
}: ToolbarButtonProps): JSX.Element {
  const variantClasses = {
    default: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center space-x-2 h-9 px-4 rounded font-medium text-sm transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant]
      )}
    >
      {icon}
      <span>{label}</span>
      {shortcut && (
        <span className="text-xs opacity-70 ml-1">({shortcut})</span>
      )}
    </button>
  )
}
