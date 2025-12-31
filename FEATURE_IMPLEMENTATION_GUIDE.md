# Feature Implementation Guide

This document provides technical implementation details for the highest priority features proposed for Digital Zen.

---

## 🍅 1. Pomodoro Timer Implementation

### Data Model Changes

```typescript
// Add to src/modules/common/models/focus.model.ts

export namespace IFocus {
  // Extend existing Period interface
  export interface Period {
    // ... existing fields
    pomodoroSettings?: PomodoroSettings;
    currentPomodoro?: PomodoroSession;
  }

  export interface PomodoroSettings {
    enabled: boolean;
    workDuration: number; // minutes, default 25
    shortBreakDuration: number; // minutes, default 5
    longBreakDuration: number; // minutes, default 15
    pomodorosUntilLongBreak: number; // default 4
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    soundVolume: number; // 0-100
  }

  export interface PomodoroSession {
    currentCycle: number; // 1-N
    totalCycles: number; // Total completed today
    state: 'work' | 'short-break' | 'long-break' | 'paused';
    cycleStartTime: Date | null;
    cycleEndTime: Date | null;
    isPaused: boolean;
  }

  export interface PomodoroStatistics {
    date: Date;
    completedPomodoros: number;
    totalFocusTime: number; // milliseconds
    totalBreakTime: number; // milliseconds
    interruptions: number;
  }
}
```

### Service Implementation

```typescript
// Create src/modules/focus/services/pomodoro.service.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import { IFocus } from '../../common';

@Injectable({
  providedIn: 'root',
})
export class PomodoroService {
  readonly #currentSession = signal<IFocus.PomodoroSession | null>(null);
  readonly #settings = signal<IFocus.PomodoroSettings>({
    enabled: false,
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    soundVolume: 70,
  });

  public readonly currentSession = computed(() => this.#currentSession());
  public readonly settings = computed(() => this.#settings());

  public readonly timeRemaining = computed(() => {
    const session = this.#currentSession();
    if (!session?.cycleEndTime || session.isPaused) return 0;
    
    const now = Date.now();
    const end = session.cycleEndTime.getTime();
    return Math.max(0, end - now);
  });

  public readonly timeRemainingFormatted = computed(() => {
    const ms = this.timeRemaining();
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  public startPomodoro(): void {
    // Implementation
  }

  public pausePomodoro(): void {
    // Implementation
  }

  public resumePomodoro(): void {
    // Implementation
  }

  public skipToBreak(): void {
    // Implementation
  }

  public resetPomodoro(): void {
    // Implementation
  }

  #playSound(type: 'start' | 'end'): void {
    // Use Web Audio API
  }

  #scheduleAlarm(duration: number): void {
    // Use chrome.alarms API
  }
}
```

### UI Components

```typescript
// Create src/modules/focus/components/pomodoro-timer/pomodoro-timer.component.ts

@Component({
  selector: 'dz-pomodoro-timer',
  templateUrl: './pomodoro-timer.component.html',
  styleUrls: ['./pomodoro-timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class PomodoroTimerComponent {
  readonly #pomodoroService = inject(PomodoroService);

  protected readonly session = this.#pomodoroService.currentSession;
  protected readonly timeRemaining = this.#pomodoroService.timeRemainingFormatted;
  protected readonly settings = this.#pomodoroService.settings;

  protected onStart(): void {
    this.#pomodoroService.startPomodoro();
  }

  protected onPause(): void {
    this.#pomodoroService.pausePomodoro();
  }

  protected onResume(): void {
    this.#pomodoroService.resumePomodoro();
  }

  protected onSkip(): void {
    this.#pomodoroService.skipToBreak();
  }

  protected onReset(): void {
    this.#pomodoroService.resetPomodoro();
  }
}
```

### Background Service Integration

```typescript
// Update src/background/background-service-MV3.ts

export class BackgroundServiceMV3 {
  // Add new command handlers
  case CHROME_COMMAND_ENUM.START_POMODORO:
    await this.startPomodoro();
    break;
  case CHROME_COMMAND_ENUM.PAUSE_POMODORO:
    await this.pausePomodoro();
    break;
  // ... etc

  private async startPomodoro(): Promise<void> {
    // Create alarm for work session
    const duration = 25 * 60 * 1000; // 25 minutes
    chrome.alarms.create(CHROME_ALARM_ENUM.POMODORO_END, {
      delayInMinutes: 25
    });
  }
}
```

---

## 📊 2. Focus Statistics & Analytics Implementation

### Data Model

