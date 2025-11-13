import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

// Mock file object
export function createMockFile(overrides = {}) {
  return {
    id: 'test-file-id',
    name: 'test.sol',
    path: 'test.sol',
    content: '// Test contract',
    type: 'solidity' as const,
    ...overrides,
  }
}

// Mock project object
export function createMockProject(overrides = {}) {
  return {
    id: 'test-project-id',
    name: 'Test Project',
    files: [createMockFile()],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Wait for async updates
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export * from '@testing-library/react'
