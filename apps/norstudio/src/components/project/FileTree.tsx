'use client'

import React, { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  MoreVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProjectFile } from '@/types'

interface FileTreeProps {
  readonly files: ProjectFile[]
  readonly activeFileId: string | null
  readonly onSelectFile: (file: ProjectFile) => void
  readonly onCreateFile?: () => void
}

interface TreeNode {
  readonly name: string
  readonly path: string
  readonly type: 'file' | 'folder'
  readonly file?: ProjectFile
  readonly children?: TreeNode[]
}

export const FileTree = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
}: FileTreeProps): JSX.Element => {
  const tree = buildFileTree(files)

  return (
    <div className="h-full flex flex-col bg-editor-sidebar dark:bg-editor-sidebar text-gray-300">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-gray-700">
        <span className="text-sm font-semibold text-gray-200">Explorer</span>
        {onCreateFile && (
          <button
            onClick={onCreateFile}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-700 transition-colors"
            aria-label="New file"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {tree.map((node) => (
          <TreeNodeComponent
            key={node.path}
            node={node}
            level={0}
            activeFileId={activeFileId}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    </div>
  )
}

interface TreeNodeComponentProps {
  readonly node: TreeNode
  readonly level: number
  readonly activeFileId: string | null
  readonly onSelectFile: (file: ProjectFile) => void
}

function TreeNodeComponent({
  node,
  level,
  activeFileId,
  onSelectFile,
}: TreeNodeComponentProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true)
  const isActive = node.file && node.file.id === activeFileId

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded)
    } else if (node.file) {
      onSelectFile(node.file)
    }
  }

  return (
    <div>
      {/* Node Item */}
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center h-7 px-2 rounded cursor-pointer group',
          'hover:bg-gray-700 transition-colors',
          isActive && 'bg-gray-700 text-white'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {/* Expand/Collapse Icon */}
        {node.type === 'folder' && (
          <div className="flex-shrink-0 mr-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}

        {/* File/Folder Icon */}
        <div className="flex-shrink-0 mr-2">
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-400" />
            ) : (
              <Folder className="h-4 w-4 text-blue-400" />
            )
          ) : (
            <FileIcon filename={node.name} />
          )}
        </div>

        {/* Name */}
        <span className="flex-1 text-sm truncate">{node.name}</span>

        {/* Actions */}
        <button
          className="flex-shrink-0 h-5 w-5 items-center justify-center rounded hover:bg-gray-600 opacity-0 group-hover:opacity-100 hidden group-hover:flex"
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Show context menu
          }}
          aria-label="More actions"
        >
          <MoreVertical className="h-3 w-3" />
        </button>
      </div>

      {/* Children */}
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              level={level + 1}
              activeFileId={activeFileId}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FileIcon({ filename }: { readonly filename: string }): JSX.Element {
  const extension = filename.split('.').pop()?.toLowerCase()

  const colorClass = {
    sol: 'text-blue-400',
    ts: 'text-blue-500',
    tsx: 'text-blue-500',
    js: 'text-yellow-400',
    jsx: 'text-yellow-400',
    json: 'text-green-400',
    md: 'text-gray-400',
  }[extension || 'default'] || 'text-gray-400'

  return <File className={cn('h-4 w-4', colorClass)} />
}

/**
 * Build a hierarchical tree structure from flat file list
 */
function buildFileTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode[] = []
  const folderMap = new Map<string, TreeNode>()

  // Sort files by path
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

  for (const file of sortedFiles) {
    const parts = file.path.split('/')
    const fileName = parts[parts.length - 1]
    const folderPath = parts.slice(0, -1)

    // Create folder structure
    let currentLevel = root
    let currentPath = ''

    for (let i = 0; i < folderPath.length; i++) {
      const folderName = folderPath[i]
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName

      let folder = folderMap.get(currentPath)

      if (!folder) {
        folder = {
          name: folderName,
          path: currentPath,
          type: 'folder',
          children: [],
        }
        folderMap.set(currentPath, folder)
        currentLevel.push(folder)
      }

      currentLevel = folder.children!
    }

    // Add file
    currentLevel.push({
      name: fileName,
      path: file.path,
      type: 'file',
      file,
    })
  }

  return root
}
