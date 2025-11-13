'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { IDELayout } from '@/components/ide/IDELayout'
import { IDEToolbar } from '@/components/ide/IDEToolbar'
import { FileTree } from '@/components/project/FileTree'
import { FileTabs } from '@/components/editor/FileTabs'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { ConsolePanel, type ConsoleMessage } from '@/components/ide/ConsolePanel'
import { ContextPanel } from '@/components/ide/ContextPanel'
import { DeploymentDialog } from '@/components/contract/DeploymentDialog'
import { useProjectStore } from '@/store/projectStore'
import { useCompilationStore } from '@/store/compilationStore'
import { useTransactionStore } from '@/store/transactionStore'
import { createSampleProject } from '@/lib/sampleProjects'

export default function IDEWorkspacePage(): JSX.Element {
  const params = useParams()
  const projectId = params.projectId as string

  const {
    currentProject,
    openFiles,
    activeFileId,
    setCurrentProject,
    openFile,
    closeFile,
    setActiveFile,
    updateFile,
    saveFile,
    saveAllFiles,
    hasUnsavedChanges,
  } = useProjectStore()

  const {
    compilationResult,
    selectedContract,
    compile,
    isCompiling,
  } = useCompilationStore()

  const {
    walletInfo,
    deployContract,
    isDeploying,
  } = useTransactionStore()

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([])
  const [isDeploymentDialogOpen, setIsDeploymentDialogOpen] = useState(false)

  // Initialize project
  useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      // In a real app, fetch project from API
      // For now, use sample project
      const project = createSampleProject()
      setCurrentProject(project)

      // Open the main contract file by default
      if (project.files.length > 0) {
        openFile(project.files[0])
      }

      // Add welcome message
      addConsoleMessage({
        type: 'info',
        message: 'Welcome to NorStudio! Project loaded successfully.',
      })
    }
  }, [projectId, currentProject, setCurrentProject, openFile])

  // Update console when compilation completes
  useEffect(() => {
    if (compilationResult && !isCompiling) {
      if (compilationResult.success) {
        addConsoleMessage({
          type: 'success',
          message: 'Compilation successful!',
          details: `Compiled ${compilationResult.contracts.length} contract(s) successfully.`,
        })
      } else {
        const errors = compilationResult.errors.filter((e) => e.severity === 'error')
        const warnings = compilationResult.errors.filter((e) => e.severity === 'warning')

        addConsoleMessage({
          type: 'error',
          message: 'Compilation failed',
          details: `${errors.length} error(s), ${warnings.length} warning(s)`,
        })

        // Log first few errors to console
        errors.slice(0, 3).forEach((error) => {
          addConsoleMessage({
            type: 'error',
            message: error.message,
          })
        })
      }
    }
  }, [compilationResult, isCompiling])

  const activeFile = openFiles.find((f) => f.id === activeFileId)
  const hasAnyUnsavedChanges = openFiles.some((f) => hasUnsavedChanges(f.id))

  const addConsoleMessage = (
    message: Omit<ConsoleMessage, 'id' | 'timestamp'>
  ) => {
    setConsoleMessages((prev) => [
      ...prev,
      {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
    ])
  }

  const handleSave = () => {
    if (activeFileId) {
      saveFile(activeFileId)
      addConsoleMessage({
        type: 'success',
        message: `Saved ${activeFile?.name}`,
      })
    }
  }

  const handleCompile = async () => {
    if (!activeFile) {
      addConsoleMessage({
        type: 'error',
        message: 'No file selected for compilation',
      })
      return
    }

    addConsoleMessage({
      type: 'info',
      message: `Compiling ${activeFile.name}...`,
    })

    try {
      await compile(activeFile.content, activeFile.name)
    } catch (error) {
      addConsoleMessage({
        type: 'error',
        message: 'Compilation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handleDeploy = () => {
    if (!walletInfo) {
      addConsoleMessage({
        type: 'error',
        message: 'Wallet not connected. Please connect your wallet first.',
      })
      return
    }

    if (!selectedContract) {
      addConsoleMessage({
        type: 'error',
        message: 'No contract selected. Please compile a contract first.',
      })
      return
    }

    // Show deployment dialog
    setIsDeploymentDialogOpen(true)
  }

  const handleDeployWithArgs = async (args: any[]) => {
    if (!selectedContract) return

    addConsoleMessage({
      type: 'info',
      message: `Deploying ${selectedContract.name}...`,
    })

    try {
      const result = await deployContract(selectedContract, args)

      if (result.success && result.contractAddress) {
        addConsoleMessage({
          type: 'success',
          message: `Contract ${selectedContract.name} deployed successfully!`,
          details: `Contract address: ${result.contractAddress}\nTransaction: ${result.transactionHash}`,
        })
      } else {
        addConsoleMessage({
          type: 'error',
          message: 'Deployment failed',
          details: result.error || 'Unknown error',
        })
      }
    } catch (error) {
      addConsoleMessage({
        type: 'error',
        message: 'Deployment failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handleFileChange = (content: string) => {
    if (activeFileId) {
      updateFile(activeFileId, content)
    }
  }

  const handleSelectFile = (file: any) => {
    openFile(file)
  }

  const clearConsole = () => {
    setConsoleMessages([])
  }

  if (!currentProject) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-editor-bg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <IDEToolbar
        projectName={currentProject.name}
        hasUnsavedChanges={hasAnyUnsavedChanges}
        onSave={handleSave}
        onCompile={handleCompile}
        onDeploy={handleDeploy}
      />

      {/* Main IDE Layout */}
      <IDELayout
        sidebar={
          <FileTree
            files={currentProject.files}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
          />
        }
        editor={
          <div className="h-full flex flex-col">
            <FileTabs
              files={openFiles}
              activeFileId={activeFileId}
              onSelectFile={setActiveFile}
              onCloseFile={closeFile}
              hasUnsavedChanges={hasUnsavedChanges}
            />
            <div className="flex-1">
              {activeFile ? (
                <CodeEditor
                  value={activeFile.content}
                  onChange={handleFileChange}
                  language={activeFile.type === 'solidity' ? 'solidity' : activeFile.type}
                  onSave={handleSave}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 bg-editor-bg">
                  <div className="text-center">
                    <p className="text-lg mb-2">No file selected</p>
                    <p className="text-sm">Select a file from the explorer to start editing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        contextPanel={<ContextPanel />}
        console={
          <ConsolePanel messages={consoleMessages} onClear={clearConsole} />
        }
      />

      {/* Deployment Dialog */}
      <DeploymentDialog
        contract={selectedContract}
        isOpen={isDeploymentDialogOpen}
        onClose={() => setIsDeploymentDialogOpen(false)}
        onDeploy={handleDeployWithArgs}
        isDeploying={isDeploying}
      />
    </div>
  )
}
