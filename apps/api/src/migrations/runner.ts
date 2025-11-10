/**
 * Migration Runner
 * This file helps TypeORM CLI resolve path aliases
 */
import 'tsconfig-paths/register';
import { AppDataSource } from '../config/data-source';

// Export for TypeORM CLI
export default AppDataSource;

