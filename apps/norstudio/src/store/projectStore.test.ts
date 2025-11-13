import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './projectStore'
import { createMockFile, createMockProject } from '../test/utils'

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      currentProject: null,
      openFiles: [],
      activeFileId: null,
      unsavedChanges: new Set(),
    })
  })

  describe('setCurrentProject', () => {
    it('should set the current project', () => {
      const project = createMockProject()
      useProjectStore.getState().setCurrentProject(project)
      
      expect(useProjectStore.getState().currentProject).toEqual(project)
    })

    it('should clear open files when setting new project', () => {
      const file = createMockFile()
      useProjectStore.setState({ openFiles: [file] })
      
      const newProject = createMockProject()
      useProjectStore.getState().setCurrentProject(newProject)
      
      expect(useProjectStore.getState().openFiles).toEqual([])
    })
  })

  describe('openFile', () => {
    it('should open a file', () => {
      const file = createMockFile()
      useProjectStore.getState().openFile(file)
      
      const state = useProjectStore.getState()
      expect(state.openFiles).toContainEqual(file)
      expect(state.activeFileId).toBe(file.id)
    })

    it('should not duplicate files', () => {
      const file = createMockFile()
      useProjectStore.getState().openFile(file)
      useProjectStore.getState().openFile(file)
      
      expect(useProjectStore.getState().openFiles).toHaveLength(1)
    })

    it('should set file as active when already open', () => {
      const file = createMockFile()
      useProjectStore.getState().openFile(file)
      useProjectStore.setState({ activeFileId: null })
      useProjectStore.getState().openFile(file)
      
      expect(useProjectStore.getState().activeFileId).toBe(file.id)
    })
  })

  describe('closeFile', () => {
    it('should close a file', () => {
      const file = createMockFile()
      useProjectStore.setState({ openFiles: [file] })
      useProjectStore.getState().closeFile(file.id)
      
      expect(useProjectStore.getState().openFiles).toHaveLength(0)
    })

    it('should switch active file when closing active file', () => {
      const file1 = createMockFile({ id: 'file-1', name: 'file1.sol' })
      const file2 = createMockFile({ id: 'file-2', name: 'file2.sol' })
      
      useProjectStore.setState({ openFiles: [file1, file2], activeFileId: 'file-2' })
      useProjectStore.getState().closeFile('file-2')
      
      expect(useProjectStore.getState().activeFileId).toBe('file-1')
    })

    it('should clear active file when closing last file', () => {
      const file = createMockFile()
      useProjectStore.setState({ openFiles: [file], activeFileId: file.id })
      useProjectStore.getState().closeFile(file.id)
      
      expect(useProjectStore.getState().activeFileId).toBeNull()
    })
  })

  describe('setActiveFile', () => {
    it('should set active file', () => {
      const file = createMockFile()
      useProjectStore.setState({ openFiles: [file] })
      useProjectStore.getState().setActiveFile(file.id)
      
      expect(useProjectStore.getState().activeFileId).toBe(file.id)
    })
  })

  describe('updateFile', () => {
    it('should update file content', () => {
      const file = createMockFile({ content: 'original' })
      useProjectStore.setState({ openFiles: [file] })
      useProjectStore.getState().updateFile(file.id, 'updated')
      
      const updatedFile = useProjectStore.getState().openFiles[0]
      expect(updatedFile.content).toBe('updated')
    })

    it('should mark file as having unsaved changes', () => {
      const file = createMockFile({ content: 'original' })
      useProjectStore.setState({ openFiles: [file] })
      useProjectStore.getState().updateFile(file.id, 'updated')
      
      expect(useProjectStore.getState().unsavedChanges.has(file.id)).toBe(true)
    })
  })

  describe('saveFile', () => {
    it('should clear unsaved changes flag', () => {
      const file = createMockFile()
      const unsavedChanges = new Set([file.id])
      useProjectStore.setState({ openFiles: [file], unsavedChanges })
      useProjectStore.getState().saveFile(file.id)
      
      expect(useProjectStore.getState().unsavedChanges.has(file.id)).toBe(false)
    })
  })

  describe('saveAllFiles', () => {
    it('should clear all unsaved changes', () => {
      const file1 = createMockFile({ id: 'file-1' })
      const file2 = createMockFile({ id: 'file-2' })
      const unsavedChanges = new Set(['file-1', 'file-2'])
      
      useProjectStore.setState({ openFiles: [file1, file2], unsavedChanges })
      useProjectStore.getState().saveAllFiles()
      
      expect(useProjectStore.getState().unsavedChanges.size).toBe(0)
    })
  })

  describe('hasUnsavedChanges', () => {
    it('should return true for files with unsaved changes', () => {
      const file = createMockFile()
      const unsavedChanges = new Set([file.id])
      useProjectStore.setState({ unsavedChanges })
      
      expect(useProjectStore.getState().hasUnsavedChanges(file.id)).toBe(true)
    })

    it('should return false for files without unsaved changes', () => {
      const file = createMockFile()
      useProjectStore.setState({ unsavedChanges: new Set() })
      
      expect(useProjectStore.getState().hasUnsavedChanges(file.id)).toBe(false)
    })
  })

  describe('deleteFile', () => {
    it('should close file if it was open', () => {
      const file = createMockFile()
      const project = createMockProject({ files: [file] })
      useProjectStore.setState({ currentProject: project, openFiles: [file] })
      
      useProjectStore.getState().deleteFile(file.id)
      
      expect(useProjectStore.getState().openFiles).toHaveLength(0)
    })
  })
})
