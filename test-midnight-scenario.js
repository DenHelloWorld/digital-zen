// Test to demonstrate the midnight boundary issue
// This simulates what happens when tests run near midnight

function getTimeInMilliseconds(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  
  return (
    hours * 60 * 60 * 1000 +
    minutes * 60 * 1000 +
    seconds * 1000 +
    milliseconds
  );
}

function isCurrentTimeInRange(currentDate, startDate, endDate) {
  if (startDate === null && endDate === null) {
    return true;
  }
  
  const currentTimeMs = getTimeInMilliseconds(currentDate);
  
  if (startDate !== null && endDate === null) {
    const startTimeMs = getTimeInMilliseconds(startDate);
    return currentTimeMs >= startTimeMs;
  }
  
  if (startDate === null && endDate !== null) {
    const endTimeMs = getTimeInMilliseconds(endDate);
    return currentTimeMs < endTimeMs;
  }
  
  const startTimeMs = getTimeInMilliseconds(startDate);
  const endTimeMs = getTimeInMilliseconds(endDate);
  
  return currentTimeMs >= startTimeMs && currentTimeMs < endTimeMs;
}

// Scenario 1: Test runs at 23:30 on day 1
console.log('\n=== Scenario 1: Test runs at 23:30 ===');
const now1 = new Date('2024-01-01T23:30:00.000');
const startFrom1 = new Date(now1.getTime() + 3600000); // 1 hour from now = 00:30 on day 2
const endTo1 = new Date(now1.getTime() + 7200000); // 2 hours from now = 01:30 on day 2

console.log('Current time:', now1.toISOString(), '(23:30)');
console.log('Period start:', startFrom1.toISOString(), '(00:30 next day)');
console.log('Period end:', endTo1.toISOString(), '(01:30 next day)');
console.log('Current time ms:', getTimeInMilliseconds(now1), '(23:30 in ms)');
console.log('Start time ms:', getTimeInMilliseconds(startFrom1), '(00:30 in ms)');
console.log('End time ms:', getTimeInMilliseconds(endTo1), '(01:30 in ms)');

// Using time-of-day comparison
const inRange1TimeOfDay = isCurrentTimeInRange(now1, startFrom1, endTo1);
console.log('isCurrentTimeInRange (time-of-day):', inRange1TimeOfDay);
console.log('Expected: false (23:30 is NOT between 00:30 and 01:30 in time-of-day)');

// Using absolute comparison (what the tests expect)
const inRange1Absolute = now1 >= startFrom1 && now1 < endTo1;
console.log('Absolute date comparison:', inRange1Absolute);
console.log('Expected: false (23:30 is NOT between 00:30 and 01:30 in absolute time)');

// Scenario 2: Test runs at 00:30 on day 2 (within the period)
console.log('\n=== Scenario 2: Test runs at 00:30 (within period) ===');
const now2 = new Date('2024-01-02T00:30:00.000');
const startFrom2 = new Date('2024-01-01T23:30:00.000'); // Created yesterday at 23:30
const periodStart2 = new Date(startFrom2.getTime() + 3600000); // Still 00:30 day 2
const periodEnd2 = new Date(startFrom2.getTime() + 7200000); // Still 01:30 day 2

console.log('Current time:', now2.toISOString(), '(00:30)');
console.log('Period start:', periodStart2.toISOString());
console.log('Period end:', periodEnd2.toISOString());
console.log('isCurrentTimeInRange (time-of-day):', isCurrentTimeInRange(now2, periodStart2, periodEnd2));
console.log('Expected: true (00:30 IS between 00:30 and 01:30)');
console.log('Absolute date comparison:', now2 >= periodStart2 && now2 < periodEnd2);
console.log('Expected: true');

// Scenario 3: Period crosses midnight (22:00 to 02:00)
console.log('\n=== Scenario 3: Period crosses midnight (22:00 to 02:00) ===');
const now3 = new Date('2024-01-01T23:30:00.000');
const startFrom3 = new Date('2024-01-01T22:00:00.000');
const endTo3 = new Date('2024-01-02T02:00:00.000'); // Next day

console.log('Current time:', now3.toISOString(), '(23:30)');
console.log('Period start:', startFrom3.toISOString(), '(22:00)');
console.log('Period end:', endTo3.toISOString(), '(02:00 next day)');
console.log('isCurrentTimeInRange (time-of-day):', isCurrentTimeInRange(now3, startFrom3, endTo3));
console.log('Expected with time-of-day: false (23:30 NOT between 22:00 and 02:00 in time-only)');
console.log('Absolute date comparison:', now3 >= startFrom3 && now3 < endTo3);
console.log('Expected with absolute: true (23:30 IS between 22:00 same day and 02:00 next day)');

console.log('\n=== Issue Summary ===');
console.log('The time-of-day comparison (isCurrentTimeInRange) cannot handle periods that cross midnight.');
console.log('The tests use Date.now() + offset which can create cross-midnight scenarios.');
console.log('Solution: Use absolute date comparison when both boundaries are non-null.');
