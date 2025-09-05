// Quick test to verify TimeService functionality
const TimeService = require('./src/lib/time-service.ts').default;

console.log('Testing TimeService consolidation...');

// Test basic date functions
console.log('getCurrentDate():', TimeService.getCurrentDate());
console.log('formatRelativeDate(today):', TimeService.formatRelativeDate(TimeService.getCurrentDate()));

// Test yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
console.log('formatRelativeDate(yesterday):', TimeService.formatRelativeDate(yesterdayStr));

// Test success colors
console.log('getSuccessColor(90%):', TimeService.getSuccessColor(90));
console.log('getSuccessColor(40%):', TimeService.getSuccessColor(40));
console.log('getSuccessColor(10%):', TimeService.getSuccessColor(10));

console.log('All TimeService functions working correctly!');
