// Test getDay() timezone dependency

console.log('=== Testing getDay() timezone issues ===\n');

// UTC: Monday, January 1, 2024, 23:59:59
const utcTimeMonday = new Date('2024-01-01T23:59:59.000Z');
console.log('UTC Time:', utcTimeMonday.toISOString());
console.log('UTC Day of Week:', utcTimeMonday.getUTCDay(), '(0=Sunday, 1=Monday)');
console.log('LOCAL Day of Week:', utcTimeMonday.getDay(), '(0=Sunday, 1=Monday)');
console.log('Expected: Both should be 1 (Monday) if running in UTC');
console.log('');

// UTC: Tuesday, January 2, 2024, 00:00:01 (just after midnight)
const utcTimeTuesday = new Date('2024-01-02T00:00:01.000Z');
console.log('UTC Time:', utcTimeTuesday.toISOString());
console.log('UTC Day of Week:', utcTimeTuesday.getUTCDay(), '(2=Tuesday)');
console.log('LOCAL Day of Week:', utcTimeTuesday.getDay());
console.log('Note: LOCAL day depends on timezone!');
console.log('');

// Show what happens in different timezones
console.log('=== Simulating Windows test in PST (UTC-8) ===\n');

// In PST, when UTC is Tuesday 00:00:01, local time is Monday 16:00:01
const localDisplay = new Date(utcTimeTuesday);
console.log('UTC:', utcTimeTuesday.toISOString(), '- Day:', utcTimeTuesday.getUTCDay());
console.log('If local timezone is PST (UTC-8):');
console.log('  Local time would be: Monday 16:00:01');
console.log('  utcTimeTuesday.getDay() would still return:', utcTimeTuesday.getDay());
console.log('  (This depends on the system timezone where the code runs)');
console.log('');

// The actual problem scenario
console.log('=== The actual test failure scenario ===\n');

console.log('Test setup:');
console.log('1. Test creates period with: daysOfWeek: [today]');
console.log('2. Where today = new Date().getDay() in test setup');
console.log('3. Period also has: startFrom: Date.now() - 1 hour');
console.log('                    endTo: Date.now() + 1 hour');
console.log('');

console.log('Scenario causing failure:');
console.log('- Test runs on Windows in Pacific timezone (UTC-8)');
console.log('- Local time: Monday 23:30 (which is Tuesday 07:30 UTC)');
console.log('');

const testTime = new Date('2024-01-02T07:30:00.000Z'); // Tuesday 07:30 UTC = Monday 23:30 PST
console.log('When test executes:');
console.log('- UTC time:', testTime.toISOString());
console.log('- getDay() returns:', testTime.getDay(), '(local day of week)');
console.log('- getUTCDay() returns:', testTime.getUTCDay(), '(UTC day of week)');
console.log('');

// In test: const today = new Date().getDay();
const todayInTest = testTime.getDay(); // Returns local day

// In BackgroundServiceMV3: const today = new Date().getDay();  
const todayInService = testTime.getDay(); // Returns local day

console.log('Test sets: daysOfWeek: [', todayInTest, '] (local day)');
console.log('Service checks: today =', todayInService, '(local day)');
console.log('Match:', todayInTest === todayInService, '(same call, same result)');
console.log('');

console.log('Wait... if both use getDay(), they should match!');
console.log('');

console.log('=== The REAL issue ===\n');
console.log('The problem occurs when:');
console.log('1. Test creates period at time T with daysOfWeek: [new Date().getDay()]');
console.log('2. Some time passes (even milliseconds)');
console.log('3. startFocus creates new Date() at time T+delta');
console.log('4. If the clock crosses midnight (local OR UTC), getDay() changes!');
console.log('');

const beforeMidnight = new Date('2024-01-01T23:59:59.995Z');
const afterMidnight = new Date('2024-01-02T00:00:00.005Z');

console.log('Test creates period at:', beforeMidnight.toISOString());
console.log('daysOfWeek set to: [', beforeMidnight.getUTCDay(), '] (UTC day)');
console.log('But test uses getDay():[', beforeMidnight.getDay(), '] (local day)');
console.log('');
console.log('Service checks period at:', afterMidnight.toISOString());
console.log('today = ', afterMidnight.getUTCDay(), '(UTC day)');
console.log('But service uses getDay():', afterMidnight.getDay(), '(local day)');
console.log('');
console.log('If getDay() changed between test and service call, test fails!');
