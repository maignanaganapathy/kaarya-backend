import logger from './src/utils/logger';

logger.info('Test info message');
logger.error('Test error message');
logger.debug('Test debug message');

console.log('Check logs/ folder for generated log files!');
// npx ts-node test-logger.ts 
// to test this file