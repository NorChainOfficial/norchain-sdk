/**
 * Migration Runner
 * This file helps TypeORM CLI resolve path aliases
 */
import 'tsconfig-paths/register';
import { MigrationDataSource } from './data-source';

// Export for TypeORM CLI
export default MigrationDataSource;
