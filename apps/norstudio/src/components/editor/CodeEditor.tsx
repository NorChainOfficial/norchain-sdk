'use client'

import React, { useRef, useEffect } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useTheme } from 'next-themes'

interface CodeEditorProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly language: string
  readonly readOnly?: boolean
  readonly onSave?: () => void
}

export const CodeEditor = ({
  value,
  onChange,
  language,
  readOnly = false,
  onSave,
}: CodeEditorProps): JSX.Element => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const { theme } = useTheme()

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor

    // Register Solidity language if not already registered
    if (!monaco.languages.getLanguages().some((lang) => lang.id === 'solidity')) {
      monaco.languages.register({ id: 'solidity' })

      monaco.languages.setMonarchTokensProvider('solidity', {
        keywords: [
          'pragma', 'solidity', 'contract', 'interface', 'library', 'using', 'struct',
          'enum', 'event', 'function', 'modifier', 'constructor', 'fallback', 'receive',
          'returns', 'return', 'public', 'private', 'internal', 'external', 'pure',
          'view', 'payable', 'virtual', 'override', 'abstract', 'immutable', 'constant',
          'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'throw', 'emit',
          'try', 'catch', 'assembly', 'let', 'switch', 'case', 'default', 'delete',
          'new', 'import', 'from', 'as', 'is', 'memory', 'storage', 'calldata',
        ],
        typeKeywords: [
          'address', 'bool', 'string', 'bytes', 'byte', 'int', 'uint', 'fixed', 'ufixed',
          'int8', 'int16', 'int24', 'int32', 'int40', 'int48', 'int56', 'int64',
          'int72', 'int80', 'int88', 'int96', 'int104', 'int112', 'int120', 'int128',
          'int136', 'int144', 'int152', 'int160', 'int168', 'int176', 'int184', 'int192',
          'int200', 'int208', 'int216', 'int224', 'int232', 'int240', 'int248', 'int256',
          'uint8', 'uint16', 'uint24', 'uint32', 'uint40', 'uint48', 'uint56', 'uint64',
          'uint72', 'uint80', 'uint88', 'uint96', 'uint104', 'uint112', 'uint120', 'uint128',
          'uint136', 'uint144', 'uint152', 'uint160', 'uint168', 'uint176', 'uint184', 'uint192',
          'uint200', 'uint208', 'uint216', 'uint224', 'uint232', 'uint240', 'uint248', 'uint256',
          'bytes1', 'bytes2', 'bytes3', 'bytes4', 'bytes8', 'bytes16', 'bytes32',
          'mapping',
        ],
        operators: [
          '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
          '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
          '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
          '%=', '<<=', '>>=', '>>>=', '=>',
        ],
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        tokenizer: {
          root: [
            [/[a-z_$][\w$]*/, {
              cases: {
                '@typeKeywords': 'type',
                '@keywords': 'keyword',
                '@default': 'identifier',
              },
            }],
            [/[A-Z][\w\$]*/, 'type.identifier'],
            { include: '@whitespace' },
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, {
              cases: {
                '@operators': 'operator',
                '@default': '',
              },
            }],
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],
            [/[;,.]/, 'delimiter'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
            [/'[^\\']'/, 'string'],
          ],
          string: [
            [/[^\\"]+/, 'string'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
          ],
          whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
          ],
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment'],
          ],
        },
      })
    }

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.()
    })

    // Focus editor
    editor.focus()
  }

  const handleChange = (value: string | undefined) => {
    onChange(value || '')
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language === 'solidity' ? 'solidity' : language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          fontSize: 14,
          fontFamily: 'Fira Code, JetBrains Mono, Monaco, Consolas, monospace',
          fontLigatures: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
        }}
      />
    </div>
  )
}