```typescript
// Add to src/modules/common/models/statistics.model.ts

export namespace IStatistics {
  export interface DailyStats {
    date: Date;
    totalFocusTime: number; // milliseconds
    totalBreakTime: number;
    focusSessionsCount: number;
    pomodorosCompleted: number;
    mostBlockedSite: string | null;
    mostProductiveHour: number | null; // 0-23
  }

  export interface WeeklyStats {
    weekStartDate: Date;
    dailyStats: DailyStats[];
    totalFocusTime: number;
    averageDailyFocusTime: number;
    longestStreak: number; // days
    currentStreak: number; // days
  }

  export interface MonthlyStats {
    month: number; // 1-12
    year: number;
    weeklyStats: WeeklyStats[];
    totalFocusTime: number;
    averageDailyFocusTime: number;
    mostProductiveDay: Date | null;
  }

  export interface SiteStatistics {
    siteUrl: string;
    siteName: string;
    totalBlocks: number;
    lastBlockedDate: Date | null;
  }
}
```

### Service Implementation

```typescript
// Create src/modules/statistics/services/statistics.service.ts

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  readonly #chromeStorageService = inject(ChromeStorageService);
  readonly #dailyStats = signal<IStatistics.DailyStats[]>([]);

  public readonly currentStreak = computed(() => {
    const stats = this.#dailyStats();
    // Calculate consecutive days with focus time
    return this.#calculateStreak(stats);
  });

  public readonly totalFocusTime = computed(() => {
    return this.#dailyStats()
      .reduce((sum, day) => sum + day.totalFocusTime, 0);
  });

  public async getDailyStats(date: Date): Promise<IStatistics.DailyStats> {
    // Retrieve from storage
  }

  public async recordFocusSession(
    startTime: Date,
    endTime: Date,
    periodId: string
  ): Promise<void> {
    // Store session data
  }

  public async exportData(format: 'csv' | 'json'): Promise<Blob> {
    // Export statistics
  }

  #calculateStreak(stats: IStatistics.DailyStats[]): number {
    // Implementation
  }
}
```

### Dashboard Component

```typescript
// Create src/modules/statistics/components/statistics-dashboard/statistics-dashboard.component.ts

@Component({
  selector: 'dz-statistics-dashboard',
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class StatisticsDashboardComponent {
  readonly #statisticsService = inject(StatisticsService);

  protected readonly currentStreak = this.#statisticsService.currentStreak;
  protected readonly totalFocusTime = this.#statisticsService.totalFocusTime;

  protected readonly selectedView = signal<'daily' | 'weekly' | 'monthly'>('weekly');

  protected onExport(format: 'csv' | 'json'): void {
    this.#statisticsService.exportData(format);
  }
}
```

---

## ⌨️ 3. Keyboard Shortcuts Implementation

### Manifest Changes

```json
// Update src/manifest.json

{
  "commands": {
    "toggle-focus": {
      "suggested_key": {
        "default": "Ctrl+Shift+F",
        "mac": "Command+Shift+F"
      },
      "description": "Toggle focus mode"
    },
    "toggle-pomodoro": {
      "suggested_key": {
        "default": "Ctrl+Shift+P",
        "mac": "Command+Shift+P"
      },
      "description": "Start/stop Pomodoro timer"
    },
    "block-current-site": {
      "suggested_key": {
        "default": "Ctrl+Shift+B",
        "mac": "Command+Shift+B"
      },
      "description": "Block current website"
    },
    "quick-break": {
      "suggested_key": {
        "default": "Ctrl+Shift+R",
        "mac": "Command+Shift+R"
      },
      "description": "Start a quick break"
    }
  }
}
```

### Background Service Handler

```typescript
// Update src/background/background-service-MV3.ts

private initializeListeners(): void {
  // Add command listener
  chrome.commands.onCommand.addListener((command) => {
    switch (command) {
      case 'toggle-focus':
        this.toggleFocus();
        break;
      case 'toggle-pomodoro':
        this.togglePomodoro();
        break;
      case 'block-current-site':
        this.blockCurrentSite();
        break;
      case 'quick-break':
        this.startQuickBreak();
        break;
    }
  });
}
```

### Settings Component

