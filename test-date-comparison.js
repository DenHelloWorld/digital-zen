// Test to understand Date.now() behavior near midnight

console.log('=== Testing Date.now() timing issues ===\n');

// Simulate test running at exactly 23:59:59.999
const testStartTime = new Date('2024-01-01T23:59:59.999Z').getTime();

console.log('Test starts at:', new Date(testStartTime).toISOString());

// Create period (simulating test code)
const startFrom = new Date(testStartTime - 3600000); // 1 hour before
const endTo = new Date(testStartTime + 3600000); // 1 hour after

console.log('Period startFrom:', startFrom.toISOString(), '(1 hour before test start)');
console.log('Period endTo:', endTo.toISOString(), '(1 hour after test start)');

// Simulate small delay (1ms) before startFocus executes
const nowTime = testStartTime + 1;
const now = new Date(nowTime);

console.log('\nWhen startFocus executes (1ms later):');
console.log('now:', now.toISOString());

// Check the comparison
const isBeforeStart = now < startFrom;
const isAfterEnd = now > endTo;
const shouldReturnError = isBeforeStart || isAfterEnd;

console.log('\nComparison results:');
console.log('now < startFrom:', isBeforeStart, `(${now.getTime()} < ${startFrom.getTime()})`);
console.log('now > endTo:', isAfterEnd, `(${now.getTime()} > ${endTo.getTime()})`);
console.log('Should return PERIOD_OUTSIDE_TIME_RANGE:', shouldReturnError);
console.log('Expected: false (test expects success)');

// Now test what happens if we cross midnight during the test
console.log('\n=== Edge case: Test crosses midnight ===\n');

const midnightTestTime = new Date('2024-01-01T23:59:59.995Z').getTime();
console.log('Test starts at:', new Date(midnightTestTime).toISOString());

const period2Start = new Date(midnightTestTime - 3600000);
const period2End = new Date(midnightTestTime + 3600000);

console.log('Period startFrom:', period2Start.toISOString());
console.log('Period endTo:', period2End.toISOString());

// Simulate delay that causes rollover to next second (and potentially next day)
const now2Time = midnightTestTime + 6; // Crosses midnight!
const now2 = new Date(now2Time);

console.log('\nWhen startFocus executes (6ms later, crossed midnight):');
console.log('now:', now2.toISOString());

const isBeforeStart2 = now2 < period2Start;
const isAfterEnd2 = now2 > period2End;
const shouldReturnError2 = isBeforeStart2 || isAfterEnd2;

console.log('\nComparison results:');
console.log('now < startFrom:', isBeforeStart2, `(${now2.getTime()} < ${period2Start.getTime()})`);
console.log('now > endTo:', isAfterEnd2, `(${now2.getTime()} > ${period2End.getTime()})`);
console.log('Should return PERIOD_OUTSIDE_TIME_RANGE:', shouldReturnError2);
console.log('Expected: false (test expects success)');

// Test the race condition scenario
console.log('\n=== Race condition: Significant delay between test setup and execution ===\n');

const testSetupTime = new Date('2024-01-01T14:30:00.000Z').getTime();
console.log('Test creates period at:', new Date(testSetupTime).toISOString());

const period3Start = new Date(testSetupTime - 3600000);
const period3End = new Date(testSetupTime + 3600000);

console.log('Period startFrom:', period3Start.toISOString(), '(should be 13:30)');
console.log('Period endTo:', period3End.toISOString(), '(should be 15:30)');

// Simulate async delay - startFocus runs 2 hours later!
const now3Time = testSetupTime + 7200000; // 2 hours later
const now3 = new Date(now3Time);

console.log('\nstartFocus executes 2 hours later:');
console.log('now:', now3.toISOString(), '(should be 16:30)');

const isBeforeStart3 = now3 < period3Start;
const isAfterEnd3 = now3 > period3End;
const shouldReturnError3 = isBeforeStart3 || isAfterEnd3;

console.log('\nComparison results:');
console.log('now < startFrom:', isBeforeStart3);
console.log('now > endTo:', isAfterEnd3);
console.log('Should return PERIOD_OUTSIDE_TIME_RANGE:', shouldReturnError3);
console.log('Expected: TRUE - this is correct behavior (16:30 > 15:30)');

console.log('\n=== Summary ===');
console.log('JavaScript Date comparisons work correctly across midnight.');
console.log('The issue must be something else - perhaps:');
console.log('1. Tests using getDay() which depends on local timezone');
console.log('2. Date object creation with timezone differences on Windows');
console.log('3. Timing issues where new Date() is called multiple times');
