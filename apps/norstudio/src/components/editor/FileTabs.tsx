'use client'

import React from 'react'
import { X, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProjectFile } from '@/types'

interface FileTabsProps {
  readonly files: ProjectFile[]
  readonly activeFileId: string | null
  readonly onSelectFile: (fileId: string) => void
  readonly onCloseFile: (fileId: string) => void
  readonly hasUnsavedChanges: (fileId: string) => boolean
}

export const FileTabs = ({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
  hasUnsavedChanges,
}: FileTabsProps): JSX.Element => {
  if (files.length === 0) {
    return (
      <div className="h-10 bg-editor-sidebar dark:bg-editor-sidebar border-b border-gray-700 flex items-center px-4 text-gray-400 text-sm">
        No files open
      </div>
    )
  }

  return (
    <div className="h-10 bg-editor-sidebar dark:bg-editor-sidebar border-b border-gray-700 flex items-center overflow-x-auto no-scrollbar">
      {files.map((file) => (
        <FileTab
          key={file.id}
          file={file}
          isActive={file.id === activeFileId}
          hasUnsavedChanges={hasUnsavedChanges(file.id)}
          onSelect={() => onSelectFile(file.id)}
          onClose={() => onCloseFile(file.id)}
        />
      ))}
    </div>
  )
}

interface FileTabProps {
  readonly file: ProjectFile
  readonly isActive: boolean
  readonly hasUnsavedChanges: boolean
  readonly onSelect: () => void
  readonly onClose: () => void
}

function FileTab({
  file,
  isActive,
  hasUnsavedChanges,
  onSelect,
  onClose,
}: FileTabProps): JSX.Element {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'h-full flex items-center px-3 border-r border-gray-700 cursor-pointer group relative',
        'min-w-[120px] max-w-[200px]',
        isActive
          ? 'bg-editor-bg dark:bg-editor-bg text-white'
          : 'bg-editor-sidebar dark:bg-editor-sidebar text-gray-400 hover:bg-editor-bg-light'
      )}
    >
      {/* File Icon */}
      <div className="flex-shrink-0 mr-2">
        <FileIcon filename={file.name} />
      </div>

      {/* File Name */}
      <span className="flex-1 truncate text-sm font-medium">
        {file.name}
      </span>

      {/* Unsaved Indicator or Close Button */}
      <div className="flex-shrink-0 ml-2">
        {hasUnsavedChanges ? (
          <Circle className="h-2 w-2 fill-current text-blue-500" />
        ) : (
          <button
            onClick={handleClose}
            className={cn(
              'h-4 w-4 flex items-center justify-center rounded hover:bg-gray-600',
              'opacity-0 group-hover:opacity-100 transition-opacity'
            )}
            aria-label="Close file"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-500" />
      )}
    </div>
  )
}

function FileIcon({ filename }: { readonly filename: string }): JSX.Element {
  const extension = filename.split('.').pop()?.toLowerCase()

  const iconClass = cn('h-4 w-4')

  // Color based on file type
  const colorClass = {
    sol: 'text-blue-400',
    ts: 'text-blue-500',
    js: 'text-yellow-400',
    json: 'text-green-400',
    md: 'text-gray-400',
  }[extension || 'default'] || 'text-gray-400'

  return (
    <svg className={cn(iconClass, colorClass)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  )
}
