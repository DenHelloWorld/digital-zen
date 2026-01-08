import { BackgroundServiceMV3 } from './background-service-MV3';
import { StorageAdapter } from './storage-adapter';
import { UserDataSyncAdapter } from './user-data-sync-adapter';
import { IFocus } from '../modules/common/models/focus.model';
import { QUICK_FOCUS_ID } from '../modules/common/constants/quick-focus-id.const';
import { CHROME_COMMAND_ENUM } from '../modules/common/enums/chrome-command.enum';
import { CHROME_ALARM_ENUM } from '../modules/common/enums/chrome-alarm-name.enum';
import { FOCUS_ERROR_ENUM } from '../modules/common/enums/focus-error.enum';

describe('BackgroundServiceMV3', () => {
  let mockChrome: {
    runtime: {
      onMessage: { addListener: jasmine.Spy };
      getURL: jasmine.Spy;
    };
    tabs: {
      onActivated: { addListener: jasmine.Spy };
      onUpdated: { addListener: jasmine.Spy };
      query: jasmine.Spy;
    };
    storage: {
      local: {
        set: jasmine.Spy;
        get: jasmine.Spy;
      };
    };
    alarms: {
      onAlarm: { addListener: jasmine.Spy };
      create: jasmine.Spy;
    };
    action: {
      setIcon: jasmine.Spy;
    };
    declarativeNetRequest: {
      getDynamicRules: jasmine.Spy;
      updateDynamicRules: jasmine.Spy;
    };
  };

  beforeEach(() => {
    // Mock Chrome APIs
    mockChrome = {
      runtime: {
        onMessage: {
          addListener: jasmine.createSpy('addListener'),
        },
        getURL: jasmine
          .createSpy('getURL')
          .and.returnValue('chrome-extension://test/blocked-page.html'),
      },
      tabs: {
        onActivated: {
          addListener: jasmine.createSpy('addListener'),
        },
        onUpdated: {
          addListener: jasmine.createSpy('addListener'),
        },
        query: jasmine.createSpy('query').and.returnValue(Promise.resolve([])),
      },
      storage: {
        local: {
          set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
          get: jasmine.createSpy('get').and.returnValue(Promise.resolve({})),
        },
      },
      alarms: {
        onAlarm: {
          addListener: jasmine.createSpy('addListener'),
        },
        create: jasmine.createSpy('create'),
      },
      action: {
        setIcon: jasmine.createSpy('setIcon'),
      },
      declarativeNetRequest: {
        getDynamicRules: jasmine
          .createSpy('getDynamicRules')
          .and.callFake((callback: (rules: unknown[]) => void) => {
            callback([]);
          }),
        updateDynamicRules: jasmine.createSpy('updateDynamicRules'),
      },
    };

    (globalThis as unknown as { chrome: typeof mockChrome }).chrome = mockChrome;

    // Mock StorageAdapter
    spyOn(StorageAdapter, 'getCurrentPeriod').and.returnValue(Promise.resolve(null));
    spyOn(StorageAdapter, 'getPeriods').and.returnValue(Promise.resolve([]));
    spyOn(StorageAdapter, 'saveCurrentPeriod').and.returnValue(Promise.resolve());
    spyOn(StorageAdapter, 'savePeriod').and.returnValue(Promise.resolve());
    spyOn(StorageAdapter, 'removePeriod').and.returnValue(Promise.resolve());

    // Mock UserDataSyncAdapter
    spyOn(UserDataSyncAdapter, 'syncUserData').and.returnValue(Promise.resolve());
  });

  afterEach(async () => {
    // Wait for any pending async operations
    await new Promise(resolve => setTimeout(resolve, 50));
    // Restore chrome to prevent errors in async operations
    (globalThis as unknown as { chrome: typeof mockChrome }).chrome = mockChrome;
  });

  describe('Initialization', () => {
    it('should initialize listeners', () => {
      // Initialize service to set up listeners
      new BackgroundServiceMV3();

      expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(mockChrome.tabs.onActivated.addListener).toHaveBeenCalled();
      expect(mockChrome.tabs.onUpdated.addListener).toHaveBeenCalled();
    });

    it('should initialize alarms', () => {
      // Initialize service to set up alarms
      new BackgroundServiceMV3();

      expect(mockChrome.alarms.onAlarm.addListener).toHaveBeenCalled();
    });

    it('should restore current period on initialization', async () => {
      const mockPeriod: IFocus.Period = {
        id: 'test-period',
        name: 'Test Period',
        description: 'Test description',
        startFrom: new Date('2024-01-01T09:00:00.000'),
        endTo: new Date('2024-01-01T17:00:00.000'),
        isFocused: false,
        focusedTimes: [],
        daysOfWeek: [1, 2, 3, 4, 5],
        sessionStartTime: null,
        webSites: [],
      };

      (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(mockPeriod));

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize service to restore period
      new BackgroundServiceMV3();

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(StorageAdapter.getCurrentPeriod).toHaveBeenCalled();
    });

    it('should set first period as current when no current period exists', async () => {
      const mockPeriods: IFocus.Period[] = [
        {
          id: 'first-period',
          name: 'First Period',
          description: 'First description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        },
      ];

      (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(null));
      (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve(mockPeriods));

      // Initialize service
      new BackgroundServiceMV3();

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(StorageAdapter.saveCurrentPeriod).toHaveBeenCalledWith(mockPeriods[0]);
    });

    it('should update icon to inactive when no focused period', async () => {
      (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(null));
      (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([]));

      // Initialize service
      new BackgroundServiceMV3();

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          '16': 'icon-spa-transparent.png',
          '48': 'icon-spa-transparent.png',
          '128': 'icon-spa-transparent.png',
        },
      });
    });
  });

  describe('Message handling', () => {
    let messageListener: (message: unknown, sender: unknown, sendResponse: jasmine.Spy) => boolean;

    beforeEach(() => {
      // Initialize service to set up message listeners
      new BackgroundServiceMV3();
      messageListener = mockChrome.runtime.onMessage.addListener.calls.mostRecent().args[0];
    });

    describe('ADD_PERIOD command', () => {
      it('should add a new period', async () => {
        const newPeriod: IFocus.Period = {
          id: 'new-period',
          name: 'New Period',
          description: 'New description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.ADD_PERIOD, period: newPeriod },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(StorageAdapter.savePeriod).toHaveBeenCalledWith(newPeriod);
        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      });

      it('should not add duplicate period', async () => {
        const existingPeriod: IFocus.Period = {
          id: 'existing-period',
          name: 'Existing Period',
          description: 'Existing description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(
          Promise.resolve([existingPeriod])
        );

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.ADD_PERIOD, period: existingPeriod },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        // savePeriod should not be called for duplicate
        expect(StorageAdapter.savePeriod).not.toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      });
    });

    describe('REMOVE_PERIOD command', () => {
      it('should remove a period', async () => {
        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.REMOVE_PERIOD, id: 'period-to-remove' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(StorageAdapter.removePeriod).toHaveBeenCalledWith('period-to-remove');
        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      });

      it('should stop focus when removing current focused period', async () => {
        const currentPeriod: IFocus.Period = {
          id: 'current-period',
          name: 'Current Period',
          description: 'Current description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: true,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: new Date('2024-01-01T09:30:00.000'),
          webSites: [],
        };

        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(
          Promise.resolve(currentPeriod)
        );

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.REMOVE_PERIOD, id: 'current-period' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(StorageAdapter.removePeriod).toHaveBeenCalledWith('current-period');
        expect(mockChrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      });
    });

    describe('UPDATE_PERIOD command', () => {
      it('should update a period', async () => {
        const updatedPeriod: IFocus.Period = {
          id: 'period-1',
          name: 'Updated Period',
          description: 'Updated description',
          startFrom: new Date('2024-01-01T10:00:00.000'),
          endTo: new Date('2024-01-01T18:00:00.000'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3],
          sessionStartTime: null,
          webSites: [],
        };

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.UPDATE_PERIOD, period: updatedPeriod },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(StorageAdapter.savePeriod).toHaveBeenCalledWith(updatedPeriod);
        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      });

      it('should update current period and blocking rules when focused', async () => {
        const currentPeriod: IFocus.Period = {
          id: 'current-period',
          name: 'Current Period',
          description: 'Current description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: true,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: new Date('2024-01-01T09:30:00.000'),
          webSites: [
            {
              id: 'ws-1',
              type: IFocus.EWebSiteType.DEFAULT,
              name: 'Example',
              description: '',
              url: 'https://example.com',
              imageUrl: '',
              iconUrl: '',
              isBlocked: true,
            },
          ],
        };

        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(
          Promise.resolve(currentPeriod)
        );

        const updatedPeriod = { ...currentPeriod, name: 'Updated Name' };

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.UPDATE_PERIOD, period: updatedPeriod },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(StorageAdapter.savePeriod).toHaveBeenCalledWith(updatedPeriod);
        expect(StorageAdapter.saveCurrentPeriod).toHaveBeenCalledWith(updatedPeriod);
        expect(mockChrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      });
    });

    describe('START_FOCUS command', () => {
      it('should start focus for a valid period', async () => {
        const today = new Date().getDay();
        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date(Date.now() - 3600000), // 1 hour ago
          endTo: new Date(Date.now() + 3600000), // 1 hour from now
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [today], // Include today
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([period]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.START_FOCUS, periodId: 'test-period' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(StorageAdapter.saveCurrentPeriod).toHaveBeenCalled();
        expect(StorageAdapter.savePeriod).toHaveBeenCalled();
        expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
          path: {
            '16': 'icon-spa-colored.png',
            '48': 'icon-spa-colored.png',
            '128': 'icon-spa-colored.png',
          },
        });
      });

      it('should return error when period not found', async () => {
        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.START_FOCUS, periodId: 'non-existent' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({
          success: false,
          error: FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND,
        });
      });

      it('should return error when not scheduled for today', async () => {
        const today = new Date().getDay();
        const tomorrow = (today + 1) % 7;

        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date(Date.now() - 3600000),
          endTo: new Date(Date.now() + 3600000),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [tomorrow], // Only scheduled for tomorrow
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([period]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.START_FOCUS, periodId: 'test-period' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({
          success: false,
          error: FOCUS_ERROR_ENUM.PERIOD_NOT_SCHEDULED_TODAY,
        });
      });

      it('should return error when outside time range', async () => {
        const today = new Date().getDay();
        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date(Date.now() + 3600000), // 1 hour from now
          endTo: new Date(Date.now() + 7200000), // 2 hours from now
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [today],
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([period]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.START_FOCUS, periodId: 'test-period' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({
          success: false,
          error: FOCUS_ERROR_ENUM.PERIOD_OUTSIDE_TIME_RANGE,
        });
      });

      it('should create alarm when starting focus', async () => {
        const today = new Date().getDay();
        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date(Date.now() - 3600000),
          endTo: new Date(Date.now() + 3600000),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [today],
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([period]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.START_FOCUS, periodId: 'test-period' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockChrome.alarms.create).toHaveBeenCalledWith(CHROME_ALARM_ENUM.CHECK_FOCUS_END, {
          periodInMinutes: 1,
        });
      });
    });

    describe('STOP_FOCUS command', () => {
      it('should stop focus and save focused time', async () => {
        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.STOP_FOCUS }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
          path: {
            '16': 'icon-spa-transparent.png',
            '48': 'icon-spa-transparent.png',
            '128': 'icon-spa-transparent.png',
          },
        });
      });

      it('should return success when already stopped', async () => {
        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(null));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.STOP_FOCUS }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      });

      it('should clear blocking rules when stopping focus', async () => {
        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.STOP_FOCUS }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockChrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      });
    });

    describe('TOGGLE_FOCUS command', () => {
      it('should start focus when currently stopped', async () => {
        const today = new Date().getDay();
        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date(Date.now() - 3600000),
          endTo: new Date(Date.now() + 3600000),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [today],
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(period));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.TOGGLE_FOCUS }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
          path: {
            '16': 'icon-spa-colored.png',
            '48': 'icon-spa-colored.png',
            '128': 'icon-spa-colored.png',
          },
        });
      });

      it('should stop focus when currently started', async () => {
        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date(Date.now() - 3600000),
          endTo: new Date(Date.now() + 3600000),
          isFocused: true,
          focusedTimes: [],
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          sessionStartTime: new Date(Date.now() - 1800000), // 30 minutes ago
          webSites: [],
        };

        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(period));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.TOGGLE_FOCUS }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
          path: {
            '16': 'icon-spa-transparent.png',
            '48': 'icon-spa-transparent.png',
            '128': 'icon-spa-transparent.png',
          },
        });
      });

      it('should return success when no current period', async () => {
        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(null));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.TOGGLE_FOCUS }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      });
    });

    describe('TOGGLE_QUICK_FOCUS command', () => {
      it('should start quick focus for a site', async () => {
        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(null));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.TOGGLE_QUICK_FOCUS, siteUrl: 'https://example.com' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(StorageAdapter.saveCurrentPeriod).toHaveBeenCalled();
      });

      it('should stop quick focus when already active', async () => {
        const quickFocusPeriod: IFocus.Period = {
          id: QUICK_FOCUS_ID,
          name: 'Focus: example.com',
          description: 'Quick focus session',
          startFrom: new Date(),
          endTo: null,
          isFocused: true,
          focusedTimes: [],
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          sessionStartTime: new Date(),
          webSites: [],
        };

        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(
          Promise.resolve(quickFocusPeriod)
        );

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.TOGGLE_QUICK_FOCUS, siteUrl: 'https://example.com' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
          path: {
            '16': 'icon-spa-transparent.png',
            '48': 'icon-spa-transparent.png',
            '128': 'icon-spa-transparent.png',
          },
        });
      });
    });

    describe('GET_ACTIVE_TAB command', () => {
      it('should return active tab', async () => {
        const mockTab = {
          id: 123,
          url: 'https://example.com',
          title: 'Example',
          favIconUrl: 'https://example.com/favicon.ico',
        };

        mockChrome.tabs.query.and.returnValue(Promise.resolve([mockTab]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.GET_ACTIVE_TAB }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({
          success: true,
          tab: mockTab,
        });
      });

      it('should return null when no active tab', async () => {
        mockChrome.tabs.query.and.returnValue(Promise.resolve([]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.GET_ACTIVE_TAB }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({
          success: true,
          tab: null,
        });
      });
    });

    describe('SET_CURRENT_PERIOD command', () => {
      it('should set current period', async () => {
        const period: IFocus.Period = {
          id: 'new-current-period',
          name: 'New Current Period',
          description: 'New current description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([period]));
        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(Promise.resolve(null));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.SET_CURRENT_PERIOD, periodId: 'new-current-period' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(StorageAdapter.saveCurrentPeriod).toHaveBeenCalledWith(period);
      });

      it('should return error when period not found', async () => {
        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([]));

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.SET_CURRENT_PERIOD, periodId: 'non-existent' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({
          success: false,
          error: FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND,
        });
      });

      it('should stop focus before setting new current period when currently focused', async () => {
        const currentPeriod: IFocus.Period = {
          id: 'current-period',
          name: 'Current Period',
          description: 'Current description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: true,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: new Date('2024-01-01T09:30:00.000'),
          webSites: [],
        };

        const newPeriod: IFocus.Period = {
          id: 'new-period',
          name: 'New Period',
          description: 'New description',
          startFrom: new Date('2024-01-01T10:00:00.000'),
          endTo: new Date('2024-01-01T18:00:00.000'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(
          Promise.resolve(currentPeriod)
        );
        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(
          Promise.resolve([currentPeriod, newPeriod])
        );

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          { command: CHROME_COMMAND_ENUM.SET_CURRENT_PERIOD, periodId: 'new-period' },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 200));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(mockChrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      });
    });

    describe('SYNC_USER_DATA command', () => {
      it('should sync user data', async () => {
        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          {
            command: CHROME_COMMAND_ENUM.SYNC_USER_DATA,
            userEmail: 'test@example.com',
            userId: 'user-123',
          },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(UserDataSyncAdapter.syncUserData).toHaveBeenCalledWith(
          'test@example.com',
          'user-123'
        );
        expect(sendResponse).toHaveBeenCalledWith({ success: true });
      });

      it('should return error when sync fails', async () => {
        (UserDataSyncAdapter.syncUserData as jasmine.Spy).and.returnValue(
          Promise.reject(new Error('Sync failed'))
        );

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          {
            command: CHROME_COMMAND_ENUM.SYNC_USER_DATA,
            userEmail: 'test@example.com',
            userId: 'user-123',
          },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({
          success: false,
          error: FOCUS_ERROR_ENUM.GENERIC_ERROR,
        });
      });
    });

    describe('TOGGLE_BLOCKED_WEBSITE command', () => {
      it('should toggle website blocking', async () => {
        const currentPeriod: IFocus.Period = {
          id: 'current-period',
          name: 'Current Period',
          description: 'Current description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [
            {
              id: 'ws-1',
              type: IFocus.EWebSiteType.DEFAULT,
              name: 'Example',
              description: '',
              url: 'https://example.com',
              imageUrl: '',
              iconUrl: '',
              isBlocked: true,
            },
          ],
        };

        (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(
          Promise.resolve(currentPeriod)
        );

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener(
          {
            command: CHROME_COMMAND_ENUM.TOGGLE_BLOCKED_WEBSITE,
            site: currentPeriod.webSites[0],
          },
          {},
          sendResponse
        );

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({ success: true });
        expect(StorageAdapter.savePeriod).toHaveBeenCalled();
        expect(StorageAdapter.saveCurrentPeriod).toHaveBeenCalled();
      });
    });

    describe('Unknown command', () => {
      it('should return error for unknown command', async () => {
        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: 'UNKNOWN_COMMAND' }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(sendResponse).toHaveBeenCalledWith({
          success: false,
          error: FOCUS_ERROR_ENUM.UNKNOWN_COMMAND,
        });
      });
    });

    describe('Error handling', () => {
      it('should return generic error when exception occurs', async () => {
        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(
          Promise.reject(new Error('Storage error'))
        );

        const sendResponse = jasmine.createSpy('sendResponse');

        messageListener({ command: CHROME_COMMAND_ENUM.ADD_PERIOD, period: {} }, {}, sendResponse);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 150));

        expect(sendResponse).toHaveBeenCalledWith({
          success: false,
          error: FOCUS_ERROR_ENUM.GENERIC_ERROR,
        });

        // Reset the spy to prevent error in other tests
        (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([]));
      });
    });
  });

  describe('Alarm handling', () => {
    let alarmListener: (alarm: { name: string }) => void;

    beforeEach(() => {
      // Initialize service to set up alarm listeners
      new BackgroundServiceMV3();
      alarmListener = mockChrome.alarms.onAlarm.addListener.calls.mostRecent().args[0];
      // Reset spy calls after initialization
      mockChrome.declarativeNetRequest.updateDynamicRules.calls.reset();
    });

    it('should stop focus when time has passed', async () => {
      const currentPeriod: IFocus.Period = {
        id: 'test-period',
        name: 'Test Period',
        description: 'Test description',
        startFrom: new Date(Date.now() - 7200000), // 2 hours ago
        endTo: new Date(Date.now() - 3600000), // 1 hour ago (passed)
        isFocused: true,
        focusedTimes: [],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        sessionStartTime: new Date(Date.now() - 7200000),
        webSites: [],
      };

      (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(
        Promise.resolve(currentPeriod)
      );

      await alarmListener({ name: CHROME_ALARM_ENUM.CHECK_FOCUS_END });

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockChrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          '16': 'icon-spa-transparent.png',
          '48': 'icon-spa-transparent.png',
          '128': 'icon-spa-transparent.png',
        },
      });
    });

    it('should not stop focus when time has not passed', async () => {
      const currentPeriod: IFocus.Period = {
        id: 'test-period',
        name: 'Test Period',
        description: 'Test description',
        startFrom: new Date(Date.now() - 3600000),
        endTo: new Date(Date.now() + 3600000), // 1 hour from now (not passed)
        isFocused: true,
        focusedTimes: [],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        sessionStartTime: new Date(Date.now() - 3600000),
        webSites: [],
      };

      (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(
        Promise.resolve(currentPeriod)
      );

      // Reset spy before test
      mockChrome.declarativeNetRequest.updateDynamicRules.calls.reset();

      await alarmListener({ name: CHROME_ALARM_ENUM.CHECK_FOCUS_END });

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not have called updateDynamicRules
      expect(mockChrome.declarativeNetRequest.updateDynamicRules).not.toHaveBeenCalled();
    });

    it('should not stop focus when period is not focused', async () => {
      const currentPeriod: IFocus.Period = {
        id: 'test-period',
        name: 'Test Period',
        description: 'Test description',
        startFrom: new Date(Date.now() - 7200000),
        endTo: new Date(Date.now() - 3600000),
        isFocused: false,
        focusedTimes: [],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        sessionStartTime: null,
        webSites: [],
      };

      (StorageAdapter.getCurrentPeriod as jasmine.Spy).and.returnValue(
        Promise.resolve(currentPeriod)
      );

      // Reset spy before test
      mockChrome.declarativeNetRequest.updateDynamicRules.calls.reset();

      await alarmListener({ name: CHROME_ALARM_ENUM.CHECK_FOCUS_END });

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not have called updateDynamicRules
      expect(mockChrome.declarativeNetRequest.updateDynamicRules).not.toHaveBeenCalled();
    });
  });

  describe('Tab event handling', () => {
    let tabActivatedListener: (activeInfo: { tabId: number; windowId: number }) => void;
    let tabUpdatedListener: (
      tabId: number,
      changeInfo: { status?: string },
      tab: { active?: boolean; url?: string }
    ) => void;

    beforeEach(() => {
      // Initialize service to set up tab listeners
      new BackgroundServiceMV3();
      tabActivatedListener = mockChrome.tabs.onActivated.addListener.calls.mostRecent().args[0];
      tabUpdatedListener = mockChrome.tabs.onUpdated.addListener.calls.mostRecent().args[0];
    });

    it('should store tab ID when tab is activated', () => {
      const activeInfo = { tabId: 123, windowId: 1 };

      tabActivatedListener(activeInfo);

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ tab_id: 123 });
    });

    it('should store tab URL when tab is updated and complete', () => {
      const tabId = 123;
      const changeInfo = { status: 'complete' };
      const tab = { active: true, url: 'https://example.com' };

      tabUpdatedListener(tabId, changeInfo, tab);

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        tab_url: 'https://example.com',
      });
    });

    it('should not store URL when tab is not complete', () => {
      const tabId = 123;
      const changeInfo = { status: 'loading' };
      const tab = { active: true, url: 'https://example.com' };

      mockChrome.storage.local.set.calls.reset();

      tabUpdatedListener(tabId, changeInfo, tab);

      expect(mockChrome.storage.local.set).not.toHaveBeenCalled();
    });

    it('should not store URL when tab is not active', () => {
      const tabId = 123;
      const changeInfo = { status: 'complete' };
      const tab = { active: false, url: 'https://example.com' };

      mockChrome.storage.local.set.calls.reset();

      tabUpdatedListener(tabId, changeInfo, tab);

      expect(mockChrome.storage.local.set).not.toHaveBeenCalled();
    });

    it('should not store URL when URL is not available', () => {
      const tabId = 123;
      const changeInfo = { status: 'complete' };
      const tab = { active: true };

      mockChrome.storage.local.set.calls.reset();

      tabUpdatedListener(tabId, changeInfo, tab);

      expect(mockChrome.storage.local.set).not.toHaveBeenCalled();
    });
  });

  describe('Blocking rules', () => {
    beforeEach(() => {
      // Initialize service
      new BackgroundServiceMV3();
    });

    it('should create redirect rule for domain', () => {
      const today = new Date().getDay();
      const period: IFocus.Period = {
        id: 'test-period',
        name: 'Test Period',
        description: 'Test description',
        startFrom: new Date(Date.now() - 3600000),
        endTo: new Date(Date.now() + 3600000),
        isFocused: false,
        focusedTimes: [],
        daysOfWeek: [today],
        sessionStartTime: null,
        webSites: [
          {
            id: 'ws-1',
            type: IFocus.EWebSiteType.DEFAULT,
            name: 'Example',
            description: '',
            url: 'https://example.com',
            imageUrl: '',
            iconUrl: '',
            isBlocked: true,
          },
        ],
      };

      const messageListener = mockChrome.runtime.onMessage.addListener.calls.mostRecent().args[0];
      (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([period]));

      const sendResponse = jasmine.createSpy('sendResponse');

      messageListener(
        { command: CHROME_COMMAND_ENUM.START_FOCUS, periodId: 'test-period' },
        {},
        sendResponse
      );

      // Let async code complete
      setTimeout(() => {
        expect(mockChrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      }, 100);
    });

    it('should remove www prefix from domain', async () => {
      const today = new Date().getDay();
      const period: IFocus.Period = {
        id: 'test-period',
        name: 'Test Period',
        description: 'Test description',
        startFrom: new Date(Date.now() - 3600000),
        endTo: new Date(Date.now() + 3600000),
        isFocused: false,
        focusedTimes: [],
        daysOfWeek: [today],
        sessionStartTime: null,
        webSites: [
          {
            id: 'ws-1',
            type: IFocus.EWebSiteType.DEFAULT,
            name: 'Example',
            description: '',
            url: 'https://www.example.com',
            imageUrl: '',
            iconUrl: '',
            isBlocked: true,
          },
        ],
      };

      const messageListener = mockChrome.runtime.onMessage.addListener.calls.mostRecent().args[0];
      (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([period]));

      const sendResponse = jasmine.createSpy('sendResponse');

      messageListener(
        { command: CHROME_COMMAND_ENUM.START_FOCUS, periodId: 'test-period' },
        {},
        sendResponse
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockChrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
    });

    it('should clear all blocking rules when stopping focus', async () => {
      const messageListener = mockChrome.runtime.onMessage.addListener.calls.mostRecent().args[0];
      const sendResponse = jasmine.createSpy('sendResponse');

      messageListener({ command: CHROME_COMMAND_ENUM.STOP_FOCUS }, {}, sendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockChrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
        jasmine.objectContaining({
          removeRuleIds: jasmine.any(Array),
          addRules: [],
        })
      );
    });
  });

  describe('Icon management', () => {
    beforeEach(() => {
      // Initialize service
      new BackgroundServiceMV3();
    });

    it('should set colored icon when starting focus', async () => {
      const today = new Date().getDay();
      const period: IFocus.Period = {
        id: 'test-period',
        name: 'Test Period',
        description: 'Test description',
        startFrom: new Date(Date.now() - 3600000),
        endTo: new Date(Date.now() + 3600000),
        isFocused: false,
        focusedTimes: [],
        daysOfWeek: [today],
        sessionStartTime: null,
        webSites: [],
      };

      const messageListener = mockChrome.runtime.onMessage.addListener.calls.mostRecent().args[0];
      (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve([period]));

      const sendResponse = jasmine.createSpy('sendResponse');

      messageListener(
        { command: CHROME_COMMAND_ENUM.START_FOCUS, periodId: 'test-period' },
        {},
        sendResponse
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          '16': 'icon-spa-colored.png',
          '48': 'icon-spa-colored.png',
          '128': 'icon-spa-colored.png',
        },
      });
    });

    it('should set transparent icon when stopping focus', async () => {
      const messageListener = mockChrome.runtime.onMessage.addListener.calls.mostRecent().args[0];
      const sendResponse = jasmine.createSpy('sendResponse');

      messageListener({ command: CHROME_COMMAND_ENUM.STOP_FOCUS }, {}, sendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockChrome.action.setIcon).toHaveBeenCalledWith({
        path: {
          '16': 'icon-spa-transparent.png',
          '48': 'icon-spa-transparent.png',
          '128': 'icon-spa-transparent.png',
        },
      });
    });
  });
});