```typescript
// Create src/modules/settings/components/keyboard-shortcuts/keyboard-shortcuts.component.ts

@Component({
  selector: 'dz-keyboard-shortcuts',
  templateUrl: './keyboard-shortcuts.component.html',
  styleUrls: ['./keyboard-shortcuts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class KeyboardShortcutsComponent {
  protected readonly shortcuts = signal([
    { command: 'toggle-focus', description: 'Toggle focus mode', key: 'Ctrl+Shift+F' },
    { command: 'toggle-pomodoro', description: 'Start/stop Pomodoro', key: 'Ctrl+Shift+P' },
    { command: 'block-current-site', description: 'Block current site', key: 'Ctrl+Shift+B' },
    { command: 'quick-break', description: 'Start quick break', key: 'Ctrl+Shift+R' },
  ]);

  protected async onCustomizeShortcuts(): Promise<void> {
    // Open Chrome's shortcuts page
    chrome.tabs.create({ 
      url: 'chrome://extensions/shortcuts' 
    });
  }
}
```

---

## 🔄 4. Sync Across Devices Implementation

### Storage Migration

```typescript
// Create src/modules/common/services/sync-storage.service.ts

@Injectable({
  providedIn: 'root',
})
export class SyncStorageService {
  /**
   * Chrome sync storage has limits:
   * - Max 102,400 bytes total
   * - Max 8,192 bytes per item
   * - Max 512 items
   */
  
  public async savePeriod(period: IFocus.Period): Promise<void> {
    // Save to chrome.storage.sync with size checks
    const size = this.#calculateSize(period);
    if (size > 8192) {
      console.warn('Period too large for sync storage, using local storage');
      return this.#saveToLocalStorage(period);
    }
    
    return chrome.storage.sync.set({
      [`period_${period.id}`]: period
    });
  }

  public async getAllPeriods(): Promise<IFocus.Period[]> {
    const data = await chrome.storage.sync.get(null);
    return Object.keys(data)
      .filter(key => key.startsWith('period_'))
      .map(key => data[key]);
  }

  #calculateSize(obj: unknown): number {
    return new Blob([JSON.stringify(obj)]).size;
  }

  #saveToLocalStorage(period: IFocus.Period): Promise<void> {
    // Fallback to local storage
    return chrome.storage.local.set({
      [`period_${period.id}`]: period
    });
  }
}
```

### Sync Conflict Resolution

```typescript
// Create src/modules/common/services/sync-conflict-resolver.service.ts

@Injectable({
  providedIn: 'root',
})
export class SyncConflictResolverService {
  /**
   * Resolve conflicts when the same period is modified on multiple devices
   */
  public resolveConflict(
    local: IFocus.Period,
    remote: IFocus.Period
  ): IFocus.Period {
    // Use last-write-wins strategy based on modification timestamp
    // In future, could implement more sophisticated merge strategies
    
    if (!local.sessionStartTime && !remote.sessionStartTime) {
      // Neither has session data, use most recently modified
      return this.#getMostRecent(local, remote);
    }
    
    if (local.sessionStartTime && !remote.sessionStartTime) {
      return local; // Prefer active session
    }
    
    if (!local.sessionStartTime && remote.sessionStartTime) {
      return remote; // Prefer active session
    }
    
    // Both have sessions, use most recent session
    return local.sessionStartTime! > remote.sessionStartTime! 
      ? local 
      : remote;
  }

  #getMostRecent(
    local: IFocus.Period,
    remote: IFocus.Period
  ): IFocus.Period {
    // Compare based on some timestamp field
    // For now, simple strategy
    return local;
  }
}
```

### Sync Status Component

```typescript
// Create src/modules/common/components/sync-status/sync-status.component.ts

@Component({
  selector: 'dz-sync-status',
  template: `
    <div class="sync-status" [class.syncing]="isSyncing()">
      @if (isSyncing()) {
        <svg class="icon-spin">
          <use href="#icon-sync"></use>
        </svg>
        <span>Syncing...</span>
      } @else if (lastSyncTime()) {
        <svg>
          <use href="#icon-check"></use>
        </svg>
        <span>Synced {{ lastSyncTime() | timeAgo }}</span>
      } @else {
        <svg>
          <use href="#icon-cloud-off"></use>
        </svg>
        <span>Not synced</span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class SyncStatusComponent {
  readonly #syncService = inject(SyncStorageService);

  protected readonly isSyncing = signal(false);
  protected readonly lastSyncTime = signal<Date | null>(null);

  constructor() {
    // Listen to sync events
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        this.lastSyncTime.set(new Date());
      }
    });
  }
}
```

---

## 🗄️ Storage Schema Migration

When implementing new features, you'll need to migrate existing storage:

```typescript
// Create src/modules/common/services/storage-migration.service.ts

@Injectable({
  providedIn: 'root',
})
export class StorageMigrationService {
  private readonly CURRENT_VERSION = 2;

