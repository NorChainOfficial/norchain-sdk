/**
 * ABI Manager - Parse and validate ABIs with comprehensive type support
 * Handles function signatures, parameter validation, and event parsing
 */

import { AbiFunction, AbiEvent, AbiParameter } from '@/lib/types';

export interface ParsedAbi {
  readonly functions: AbiFunction[];
  readonly events: AbiEvent[];
  readonly readFunctions: AbiFunction[];
  readonly writeFunctions: AbiFunction[];
  readonly payableFunctions: AbiFunction[];
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
  readonly parsedValue?: unknown;
}

export class AbiManager {
  private abi: readonly any[];

  constructor(abi: readonly any[]) {
    this.abi = abi;
  }

  /**
   * Parse the ABI and categorize functions and events
   */
  public parseAbi(): ParsedAbi {
    const functions: AbiFunction[] = [];
    const events: AbiEvent[] = [];
    const readFunctions: AbiFunction[] = [];
    const writeFunctions: AbiFunction[] = [];
    const payableFunctions: AbiFunction[] = [];

    for (const item of this.abi) {
      if (item.type === 'function') {
        const func = this.parseFunction(item);
        functions.push(func);

        // Categorize by state mutability
        if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
          readFunctions.push(func);
        } else {
          writeFunctions.push(func);
          if (func.stateMutability === 'payable') {
            payableFunctions.push(func);
          }
        }
      } else if (item.type === 'event') {
        events.push(this.parseEvent(item));
      }
    }

