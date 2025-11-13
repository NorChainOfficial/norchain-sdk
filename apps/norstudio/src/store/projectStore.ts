import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, ProjectFile } from '@/types'

interface ProjectState {
  readonly currentProject: Project | null
  readonly openFiles: ProjectFile[]
  readonly activeFileId: string | null
  readonly unsavedChanges: Set<string>

  // Actions
  readonly setCurrentProject: (project: Project) => void
  readonly updateFile: (fileId: string, content: string) => void
  readonly openFile: (file: ProjectFile) => void
  readonly closeFile: (fileId: string) => void
  readonly setActiveFile: (fileId: string) => void
  readonly createFile: (file: Omit<ProjectFile, 'id' | 'updatedAt'>) => void
  readonly deleteFile: (fileId: string) => void
  readonly renameFile: (fileId: string, newName: string) => void
  readonly saveFile: (fileId: string) => void
  readonly saveAllFiles: () => void
  readonly hasUnsavedChanges: (fileId: string) => boolean
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      openFiles: [],
      activeFileId: null,
      unsavedChanges: new Set(),

      setCurrentProject: (project) => {
        set({ currentProject: project, openFiles: [], activeFileId: null })
      },

      updateFile: (fileId, content) => {
        const { openFiles, currentProject, unsavedChanges } = get()

        // Update open file
        const updatedOpenFiles = openFiles.map((file) =>
          file.id === fileId ? { ...file, content } : file
        )

        // Update project file
        const updatedProject = currentProject
          ? {
              ...currentProject,
              files: currentProject.files.map((file) =>
                file.id === fileId ? { ...file, content } : file
              ),
            }
          : null

        // Mark as unsaved
        const newUnsavedChanges = new Set(unsavedChanges)
        newUnsavedChanges.add(fileId)

        set({
          openFiles: updatedOpenFiles,
          currentProject: updatedProject,
          unsavedChanges: newUnsavedChanges,
        })
      },

      openFile: (file) => {
        const { openFiles, activeFileId } = get()

        // Don't open if already open
        if (openFiles.find((f) => f.id === file.id)) {
          set({ activeFileId: file.id })
          return
        }

        set({
          openFiles: [...openFiles, file],
          activeFileId: file.id,
        })
      },

      closeFile: (fileId) => {
        const { openFiles, activeFileId, unsavedChanges } = get()
        const newOpenFiles = openFiles.filter((f) => f.id !== fileId)

        // Remove from unsaved changes
        const newUnsavedChanges = new Set(unsavedChanges)
        newUnsavedChanges.delete(fileId)

        // If closing active file, switch to another
        let newActiveFileId = activeFileId
        if (activeFileId === fileId) {
          newActiveFileId = newOpenFiles.length > 0 ? newOpenFiles[0].id : null
        }

        set({
          openFiles: newOpenFiles,
          activeFileId: newActiveFileId,
          unsavedChanges: newUnsavedChanges,
        })
      },

      setActiveFile: (fileId) => {
        set({ activeFileId: fileId })
      },

      createFile: (fileData) => {
        const { currentProject } = get()
        if (!currentProject) return

        const newFile: ProjectFile = {
          ...fileData,
          id: crypto.randomUUID(),
          updatedAt: new Date(),
        }

        set({
          currentProject: {
            ...currentProject,
            files: [...currentProject.files, newFile],
          },
        })
      },

      deleteFile: (fileId) => {
        const { currentProject, openFiles, activeFileId } = get()
        if (!currentProject) return

        // Remove from project
        const updatedProject = {
          ...currentProject,
          files: currentProject.files.filter((f) => f.id !== fileId),
        }

        // Close if open
        const newOpenFiles = openFiles.filter((f) => f.id !== fileId)
        const newActiveFileId = activeFileId === fileId
          ? (newOpenFiles.length > 0 ? newOpenFiles[0].id : null)
          : activeFileId

        set({
          currentProject: updatedProject,
          openFiles: newOpenFiles,
          activeFileId: newActiveFileId,
        })
      },

      renameFile: (fileId, newName) => {
        const { currentProject, openFiles } = get()
        if (!currentProject) return

        const updatedProject = {
          ...currentProject,
          files: currentProject.files.map((file) =>
            file.id === fileId ? { ...file, name: newName } : file
          ),
        }

        const updatedOpenFiles = openFiles.map((file) =>
          file.id === fileId ? { ...file, name: newName } : file
        )

        set({
          currentProject: updatedProject,
          openFiles: updatedOpenFiles,
        })
      },

      saveFile: (fileId) => {
        const { unsavedChanges } = get()
        const newUnsavedChanges = new Set(unsavedChanges)
        newUnsavedChanges.delete(fileId)
        set({ unsavedChanges: newUnsavedChanges })

        // TODO: Implement API call to save file
        console.log('Saving file:', fileId)
      },

      saveAllFiles: () => {
        set({ unsavedChanges: new Set() })

        // TODO: Implement API call to save all files
        console.log('Saving all files')
      },

      hasUnsavedChanges: (fileId) => {
        return get().unsavedChanges.has(fileId)
      },
    }),
    {
      name: 'norstudio-project-storage',
      partialize: (state) => ({
        currentProject: state.currentProject,
        openFiles: state.openFiles,
        activeFileId: state.activeFileId,
      }),
    }
  )
)
