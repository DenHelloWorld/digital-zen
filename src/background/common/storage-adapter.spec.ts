import { BLOCK_BEHAVIOUR_ENUM } from '../../modules/common/enums/block-behaviour.enum';
import { CHROME_STORAGE_KEY_ENUM } from '../../modules/common/enums/chrome-storage-key.enum';
import { IFocus } from '../../modules/common/models/focus.model';
import { StorageAdapter } from './storage-adapter';

describe('StorageAdapter', () => {
  let mockChromeStorage: {
    local: {
      get: jasmine.Spy;
      set: jasmine.Spy;
    };
  };

  beforeEach(() => {
    // Mock chrome.storage.local
    mockChromeStorage = {
      local: {
        get: jasmine.createSpy('get').and.returnValue(Promise.resolve({})),
        set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
      },
    };
    (globalThis as unknown as { chrome: { storage: typeof mockChromeStorage } }).chrome = {
      storage: mockChromeStorage,
    };
  });

  afterEach(async () => {
    // Wait for microtasks without setTimeout
    await Promise.resolve();
    await Promise.resolve();
  });

  describe('savePeriod', () => {
    describe('Valid inputs', () => {
      it('should add new period to existing periods', async () => {
        const existingPeriod = {
          id: 'existing-period',
          name: 'Existing',
          description: 'Existing description',
          startFrom: '2024-01-01T09:00:00.000Z',
          endTo: '2024-01-01T17:00:00.000Z',
          isFocused: false,
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        const newPeriod: IFocus.Period = {
          timeLeftSec: null,
          id: 'new-period',
          name: 'New Period',
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          description: 'New description',
          startFrom: new Date('2024-01-02T09:00:00.000Z'),
          endTo: new Date('2024-01-02T17:00:00.000Z'),
          isActive: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [existingPeriod] })
        );

        await StorageAdapter.savePeriod(newPeriod);

        const savedPeriods = mockChromeStorage.local.set.calls.mostRecent().args[0].periods;
        expect(savedPeriods.length).toBe(2);
        expect(savedPeriods[0].id).toBe('existing-period');
        expect(savedPeriods[1].id).toBe('new-period');
      });
    });

    describe('Edge cases', () => {
      it('should handle null dates', async () => {
        const period: IFocus.Period = {
          timeLeftSec: null,
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          startFrom: null,
          endTo: null,
          isActive: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.savePeriod(period);

        const savedPeriod = mockChromeStorage.local.set.calls.mostRecent().args[0].periods[0];
        expect(savedPeriod.startFrom).toBeNull();
        expect(savedPeriod.endTo).toBeNull();
        expect(savedPeriod.sessionStartTime).toBeNull();
      });

      it('should handle empty focusedTimes array', async () => {
        const period: IFocus.Period = {
          timeLeftSec: null,
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date('2024-01-01T09:00:00.000Z'),
          endTo: new Date('2024-01-01T17:00:00.000Z'),
          isActive: false,
          focusedTimes: [],
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.savePeriod(period);

        const savedPeriod = mockChromeStorage.local.set.calls.mostRecent().args[0].periods[0];
        expect(savedPeriod.focusedTimes).toEqual([]);
      });

      it('should handle when periods key does not exist in storage', async () => {
        const period: IFocus.Period = {
          timeLeftSec: null,
          id: 'test-period',
          name: 'Test Period',
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          description: 'Test description',
          startFrom: new Date('2024-01-01T09:00:00.000Z'),
          endTo: new Date('2024-01-01T17:00:00.000Z'),
          isActive: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(Promise.resolve({}));

        await StorageAdapter.savePeriod(period);

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: jasmine.any(Array),
        });
      });

      it('should handle invalid Date objects', async () => {
        const period: IFocus.Period = {
          timeLeftSec: null,
          id: 'test-period',
          name: 'Test Period',
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          description: 'Test description',
          startFrom: new Date('invalid'),
          endTo: new Date('invalid'),
          isActive: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.savePeriod(period);

        const savedPeriod = mockChromeStorage.local.set.calls.mostRecent().args[0].periods[0];
        // Invalid dates should be converted to null
        expect(savedPeriod.startFrom).toBeNull();
        expect(savedPeriod.endTo).toBeNull();
      });
    });

    describe('Queue management', () => {
      it('should handle multiple sequential saves', async () => {
        const period1: IFocus.Period = {
          timeLeftSec: null,
          id: 'period-1',
          name: 'Period 1',
          description: 'Description 1',
          startFrom: new Date('2024-01-01T09:00:00.000Z'),
          endTo: new Date('2024-01-01T17:00:00.000Z'),
          isActive: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          sessionStartTime: null,
          webSites: [],
        };

        const period2: IFocus.Period = {
          timeLeftSec: null,
          id: 'period-2',
          name: 'Period 2',
          description: 'Description 2',
          startFrom: new Date('2024-01-02T09:00:00.000Z'),
          endTo: new Date('2024-01-02T17:00:00.000Z'),
          isActive: false,
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.savePeriod(period1);
        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({
            [CHROME_STORAGE_KEY_ENUM.PERIODS]: [
              {
                ...period1,
                startFrom: '2024-01-01T09:00:00.000Z',
                endTo: '2024-01-01T17:00:00.000Z',
                sessionStartTime: null,
                focusedTimes: [],
              },
            ],
          })
        );
        await StorageAdapter.savePeriod(period2);

        expect(mockChromeStorage.local.set).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('saveCurrentPeriod', () => {
    describe('Valid inputs', () => {
      it('should handle null sessionStartTime', async () => {
        const period: IFocus.Period = {
          timeLeftSec: null,
          id: 'current-period',
          name: 'Current Period',
          blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
          description: 'Current description',
          startFrom: new Date('2024-01-01T09:00:00.000Z'),
          endTo: new Date('2024-01-01T17:00:00.000Z'),
          isActive: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        await StorageAdapter.saveCurrentPeriod(period);

        const savedPeriod = mockChromeStorage.local.set.calls.mostRecent().args[0].currentPeriod;
        expect(savedPeriod.sessionStartTime).toBeNull();
      });
    });
  });

  describe('removePeriod', () => {
    describe('Valid inputs', () => {
      it('should remove period from storage', async () => {
        const periods = [
          {
            id: 'period-1',
            name: 'Period 1',
            description: 'Description 1',
            startFrom: '2024-01-01T09:00:00.000Z',
            endTo: '2024-01-01T17:00:00.000Z',
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
          {
            id: 'period-2',
            name: 'Period 2',
            description: 'Description 2',
            startFrom: '2024-01-02T09:00:00.000Z',
            endTo: '2024-01-02T17:00:00.000Z',
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: periods })
        );

        await StorageAdapter.removePeriod('period-1');

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: [periods[1]],
        });
      });

      it('should handle removing the only period', async () => {
        const periods = [
          {
            id: 'only-period',
            name: 'Only Period',
            description: 'Description',
            startFrom: '2024-01-01T09:00:00.000Z',
            endTo: '2024-01-01T17:00:00.000Z',
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: periods })
        );

        await StorageAdapter.removePeriod('only-period');

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: [],
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle removing non-existent period', async () => {
        const periods = [
          {
            id: 'period-1',
            name: 'Period 1',
            description: 'Description 1',
            startFrom: '2024-01-01T09:00:00.000Z',
            endTo: '2024-01-01T17:00:00.000Z',
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: periods })
        );

        await StorageAdapter.removePeriod('non-existent-id');

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: periods,
        });
      });

      it('should handle empty periods array', async () => {
        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.removePeriod('any-id');

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: [],
        });
      });

      it('should handle when periods key does not exist', async () => {
        mockChromeStorage.local.get.and.returnValue(Promise.resolve({}));

        await StorageAdapter.removePeriod('any-id');

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: [],
        });
      });
    });
  });

  describe('getPeriods', () => {
    describe('Edge cases', () => {
      it('should return empty array when no periods exist', async () => {
        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        const periods = await StorageAdapter.getPeriods();

        expect(periods).toEqual([]);
      });

      it('should return empty array when periods key does not exist', async () => {
        mockChromeStorage.local.get.and.returnValue(Promise.resolve({}));

        const periods = await StorageAdapter.getPeriods();

        expect(periods).toEqual([]);
      });

      it('should handle null dates in storage', async () => {
        const storedPeriods = [
          {
            id: 'period-1',
            name: 'Period 1',
            description: 'Description 1',
            startFrom: null,
            endTo: null,
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: storedPeriods })
        );

        const periods = await StorageAdapter.getPeriods();

        expect(periods[0].startFrom).toBeNull();
        expect(periods[0].endTo).toBeNull();
        expect(periods[0].sessionStartTime).toBeNull();
      });

      it('should handle invalid date strings', async () => {
        const storedPeriods = [
          {
            id: 'period-1',
            name: 'Period 1',
            description: 'Description 1',
            startFrom: 'invalid-date',
            endTo: 'invalid-date',
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: storedPeriods })
        );

        const periods = await StorageAdapter.getPeriods();

        // Invalid dates should be converted to null
        expect(periods[0].startFrom).toBeNull();
        expect(periods[0].endTo).toBeNull();
      });
    });
  });

  describe('getCurrentPeriod', () => {
    describe('Edge cases', () => {
      it('should return null when no current period exists', async () => {
        mockChromeStorage.local.get.and.returnValue(Promise.resolve({}));

        const period = await StorageAdapter.getCurrentPeriod();

        expect(period).toBeNull();
      });

      it('should return null when current period is null', async () => {
        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: null })
        );

        const period = await StorageAdapter.getCurrentPeriod();

        expect(period).toBeNull();
      });

      it('should return null when current period is not an object', async () => {
        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: 'not-an-object' })
        );

        const period = await StorageAdapter.getCurrentPeriod();

        expect(period).toBeNull();
      });

      it('should handle null dates in current period', async () => {
        const storedPeriod = {
          id: 'current-period',
          name: 'Current Period',
          description: 'Current description',
          startFrom: null,
          endTo: null,
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: storedPeriod })
        );

        const period = await StorageAdapter.getCurrentPeriod();

        expect(period).not.toBeNull();
        expect(period!.startFrom).toBeNull();
        expect(period!.endTo).toBeNull();
        expect(period!.sessionStartTime).toBeNull();
      });
    });
  });

  describe('Date conversion', () => {
    describe('fromStorageFormat', () => {
      it('should convert ISO strings to Date objects', async () => {
        const storedPeriod = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: '2024-01-01T09:00:00.000Z',
          endTo: '2024-01-01T17:00:00.000Z',
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: '2024-01-01T09:30:00.000Z',
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [storedPeriod] })
        );

        const periods = await StorageAdapter.getPeriods();

        expect(periods[0].startFrom).toBeInstanceOf(Date);
        expect(periods[0].endTo).toBeInstanceOf(Date);
        expect(periods[0].sessionStartTime).toBeInstanceOf(Date);
      });
    });
  });
});