  public async migrate(): Promise<void> {
    const version = await this.#getCurrentVersion();
    
    if (version < this.CURRENT_VERSION) {
      console.log(`Migrating from version ${version} to ${this.CURRENT_VERSION}`);
      
      for (let v = version; v < this.CURRENT_VERSION; v++) {
        await this.#runMigration(v, v + 1);
      }
      
      await this.#setVersion(this.CURRENT_VERSION);
    }
  }

  async #runMigration(from: number, to: number): Promise<void> {
    switch (`${from}_${to}`) {
      case '1_2':
        await this.#migrateV1ToV2();
        break;
      // Add more migrations as needed
    }
  }

  async #migrateV1ToV2(): Promise<void> {
    // Example: Add pomodoro settings to existing periods
    const periods = await StorageAdapter.getPeriods();
    
    const updatedPeriods = periods.map(period => ({
      ...period,
      pomodoroSettings: {
        enabled: false,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        pomodorosUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        soundVolume: 70,
      }
    }));

    await chrome.storage.local.set({
      [CHROME_STORAGE_KEY_ENUM.PERIODS]: updatedPeriods
    });
  }

  async #getCurrentVersion(): Promise<number> {
    const result = await chrome.storage.local.get('schema_version');
    return result.schema_version || 1;
  }

  async #setVersion(version: number): Promise<void> {
    await chrome.storage.local.set({ schema_version: version });
  }
}
```

---

## 🧪 Testing Considerations

### Unit Tests

```typescript
// Example: pomodoro.service.spec.ts

describe('PomodoroService', () => {
  let service: PomodoroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PomodoroService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should start a pomodoro with default settings', () => {
    service.startPomodoro();
    const session = service.currentSession();
    
    expect(session).toBeTruthy();
    expect(session?.state).toBe('work');
    expect(session?.currentCycle).toBe(1);
  });

  it('should format time remaining correctly', () => {
    // Mock time remaining
    service.startPomodoro();
    const formatted = service.timeRemainingFormatted();
    
    expect(formatted).toMatch(/\d{2}:\d{2}/);
  });

  it('should transition to break after work session', () => {
    // Test state transitions
  });
});
```

### Integration Tests

```typescript
// Example: Test Chrome storage integration

describe('SyncStorageService Integration', () => {
  let service: SyncStorageService;

  beforeEach(() => {
    // Mock Chrome storage APIs
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn(),
        }
      }
    } as any;

    service = TestBed.inject(SyncStorageService);
  });

  it('should save period to sync storage', async () => {
    const period = { /* mock period */ };
    await service.savePeriod(period);
    
    expect(chrome.storage.sync.set).toHaveBeenCalled();
  });
});
```

---

## 📦 New Dependencies

For implementing these features, you may need:

```json
// package.json additions

{
  "dependencies": {
    // For charts in statistics
    "chart.js": "^4.4.0",
    "ng2-charts": "^5.0.0",
    
    // For advanced date handling
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    // For testing Chrome APIs
    "@types/chrome": "^0.0.260"
  }
}
```

---

## 🎨 UI/UX Considerations

### Design Principles

1. **Minimal Visual Impact**: Features should enhance, not clutter
2. **Consistent Patterns**: Follow existing BEM naming and component structure
3. **Accessible**: ARIA labels, keyboard navigation
4. **Responsive**: Works in popup's limited space
5. **Performance**: Use OnPush, minimize reflows

### Example SCSS

```scss
// pomodoro-timer.component.scss

.dz-pomodoro {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;

  &__timer {
    font-size: 3rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--color-accent);
  }

  &__controls {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  &__progress {
    width: 100%;
    height: 4px;
    background: var(--color-surface-variant);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 0.5rem;

    &-bar {
      height: 100%;
      background: var(--color-accent);
      transition: width 0.3s ease;
    }
  }

  &--break {
    .dz-pomodoro__timer {
      color: var(--color-success);
    }
  }
}
```

---

## 🔐 Security Considerations

1. **Password Storage**: Use Web Crypto API to hash passwords
2. **Data Privacy**: Process statistics locally, don't send to external servers
3. **Sync Security**: Chrome sync is encrypted, but be mindful of sensitive data
4. **API Keys**: If integrating external services, store keys securely
5. **Permissions**: Request minimal permissions needed

---

## 📱 Performance Optimization

1. **Lazy Loading**: Load features only when needed
2. **Service Workers**: Already using for background tasks
3. **Signal Optimizations**: Use computed() for derived state
4. **Storage Batching**: Batch writes to Chrome storage
5. **Alarm Management**: Use Chrome alarms efficiently

---

**Document Version:** 1.0
**Last Updated:** 2025-12-31
**Status:** Technical Specification
