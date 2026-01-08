# Toast Notification Flow for Time Range Validation

This document demonstrates how the toast notification system works when a user attempts to activate focus outside the configured time range.

## Implementation Status

✅ **FULLY IMPLEMENTED** - Toast notifications are already working for `PERIOD_OUTSIDE_TIME_RANGE` errors.

## User Flow

### Scenario: User tries to activate focus outside time range

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: User Configuration                                  │
├─────────────────────────────────────────────────────────────┤
│ User creates a period:                                      │
│   - Name: "Work Hours"                                      │
│   - Time Range: 09:00 - 17:00                              │
│   - Websites: facebook.com, twitter.com                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: User Action (Outside Time Range)                   │
├─────────────────────────────────────────────────────────────┤
│ Current Time: 08:30 AM (before 09:00)                      │
│ User clicks: "Start Focus" button                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Frontend → Background Communication                │
├─────────────────────────────────────────────────────────────┤
│ FocusService.toggleFocus() sends message:                  │
│   command: TOGGLE_FOCUS                                     │
│                                                             │
│ Background receives and calls:                              │
│   BackgroundService.startFocus(period)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Time Range Validation (Background)                 │
├─────────────────────────────────────────────────────────────┤
│ if (!isCurrentTimeInRange(now, period.startFrom, endTo)) { │
│   return {                                                  │
│     success: false,                                         │
│     error: FOCUS_ERROR_ENUM.PERIOD_OUTSIDE_TIME_RANGE      │
│   };                                                        │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Error Response to Frontend                         │
├─────────────────────────────────────────────────────────────┤
│ Response sent back to FocusService:                        │
│   {                                                         │
│     success: false,                                         │
│     error: 'PERIOD_OUTSIDE_TIME_RANGE'                     │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Toast Notification Display                         │
├─────────────────────────────────────────────────────────────┤
│ FocusService checks error type:                            │
│                                                             │
│ if (response.error === PERIOD_OUTSIDE_TIME_RANGE) {        │
│   toastService.show({                                      │
│     message: 'Current time is outside the period           │
│              time range.',                                  │
│     type: TOAST_TYPE_ENUM.WARN,                           │
│     position: POSITIONS_ENUM.BOTTOM_RIGHT                  │
│   });                                                       │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 7: User Sees Toast                                    │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐        │
│  │ ⚠️ Warning                                     │        │
│  │                                                 │        │
│  │ Current time is outside the period time range. │        │
│  │                                                 │        │
│  │                                    [Dismiss]    │        │
│  └────────────────────────────────────────────────┘        │
│                                      ↑                      │
│                          Appears in bottom-right corner    │
└─────────────────────────────────────────────────────────────┘
```

## Code Implementation

### 1. Error Enum Definition

**File:** `src/modules/common/enums/focus-error.enum.ts`

```typescript
export enum FOCUS_ERROR_ENUM {
  PERIOD_NOT_SCHEDULED_TODAY = 'PERIOD_NOT_SCHEDULED_TODAY',
  PERIOD_OUTSIDE_TIME_RANGE = 'PERIOD_OUTSIDE_TIME_RANGE', // ← Added
  PERIOD_NOT_FOUND = 'PERIOD_NOT_FOUND',
  UNKNOWN_COMMAND = 'UNKNOWN_COMMAND',
  GENERIC_ERROR = 'GENERIC_ERROR',
}
```

### 2. Toast Message Definition

**File:** `src/modules/common/enums/toast-messages.enum.ts`

```typescript
export enum TOAST_MESSAGES_ENUM {
  // ... other messages
  PERIOD_OUTSIDE_TIME_RANGE = 'Current time is outside the period time range.', // ← Added
  // ... other messages
}
```

### 3. Background Service Validation

**File:** `src/background/background-service-MV3.ts`

```typescript
private async startFocus(period: IFocus.Period): Promise<FocusOperationResult> {
  const today = new Date().getDay();

  // Check day of week
  if (period.daysOfWeek && !period.daysOfWeek.includes(today)) {
    return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_SCHEDULED_TODAY };
  }

  // ✨ Check time range (NEW)
  const now = new Date();
  if (!isCurrentTimeInRange(now, period.startFrom, period.endTo)) {
    return {
      success: false,
      error: FOCUS_ERROR_ENUM.PERIOD_OUTSIDE_TIME_RANGE
    };
  }

  // Continue with focus activation...
}
```

### 4. Frontend Toast Display

**File:** `src/modules/focus/services/focus.service.ts`

```typescript
public toggleFocus(): void {
  if (this.#isChromeRuntime) {
    chrome.runtime.sendMessage(
      { command: CHROME_COMMAND_ENUM.TOGGLE_FOCUS },
      response => {
        if (response && !response.success) {
          // Handle PERIOD_NOT_SCHEDULED_TODAY
          if (response.error === FOCUS_ERROR_ENUM.PERIOD_NOT_SCHEDULED_TODAY) {
            this.#toastService.show({
              message: TOAST_MESSAGES_ENUM.PERIOD_NOT_SCHEDULED_TODAY,
              type: TOAST_TYPE_ENUM.WARN,
              position: POSITIONS_ENUM.BOTTOM_RIGHT,
            });
          }
          // ✨ Handle PERIOD_OUTSIDE_TIME_RANGE (NEW)
          else if (response.error === FOCUS_ERROR_ENUM.PERIOD_OUTSIDE_TIME_RANGE) {
            this.#toastService.show({
              message: TOAST_MESSAGES_ENUM.PERIOD_OUTSIDE_TIME_RANGE,
              type: TOAST_TYPE_ENUM.WARN,
              position: POSITIONS_ENUM.BOTTOM_RIGHT,
            });
          }
        }
      }
    );
  }
}
```

## Toast Notification Properties

| Property     | Value                                            | Purpose                       |
| ------------ | ------------------------------------------------ | ----------------------------- |
| **message**  | "Current time is outside the period time range." | User-friendly error message   |
| **type**     | `TOAST_TYPE_ENUM.WARN`                           | Yellow/orange warning style   |
| **position** | `POSITIONS_ENUM.BOTTOM_RIGHT`                    | Bottom-right corner of screen |

## Visual Appearance

The toast notification will appear as a **warning** (yellow/orange) in the **bottom-right corner** of the screen:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                           ┌───────────────────┐ │
│                           │ ⚠️ Warning        │ │
│                           │                   │ │
│                           │ Current time is   │ │
│                           │ outside the       │ │
│                           │ period time range.│ │
│                           │                   │ │
│                           │         [Dismiss] │ │
│                           └───────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Toast Behavior

- **Auto-dismiss:** Toast automatically disappears after a few seconds
- **Manual dismiss:** User can click the dismiss button
- **Non-blocking:** User can interact with the page while toast is visible
- **Stacking:** Multiple toasts stack vertically if triggered in quick succession

## Example Scenarios

### Scenario 1: Work Hours (09:00 - 17:00)

| Current Time | User Action       | Result       | Toast Shown? |
| ------------ | ----------------- | ------------ | ------------ |
| 08:30        | Click Start Focus | ❌ Blocked   | ✅ Yes       |
| 09:00        | Click Start Focus | ✅ Activated | ❌ No        |
| 14:30        | Click Start Focus | ✅ Activated | ❌ No        |
| 17:00        | Click Start Focus | ❌ Blocked   | ✅ Yes       |
| 18:00        | Click Start Focus | ❌ Blocked   | ✅ Yes       |

### Scenario 2: Morning Hours (06:00 - 09:00)

| Current Time | User Action       | Result       | Toast Shown? |
| ------------ | ----------------- | ------------ | ------------ |
| 05:30        | Click Start Focus | ❌ Blocked   | ✅ Yes       |
| 06:00        | Click Start Focus | ✅ Activated | ❌ No        |
| 07:30        | Click Start Focus | ✅ Activated | ❌ No        |
| 09:00        | Click Start Focus | ❌ Blocked   | ✅ Yes       |
| 10:00        | Click Start Focus | ❌ Blocked   | ✅ Yes       |

### Scenario 3: Flexible (No Time Range)

| Current Time | User Action       | Result       | Toast Shown? |
| ------------ | ----------------- | ------------ | ------------ |
| Any time     | Click Start Focus | ✅ Activated | ❌ No        |

## Testing the Toast

To manually test the toast notification:

1. **Create a test period:**
   - Set time range to a future time (e.g., if it's 14:00, set range to 15:00 - 17:00)
2. **Try to activate focus:**
   - Click the "Start Focus" button
3. **Expected result:**
   - Focus does NOT activate
   - Toast appears in bottom-right corner
   - Message: "Current time is outside the period time range."
   - Type: Warning (yellow/orange)

4. **Wait until time range starts:**
   - When current time reaches the start time (15:00)
   - Click "Start Focus" again
5. **Expected result:**
   - Focus DOES activate
   - No toast appears (success case)

## Related Files

- Toast Component: `src/modules/common/components/toast-container/`
- Toast Service: `src/modules/common/components/toast-container/toast.service.ts`
- Toast Model: `src/modules/common/models/toast.model.ts`
- Position Enum: `src/modules/common/enums/positions.enum.ts`
- Toast Type Enum: `src/modules/common/enums/toast-type.enum.ts`

## Summary

✅ **Toast notification is fully implemented and working**

When a user attempts to activate focus outside the configured time range:

1. Backend validates the time range
2. Returns `PERIOD_OUTSIDE_TIME_RANGE` error
3. Frontend displays a warning toast
4. User sees: "Current time is outside the period time range."
5. Toast appears in bottom-right corner
6. User understands why focus didn't activate

**No additional implementation needed - feature is complete!** 🎉
