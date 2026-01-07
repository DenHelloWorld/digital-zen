# API Usage Example

This document shows how to use the User Data Sync Service in your Angular components.

## Basic Usage

### 1. Import the Service

```typescript
import { inject } from '@angular/core';
import { UserDataSyncService } from '../common';
```

### 2. Inject the Service

```typescript
export class YourComponent {
  readonly #userDataSync = inject(UserDataSyncService);
}
```

### 3. Load User Data

```typescript
loadDataFromServer(): void {
  const userInfo = this.#userDataSync.getCurrentUserInfo();

  if (!userInfo) {
    console.error('User not authenticated');
    return;
  }

  // Uses query parameters: GET /api/user?user_email=...&user_id=...
  this.#userDataSync
    .getUserData(userInfo.email, userInfo.userId)
    .subscribe({
      next: (response) => {
        console.log('User data loaded:', response);
      },
      error: (error) => {
        console.error('Failed to load data:', error);
      }
    });
}
```

### 4. Save User Data

```typescript
saveDataToServer(): void {
  // Get current user info
  const userInfo = this.#userDataSync.getCurrentUserInfo();

  if (!userInfo) {
    console.error('User not authenticated');
    return;
  }

  // Get periods from your service
  const periods = this.#focusService.periods();

  if (!periods) {
    console.error('No periods to save');
    return;
  }

  // Save to API
  this.#userDataSync
    .saveUserData(userInfo.email, userInfo.userId, periods)
    .subscribe({
      next: (result) => {
        console.log('Data saved successfully:', result.message);
      },
      error: (error) => {
        console.error('Failed to save data:', error);
      }
    });
}
```

## Complete Example Component

```typescript
import { Component, inject } from '@angular/core';
import { UserDataSyncService, FocusService } from '../common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'dz-sync-example',
  template: `
    <div class="sync-controls">
      <button (click)="saveToServer()">Save to Server</button>
      <button (click)="loadFromServer()">Load from Server</button>

      @if (isSyncing()) {
        <p>Syncing...</p>
      }

      @if (syncMessage()) {
        <p>{{ syncMessage() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SyncExampleComponent {
  readonly #userDataSync = inject(UserDataSyncService);
  readonly #focusService = inject(FocusService);
  readonly #destroyRef = inject(DestroyRef);

  protected readonly isSyncing = signal(false);
  protected readonly syncMessage = signal('');

  saveToServer(): void {
    const userInfo = this.#userDataSync.getCurrentUserInfo();

    if (!userInfo) {
      this.syncMessage.set('Please log in first');
      return;
    }

    const periods = this.#focusService.periods();

    if (!periods) {
      this.syncMessage.set('No data to save');
      return;
    }

    this.isSyncing.set(true);
    this.syncMessage.set('Saving...');

    this.#userDataSync
      .saveUserData(userInfo.email, userInfo.userId, periods)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: result => {
          this.isSyncing.set(false);
          this.syncMessage.set('✓ Data saved successfully');
          console.log('Saved:', result);
        },
        error: error => {
          this.isSyncing.set(false);
          this.syncMessage.set('✗ Failed to save data');
          console.error('Error:', error);
        },
      });
  }

  loadFromServer(): void {
    const userInfo = this.#userDataSync.getCurrentUserInfo();

    if (!userInfo) {
      this.syncMessage.set('Please log in first');
      return;
    }

    this.isSyncing.set(true);
    this.syncMessage.set('Loading...');

    this.#userDataSync
      .getUserData(userInfo.email, userInfo.userId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: response => {
          this.isSyncing.set(false);

          if (response.periods.length > 0) {
            this.syncMessage.set(`✓ Loaded ${response.periods.length} periods`);
            // Here you would update your local state with loaded periods
            console.log('Loaded data:', response);
          } else {
            this.syncMessage.set('No data found on server');
          }
        },
        error: error => {
          this.isSyncing.set(false);
          this.syncMessage.set('✗ Failed to load data');
          console.error('Error:', error);
        },
      });
  }
}
```

## Auto-Sync on Login

You can automatically sync when user logs in:

```typescript
export class AppComponent {
  readonly #authService = inject(AuthService);
  readonly #userDataSync = inject(UserDataSyncService);
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    // Watch for authentication changes
    effect(() => {
      const isAuthenticated = this.#authService.isGoogleAuthenticated();

      if (isAuthenticated) {
        this.loadUserData();
      }
    });
  }

  private loadUserData(): void {
    const userInfo = this.#userDataSync.getCurrentUserInfo();

    if (!userInfo) {
      return;
    }

    this.#userDataSync
      .getUserData(userInfo.email, userInfo.userId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: response => {
          console.log('Auto-loaded user data:', response);
          // Update local state with server data
        },
        error: error => {
          console.error('Auto-load failed:', error);
        },
      });
  }
}
```

## Periodic Auto-Save

Save data automatically every 5 minutes:

```typescript
export class AppComponent {
  readonly #userDataSync = inject(UserDataSyncService);
  readonly #focusService = inject(FocusService);
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    this.startAutoSave();
  }

  private startAutoSave(): void {
    // Auto-save every 5 minutes (300000 ms)
    interval(300000)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.autoSaveData();
      });
  }

  private autoSaveData(): void {
    const userInfo = this.#userDataSync.getCurrentUserInfo();

    if (!userInfo) {
      return; // Not logged in, skip auto-save
    }

    const periods = this.#focusService.periods();

    if (!periods || periods.length === 0) {
      return; // No data to save
    }

    this.#userDataSync
      .saveUserData(userInfo.email, userInfo.userId, periods)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          console.log('Auto-save successful');
        },
        error: error => {
          console.error('Auto-save failed:', error);
        },
      });
  }
}
```

## Error Handling

Always handle errors properly:

```typescript
this.#userDataSync.saveUserData(email, userId, periods).subscribe({
  next: result => {
    // Success
  },
  error: error => {
    if (error.status === 401) {
      // Unauthorized - API key is wrong
      console.error('Invalid API key');
    } else if (error.status === 500) {
      // Server error
      console.error('Server error:', error.message);
    } else {
      // Other errors
      console.error('Unknown error:', error);
    }
  },
});
```

## Notes

- **Always check authentication** before calling API methods
- **Use takeUntilDestroyed** to prevent memory leaks
- **Handle errors gracefully** to provide good user experience
- **Consider rate limiting** for auto-save features
- **Test with actual API** after deployment

## Next Steps

1. Deploy API to server (see `docs/api-deployment.md`)
2. Configure API key in `api-config.const.ts`
3. Test integration with real API
4. Add sync buttons to your UI
5. Consider adding sync status indicator
