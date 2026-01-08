import { StorageAdapter } from './storage-adapter';
import { IFocus } from '../modules/common/models/focus.model';
import { CHROME_STORAGE_KEY_ENUM } from '../modules/common/enums/chrome-storage-key.enum';

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
      it('should save a new period to storage', async () => {
        const period: IFocus.Period = {
          id: 'test-period-1',
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

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.savePeriod(period);

        expect(mockChromeStorage.local.get).toHaveBeenCalledWith(CHROME_STORAGE_KEY_ENUM.PERIODS);
        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: [
            {
              ...period,
              startFrom: '2024-01-01T09:00:00.000Z',
              endTo: '2024-01-01T17:00:00.000Z',
              sessionStartTime: null,
              focusedTimes: [],
            },
          ],
        });
      });

      it('should update an existing period', async () => {
        const existingPeriod = {
          id: 'test-period-1',
          name: 'Old Name',
          description: 'Old description',
          startFrom: '2024-01-01T09:00:00.000Z',
          endTo: '2024-01-01T17:00:00.000Z',
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        const updatedPeriod: IFocus.Period = {
          id: 'test-period-1',
          name: 'New Name',
          description: 'New description',
          startFrom: new Date('2024-01-01T10:00:00.000'),
          endTo: new Date('2024-01-01T18:00:00.000'),
          isFocused: true,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3],
          sessionStartTime: new Date('2024-01-01T10:00:00.000'),
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [existingPeriod] })
        );

        await StorageAdapter.savePeriod(updatedPeriod);

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: [
            {
              ...updatedPeriod,
              startFrom: '2024-01-01T10:00:00.000Z',
              endTo: '2024-01-01T18:00:00.000Z',
              sessionStartTime: '2024-01-01T10:00:00.000Z',
              focusedTimes: [],
            },
          ],
        });
      });

      it('should handle period with focusedTimes', async () => {
        const period: IFocus.Period = {
          id: 'test-period-1',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: false,
          focusedTimes: [
            {
              id: 'ft-1',
              periodId: 'test-period-1',
              startFrom: new Date('2024-01-01T09:00:00.000'),
              endTo: new Date('2024-01-01T10:00:00.000'),
            },
            {
              id: 'ft-2',
              periodId: 'test-period-1',
              startFrom: new Date('2024-01-01T14:00:00.000'),
              endTo: new Date('2024-01-01T15:00:00.000'),
            },
          ],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.savePeriod(period);

        const savedPeriod = mockChromeStorage.local.set.calls.mostRecent().args[0].periods[0];
        expect(savedPeriod.focusedTimes).toEqual([
          {
            id: 'ft-1',
            periodId: 'test-period-1',
            startFrom: '2024-01-01T09:00:00.000Z',
            endTo: '2024-01-01T10:00:00.000Z',
          },
          {
            id: 'ft-2',
            periodId: 'test-period-1',
            startFrom: '2024-01-01T14:00:00.000Z',
            endTo: '2024-01-01T15:00:00.000Z',
          },
        ]);
      });

      it('should add new period to existing periods', async () => {
        const existingPeriod = {
          id: 'existing-period',
          name: 'Existing',
          description: 'Existing description',
          startFrom: '2024-01-01T09:00:00.000Z',
          endTo: '2024-01-01T17:00:00.000Z',
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        const newPeriod: IFocus.Period = {
          id: 'new-period',
          name: 'New Period',
          description: 'New description',
          startFrom: new Date('2024-01-02T09:00:00.000'),
          endTo: new Date('2024-01-02T17:00:00.000'),
          isFocused: false,
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
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: null,
          endTo: null,
          isFocused: false,
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

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.savePeriod(period);

        const savedPeriod = mockChromeStorage.local.set.calls.mostRecent().args[0].periods[0];
        expect(savedPeriod.focusedTimes).toEqual([]);
      });

      it('should handle when periods key does not exist in storage', async () => {
        const period: IFocus.Period = {
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

        mockChromeStorage.local.get.and.returnValue(Promise.resolve({}));

        await StorageAdapter.savePeriod(period);

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          periods: jasmine.any(Array),
        });
      });

      it('should handle invalid Date objects', async () => {
        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date('invalid'),
          endTo: new Date('invalid'),
          isFocused: false,
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
          id: 'period-1',
          name: 'Period 1',
          description: 'Description 1',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        };

        const period2: IFocus.Period = {
          id: 'period-2',
          name: 'Period 2',
          description: 'Description 2',
          startFrom: new Date('2024-01-02T09:00:00.000'),
          endTo: new Date('2024-01-02T17:00:00.000'),
          isFocused: false,
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
      it('should save current period to storage', async () => {
        const period: IFocus.Period = {
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

        await StorageAdapter.saveCurrentPeriod(period);

        expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
          currentPeriod: {
            ...period,
            startFrom: '2024-01-01T09:00:00.000Z',
            endTo: '2024-01-01T17:00:00.000Z',
            sessionStartTime: '2024-01-01T09:30:00.000Z',
            focusedTimes: [],
          },
        });
      });

      it('should handle null sessionStartTime', async () => {
        const period: IFocus.Period = {
          id: 'current-period',
          name: 'Current Period',
          description: 'Current description',
          startFrom: new Date('2024-01-01T09:00:00.000'),
          endTo: new Date('2024-01-01T17:00:00.000'),
          isFocused: false,
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
    describe('Valid inputs', () => {
      it('should retrieve and convert periods from storage', async () => {
        const storedPeriods = [
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
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: storedPeriods })
        );

        const periods = await StorageAdapter.getPeriods();

        expect(periods.length).toBe(1);
        expect(periods[0].id).toBe('period-1');
        expect(periods[0].startFrom).toEqual(new Date('2024-01-01T09:00:00.000Z'));
        expect(periods[0].endTo).toEqual(new Date('2024-01-01T17:00:00.000Z'));
        expect(periods[0].sessionStartTime).toBeNull();
      });

      it('should convert focusedTimes dates', async () => {
        const storedPeriods = [
          {
            id: 'period-1',
            name: 'Period 1',
            description: 'Description 1',
            startFrom: '2024-01-01T09:00:00.000Z',
            endTo: '2024-01-01T17:00:00.000Z',
            isFocused: false,
            focusedTimes: [
              {
                id: 'ft-1',
                periodId: 'period-1',
                startFrom: '2024-01-01T09:00:00.000Z',
                endTo: '2024-01-01T10:00:00.000Z',
              },
            ],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: storedPeriods })
        );

        const periods = await StorageAdapter.getPeriods();

        expect(periods[0].focusedTimes[0].startFrom).toEqual(new Date('2024-01-01T09:00:00.000Z'));
        expect(periods[0].focusedTimes[0].endTo).toEqual(new Date('2024-01-01T10:00:00.000Z'));
      });
    });

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
    describe('Valid inputs', () => {
      it('should retrieve and convert current period from storage', async () => {
        const storedPeriod = {
          id: 'current-period',
          name: 'Current Period',
          description: 'Current description',
          startFrom: '2024-01-01T09:00:00.000Z',
          endTo: '2024-01-01T17:00:00.000Z',
          isFocused: true,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: '2024-01-01T09:30:00.000Z',
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: storedPeriod })
        );

        const period = await StorageAdapter.getCurrentPeriod();

        expect(period).not.toBeNull();
        expect(period!.id).toBe('current-period');
        expect(period!.startFrom).toEqual(new Date('2024-01-01T09:00:00.000Z'));
        expect(period!.endTo).toEqual(new Date('2024-01-01T17:00:00.000Z'));
        expect(period!.sessionStartTime).toEqual(new Date('2024-01-01T09:30:00.000Z'));
      });
    });

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
    describe('toStorageFormat', () => {
      it('should convert Date objects to ISO strings', async () => {
        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: new Date('2024-01-01T09:00:00.000Z'),
          endTo: new Date('2024-01-01T17:00:00.000Z'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: new Date('2024-01-01T09:30:00.000Z'),
          webSites: [],
        };

        mockChromeStorage.local.get.and.returnValue(
          Promise.resolve({ [CHROME_STORAGE_KEY_ENUM.PERIODS]: [] })
        );

        await StorageAdapter.savePeriod(period);

        const savedPeriod = mockChromeStorage.local.set.calls.mostRecent().args[0].periods[0];
        expect(savedPeriod.startFrom).toBe('2024-01-01T09:00:00.000Z');
        expect(savedPeriod.endTo).toBe('2024-01-01T17:00:00.000Z');
        expect(savedPeriod.sessionStartTime).toBe('2024-01-01T09:30:00.000Z');
      });

      it('should handle string dates as strings', async () => {
        const period: IFocus.Period = {
          id: 'test-period',
          name: 'Test Period',
          description: 'Test description',
          startFrom: '2024-01-01T09:00:00.000Z' as unknown as Date,
          endTo: '2024-01-01T17:00:00.000Z' as unknown as Date,
          isFocused: false,
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
        expect(savedPeriod.startFrom).toBe('2024-01-01T09:00:00.000Z');
        expect(savedPeriod.endTo).toBe('2024-01-01T17:00:00.000Z');
      });
    });

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
