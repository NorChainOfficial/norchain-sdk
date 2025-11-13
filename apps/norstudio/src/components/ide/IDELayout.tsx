'use client'

import React from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/Resizable'

interface IDELayoutProps {
  readonly sidebar: React.ReactNode
  readonly editor: React.ReactNode
  readonly contextPanel: React.ReactNode
  readonly console: React.ReactNode
}

export const IDELayout = ({
  sidebar,
  editor,
  contextPanel,
  console: consolePanel,
}: IDELayoutProps): JSX.Element => {
  return (
    <div className="h-screen w-full flex flex-col bg-editor-bg dark:bg-editor-bg">
      {/* Main workspace with vertical panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Sidebar - File Tree */}
        <ResizablePanel
          defaultSize={15}
          minSize={10}
          maxSize={30}
          className="bg-editor-sidebar dark:bg-editor-sidebar"
        >
          {sidebar}
        </ResizablePanel>

        <ResizableHandle className="w-[1px] bg-gray-700" />

        {/* Main Editor Area */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            {/* Editor */}
            <ResizablePanel defaultSize={70} minSize={40}>
              {editor}
            </ResizablePanel>

            <ResizableHandle className="h-[1px] bg-gray-700" />

            {/* Console/Output */}
            <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
              {consolePanel}
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className="w-[1px] bg-gray-700" />

        {/* Right Panel - Context (Compiler, AI, etc.) */}
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          maxSize={40}
          className="bg-editor-bg-light dark:bg-editor-bg-light"
        >
          {contextPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