    return {
      functions,
      events,
      readFunctions,
      writeFunctions,
      payableFunctions,
    };
  }

  /**
   * Parse a single function from ABI
   */
  private parseFunction(item: any): AbiFunction {
    return {
      name: item.name,
      signature: this.generateFunctionSignature(item.name, item.inputs || []),
      stateMutability: item.stateMutability || 'nonpayable',
      inputs: (item.inputs || []).map(this.parseParameter),
      outputs: (item.outputs || []).map(this.parseParameter),
    };
  }

  /**
   * Parse a single event from ABI
   */
  private parseEvent(item: any): AbiEvent {
    return {
      name: item.name,
      signature: this.generateEventSignature(item.name, item.inputs || []),
      inputs: (item.inputs || []).map(this.parseParameter),
    };
  }

  /**
   * Parse a parameter with proper typing
   */
  private parseParameter(param: any): AbiParameter {
    return {
      name: param.name || '',
      type: param.type,
      indexed: param.indexed || false,
    };
  }

  /**
   * Generate function signature: functionName(type1,type2,...)
   */
  public generateFunctionSignature(name: string, inputs: readonly any[]): string {
    const types = inputs.map((input) => input.type).join(',');
    return `${name}(${types})`;
  }

  /**
   * Generate event signature: EventName(type1,type2,...)
   */
  private generateEventSignature(name: string, inputs: readonly any[]): string {
    const types = inputs.map((input) => input.type).join(',');
    return `${name}(${types})`;
  }

  /**
   * Validate and parse input value based on Solidity type
   */
  public validateAndParseInput(value: string, type: string): ValidationResult {
    try {
      // Empty value handling
      if (!value || value.trim() === '') {
        if (type.includes('[]')) {
          return { isValid: true, parsedValue: [] };
        }
        return { isValid: false, error: 'Value is required' };
      }

      // Array types
      if (type.includes('[]')) {
        return this.parseArrayType(value, type);
      }

      // Integer types (uint, int)
      if (type.startsWith('uint') || type.startsWith('int')) {
        return this.parseIntegerType(value, type);
      }

      // Boolean type
      if (type === 'bool') {
        return this.parseBooleanType(value);
      }

      // Address type
      if (type === 'address') {
        return this.parseAddressType(value);
      }

      // Bytes types
      if (type.startsWith('bytes')) {
        return this.parseBytesType(value, type);
      }

      // String type
      if (type === 'string') {
        return { isValid: true, parsedValue: value };
      }

      // Tuple types
      if (type.startsWith('tuple')) {
        return this.parseTupleType(value);
      }

      // Default: return as string
      return { isValid: true, parsedValue: value };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid value format',
      };
    }
  }

  /**
   * Parse array type
   */
  private parseArrayType(value: string, type: string): ValidationResult {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return { isValid: false, error: 'Value must be a JSON array' };
      }

      // Get base type
      const baseType = type.replace('[]', '');

      // Validate each element
      for (const item of parsed) {
        const itemValidation = this.validateAndParseInput(
          String(item),
          baseType
        );
        if (!itemValidation.isValid) {
          return {
            isValid: false,
            error: `Array element validation failed: ${itemValidation.error}`,
          };
        }
      }

      return { isValid: true, parsedValue: parsed };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid JSON array format. Example: ["value1", "value2"]',
      };
    }
  }

  /**
   * Parse integer type (uint/int variants)
   */
  private parseIntegerType(value: string, type: string): ValidationResult {
    // Remove whitespace
    const trimmed = value.trim();

    // Check for hex format
    if (trimmed.startsWith('0x')) {
      if (!/^0x[0-9a-fA-F]+$/.test(trimmed)) {
        return { isValid: false, error: 'Invalid hexadecimal format' };
      }
      return { isValid: true, parsedValue: trimmed };
    }

    // Check for decimal format
    if (!/^-?\d+$/.test(trimmed)) {
      return { isValid: false, error: 'Value must be an integer' };
    }

    // Check if unsigned
    if (type.startsWith('uint') && trimmed.startsWith('-')) {
      return { isValid: false, error: 'Unsigned integers cannot be negative' };
    }

    return { isValid: true, parsedValue: trimmed };
  }

  /**
   * Parse boolean type
   */
  private parseBooleanType(value: string): ValidationResult {
    const normalized = value.toLowerCase().trim();
    if (normalized === 'true' || normalized === '1') {
      return { isValid: true, parsedValue: true };
    }
    if (normalized === 'false' || normalized === '0') {
      return { isValid: true, parsedValue: false };
    }
    return {
      isValid: false,
      error: 'Value must be "true" or "false"',
    };
  }

  /**
   * Parse address type
   */
  private parseAddressType(value: string): ValidationResult {
    const trimmed = value.trim();

    // Check format
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
      return {
        isValid: false,
        error: 'Address must be 42 characters starting with 0x',
      };
    }

    return { isValid: true, parsedValue: trimmed };
  }

  /**
   * Parse bytes type
   */
  private parseBytesType(value: string, type: string): ValidationResult {
    const trimmed = value.trim();

    // Must start with 0x
    if (!trimmed.startsWith('0x')) {
      return { isValid: false, error: 'Bytes value must start with 0x' };
    }

    // Check hex format
    if (!/^0x[0-9a-fA-F]*$/.test(trimmed)) {
      return { isValid: false, error: 'Invalid hexadecimal format' };
    }

    // For fixed-size bytes (bytes1, bytes32, etc.)
    if (type !== 'bytes') {
      const size = parseInt(type.replace('bytes', ''));
      const expectedLength = size * 2 + 2; // 2 chars per byte + '0x'
      if (trimmed.length !== expectedLength) {
        return {
          isValid: false,
          error: `${type} must be exactly ${size} bytes (${expectedLength} characters including 0x)`,
        };
      }
    }

    return { isValid: true, parsedValue: trimmed };
  }

  /**
   * Parse tuple type
   */
  private parseTupleType(value: string): ValidationResult {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'object' || parsed === null) {
        return { isValid: false, error: 'Tuple must be a JSON object' };
      }
      return { isValid: true, parsedValue: parsed };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid JSON format for tuple. Example: {"field1": "value1"}',
      };
    }
  }

  /**
   * Get placeholder text for input field based on type
   */
  public getInputPlaceholder(type: string): string {
    if (type.startsWith('uint') || type.startsWith('int')) {
      return 'e.g., 123456789 or 0x1e240';
    }
    if (type === 'address') {
      return 'e.g., 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    }
    if (type === 'bool') {
      return 'true or false';
    }
    if (type === 'string') {
      return 'Enter string value';
    }
    if (type.includes('[]')) {
      const baseType = type.replace('[]', '');
      if (baseType === 'address') {
        return '["0x...", "0x..."]';
      }
      return '["value1", "value2"]';
    }
    if (type.startsWith('bytes')) {
      return 'e.g., 0x1234abcd';
    }
    if (type.startsWith('tuple')) {
      return '{"field1": "value1", "field2": "value2"}';
    }
    return 'Enter value';
  }

  /**
   * Get input type for HTML input element
   */
  public getInputType(solidityType: string): 'text' | 'number' {
    if (solidityType.startsWith('uint') || solidityType.startsWith('int')) {
      return 'text'; // Use text to support hex values
    }
    return 'text';
  }

  /**
   * Format output value for display
   */
  public formatOutput(value: unknown, type: string): string {
    if (value === null || value === undefined) {
      return 'null';
    }

    // Boolean
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    // BigInt
    if (typeof value === 'bigint') {
      return value.toString();
    }

    // Array
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
      return JSON.stringify(value, this.jsonReplacer, 2);
    }

    // Object (tuple)
    if (typeof value === 'object') {
      return JSON.stringify(value, this.jsonReplacer, 2);
    }

    // String/Number
    return String(value);
  }

  /**
   * JSON replacer to handle BigInt
   */
  private jsonReplacer(key: string, value: unknown): unknown {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }

  /**
   * Check if ABI is valid
   */
  public static isValidAbi(abi: unknown): boolean {
    if (!Array.isArray(abi)) {
      return false;
    }

    for (const item of abi) {
      if (!item || typeof item !== 'object') {
        return false;
      }
      if (!item.type || typeof item.type !== 'string') {
        return false;
      }
    }

    return true;
  }
}
