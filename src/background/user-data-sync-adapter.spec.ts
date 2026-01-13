import { UserDataSyncAdapter } from './user-data-sync-adapter';
import { StorageAdapter } from './storage-adapter';
import { API_CONFIG } from '../modules/common/constants/api-config.const';
import { API_URLS } from '../modules/common/constants/api-urls.const';
import { DEFAULT_PERIOD_ID } from '../modules/common/constants/default-period-id.const';
import { IUserDataSync } from '../modules/common/models/user-data-sync.model';
import { IFocus } from '../modules/common/models/focus.model';

describe('UserDataSyncAdapter', () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchSpy: jasmine.Spy;
  let originalApiKey: string;
  let mockChromeStorage: {
    local: {
      get: jasmine.Spy;
      set: jasmine.Spy;
    };
  };

  beforeEach(() => {
    // Save original fetch and API key
    originalFetch = globalThis.fetch;
    originalApiKey = (API_CONFIG as unknown as { apiKey: string }).apiKey;

    // Set up API key for tests
    (API_CONFIG as unknown as { apiKey: string }).apiKey = 'test-api-key';

    // Create fetch spy
    fetchSpy = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      } as Response)
    );
    globalThis.fetch = fetchSpy;

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

    // Mock StorageAdapter
    spyOn(StorageAdapter, 'savePeriod').and.returnValue(Promise.resolve());
    spyOn(StorageAdapter, 'getPeriods').and.returnValue(Promise.resolve([]));
    spyOn(StorageAdapter, 'replaceAllPeriods').and.returnValue(Promise.resolve());
  });

  afterEach(() => {
    // Restore original fetch and API key
    globalThis.fetch = originalFetch;
    (API_CONFIG as unknown as { apiKey: string }).apiKey = originalApiKey;
  });

  describe('checkApiKey', () => {
    it('should return null when API key is not configured', async () => {
      (API_CONFIG as unknown as { apiKey: string }).apiKey = '';

      const result = await UserDataSyncAdapter.getUserData('test@example.com', 'user-123');

      expect(result).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should not throw error when API key is configured', async () => {
      (API_CONFIG as unknown as { apiKey: string }).apiKey = 'test-api-key';

      fetchSpy.and.returnValue(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                user: { id: 1, email: 'test@example.com', user_id: 'user-123' },
                periods: [],
              },
            }),
        } as Response)
      );

      await expectAsync(
        UserDataSyncAdapter.getUserData('test@example.com', 'user-123')
      ).toBeResolved();
    });
  });

  describe('syncUserData', () => {
    describe('Valid inputs', () => {
      it('should sync user data when user exists', async () => {
        const mockResponse: IUserDataSync.Response = {
          user: {
            id: 1,
            email: 'test@example.com',
            user_id: 'user-123',
          },
          periods: [],
        };

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
          } as Response)
        );

        await UserDataSyncAdapter.syncUserData('test@example.com', 'user-123');

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy.calls.mostRecent().args[0]).toContain(API_URLS.USER);
      });

      it('should create user when user does not exist', async () => {
        const mockGetResponse: IUserDataSync.Response = {
          user: null,
          periods: [],
        };

        fetchSpy.and.returnValues(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockGetResponse }),
          } as Response),
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.syncUserData('test@example.com', 'user-123');

        expect(fetchSpy).toHaveBeenCalledTimes(2);
        // First call is GET to check user existence
        expect(fetchSpy.calls.first().args[1]?.method).toBe('GET');
        // Second call is POST to create user
        expect(fetchSpy.calls.mostRecent().args[1]?.method).toBe('POST');
      });

      it('should sync periods from backend', async () => {
        const mockPeriods: IFocus.Period[] = [
          {
            id: 'period-1',
            name: 'Work Period',
            description: 'Work hours',
            startFrom: new Date('2024-01-01T09:00:00.000Z'),
            endTo: new Date('2024-01-01T17:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
          {
            id: 'period-2',
            name: 'Evening Period',
            description: 'Evening hours',
            startFrom: new Date('2024-01-01T18:00:00.000Z'),
            endTo: new Date('2024-01-01T21:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        const mockResponse: IUserDataSync.Response = {
          user: {
            id: 1,
            email: 'test@example.com',
            user_id: 'user-123',
          },
          periods: mockPeriods,
        };

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
          } as Response)
        );

        await UserDataSyncAdapter.syncUserData('test@example.com', 'user-123');

        expect(StorageAdapter.replaceAllPeriods).toHaveBeenCalledTimes(1);
        expect(StorageAdapter.replaceAllPeriods).toHaveBeenCalledWith(mockPeriods);
      });

      it('should not sync periods when none exist', async () => {
        const mockResponse: IUserDataSync.Response = {
          user: {
            id: 1,
            email: 'test@example.com',
            user_id: 'user-123',
          },
          periods: [],
        };

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
          } as Response)
        );

        await UserDataSyncAdapter.syncUserData('test@example.com', 'user-123');

        expect(StorageAdapter.replaceAllPeriods).not.toHaveBeenCalled();
      });
    });

    describe('Error handling', () => {
      it('should throw error when sync fails', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          } as Response)
        );

        await expectAsync(
          UserDataSyncAdapter.syncUserData('test@example.com', 'user-123')
        ).toBeRejected();
      });

      it('should throw error when network request fails', async () => {
        fetchSpy.and.callFake(() => {
          throw new Error('Network error');
        });

        await expectAsync(
          UserDataSyncAdapter.syncUserData('test@example.com', 'user-123')
        ).toBeRejected();
      });
    });
  });

  describe('getUserData', () => {
    describe('Valid inputs', () => {
      it('should fetch user data with email', async () => {
        const mockResponse: IUserDataSync.Response = {
          user: {
            id: 1,
            email: 'test@example.com',
            user_id: 'user-123',
          },
          periods: [],
        };

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
          } as Response)
        );

        const result = await UserDataSyncAdapter.getUserData('test@example.com', '');

        expect(result).toEqual(mockResponse);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const fetchUrl = fetchSpy.calls.mostRecent().args[0];
        expect(fetchUrl).toContain('user_email');
        expect(fetchUrl).toContain('test%40example.com');
      });

      it('should fetch user data with userId', async () => {
        const mockResponse: IUserDataSync.Response = {
          user: {
            id: 1,
            email: 'test@example.com',
            user_id: 'user-123',
          },
          periods: [],
        };

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
          } as Response)
        );

        const result = await UserDataSyncAdapter.getUserData('', 'user-123');

        expect(result).toEqual(mockResponse);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const fetchUrl = fetchSpy.calls.mostRecent().args[0];
        expect(fetchUrl).toContain('user_id=user-123');
      });

      it('should fetch user data with both email and userId', async () => {
        const mockResponse: IUserDataSync.Response = {
          user: {
            id: 1,
            email: 'test@example.com',
            user_id: 'user-123',
          },
          periods: [],
        };

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
          } as Response)
        );

        const result = await UserDataSyncAdapter.getUserData('test@example.com', 'user-123');

        expect(result).toEqual(mockResponse);
        const fetchUrl = fetchSpy.calls.mostRecent().args[0];
        expect(fetchUrl).toContain('user_email');
        expect(fetchUrl).toContain('test%40example.com');
        expect(fetchUrl).toContain('user_id=user-123');
      });

      it('should include API key in request headers', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { user: null, periods: [] } }),
          } as Response)
        );

        await UserDataSyncAdapter.getUserData('test@example.com', 'user-123');

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        expect(fetchOptions.headers['X-API-Key']).toBe('test-api-key');
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');
      });
    });

    describe('Invalid inputs', () => {
      it('should throw error when neither email nor userId is provided', async () => {
        await expectAsync(UserDataSyncAdapter.getUserData('', '')).toBeRejectedWithError(
          /At least one of userEmail or userId must be provided/
        );
      });
    });

    describe('Error handling', () => {
      it('should throw error when API returns error status', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
          } as Response)
        );

        await expectAsync(
          UserDataSyncAdapter.getUserData('test@example.com', 'user-123')
        ).toBeRejectedWithError(/Failed to get user data: 404 Not Found/);
      });

      it('should throw error when fetch fails', async () => {
        fetchSpy.and.callFake(() => {
          throw new Error('Network error');
        });

        await expectAsync(
          UserDataSyncAdapter.getUserData('test@example.com', 'user-123')
        ).toBeRejected();
      });

      it('should return null when API key is not configured', async () => {
        (API_CONFIG as unknown as { apiKey: string }).apiKey = '';

        const result = await UserDataSyncAdapter.getUserData('test@example.com', 'user-123');

        expect(result).toBeNull();
        expect(fetchSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('createUser', () => {
    describe('Valid inputs', () => {
      it('should create user with email and userId', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.createUser('test@example.com', 'user-123');

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy.calls.mostRecent().args[0]).toBe(API_URLS.USER);

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        expect(fetchOptions.method).toBe('POST');
        expect(fetchOptions.headers['X-API-Key']).toBe('test-api-key');
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        const requestBody = JSON.parse(fetchOptions.body);
        expect(requestBody.user_email).toBe('test@example.com');
        expect(requestBody.user_id).toBe('user-123');
        expect(requestBody.periods).toEqual([]);
      });

      it('should include empty periods array', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.createUser('test@example.com', 'user-123');

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        const requestBody = JSON.parse(fetchOptions.body);
        expect(requestBody.periods).toEqual([]);
      });
    });

    describe('Error handling', () => {
      it('should throw error when creation fails', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          } as Response)
        );

        await expectAsync(
          UserDataSyncAdapter.createUser('test@example.com', 'user-123')
        ).toBeRejectedWithError(/Failed to create user: 500 Internal Server Error/);
      });

      it('should throw error when fetch fails', async () => {
        fetchSpy.and.callFake(() => {
          throw new Error('Network error');
        });

        await expectAsync(
          UserDataSyncAdapter.createUser('test@example.com', 'user-123')
        ).toBeRejected();
      });

      it('should return null when API key is not configured', async () => {
        (API_CONFIG as unknown as { apiKey: string }).apiKey = '';

        const result = await UserDataSyncAdapter.createUser('test@example.com', 'user-123');

        expect(result).toBeNull();
        expect(fetchSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('saveUserData', () => {
    describe('Valid inputs', () => {
      it('should save user data with periods', async () => {
        const periods: IFocus.Period[] = [
          {
            id: 'period-1',
            name: 'Work Period',
            description: 'Work hours',
            startFrom: new Date('2024-01-01T09:00:00.000Z'),
            endTo: new Date('2024-01-01T17:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', periods);

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy.calls.mostRecent().args[0]).toBe(API_URLS.USER);

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        expect(fetchOptions.method).toBe('POST');

        const requestBody = JSON.parse(fetchOptions.body);
        expect(requestBody.user_email).toBe('test@example.com');
        expect(requestBody.user_id).toBe('user-123');
        expect(requestBody.periods.length).toBe(1);
        expect(requestBody.periods[0].id).toBe('period-1');
        expect(requestBody.periods[0].name).toBe('Work Period');
      });

      it('should save user data with empty periods', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', []);

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        const requestBody = JSON.parse(fetchOptions.body);
        expect(requestBody.periods).toEqual([]);
      });

      it('should include API key in request headers', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', []);

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        expect(fetchOptions.headers['X-API-Key']).toBe('test-api-key');
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');
      });
    });

    describe('Error handling', () => {
      it('should throw error when save fails', async () => {
        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          } as Response)
        );

        await expectAsync(
          UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', [])
        ).toBeRejectedWithError(/Failed to save user data: 500 Internal Server Error/);
      });

      it('should throw error when fetch fails', async () => {
        fetchSpy.and.callFake(() => {
          throw new Error('Network error');
        });

        await expectAsync(
          UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', [])
        ).toBeRejected();
      });

      it('should skip save when API key is not configured', async () => {
        (API_CONFIG as unknown as { apiKey: string }).apiKey = '';

        await UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', []);

        expect(fetchSpy).not.toHaveBeenCalled();
      });
    });

    describe('Integration', () => {
      it('should save multiple periods', async () => {
        const periods: IFocus.Period[] = [
          {
            id: 'period-1',
            name: 'Morning Period',
            description: 'Morning hours',
            startFrom: new Date('2024-01-01T06:00:00.000Z'),
            endTo: new Date('2024-01-01T09:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
          {
            id: 'period-2',
            name: 'Work Period',
            description: 'Work hours',
            startFrom: new Date('2024-01-01T09:00:00.000Z'),
            endTo: new Date('2024-01-01T17:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
          {
            id: 'period-3',
            name: 'Evening Period',
            description: 'Evening hours',
            startFrom: new Date('2024-01-01T18:00:00.000Z'),
            endTo: new Date('2024-01-01T21:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', periods);

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        const requestBody = JSON.parse(fetchOptions.body);
        expect(requestBody.periods.length).toBe(3);
        expect(requestBody.periods[0].id).toBe('period-1');
        expect(requestBody.periods[1].id).toBe('period-2');
        expect(requestBody.periods[2].id).toBe('period-3');
      });

      it('should filter out default period when saving to backend', async () => {
        const periods: IFocus.Period[] = [
          {
            id: DEFAULT_PERIOD_ID,
            name: 'Default Period',
            description: 'Default period (should be filtered)',
            startFrom: new Date('2024-01-01T09:00:00.000Z'),
            endTo: new Date('2024-01-01T17:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
          {
            id: 'period-1',
            name: 'Work Period',
            description: 'Work hours',
            startFrom: new Date('2024-01-01T09:00:00.000Z'),
            endTo: new Date('2024-01-01T17:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', periods);

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        const requestBody = JSON.parse(fetchOptions.body);

        // Should only have 1 period (default period filtered out)
        expect(requestBody.periods.length).toBe(1);
        expect(requestBody.periods[0].id).toBe('period-1');

        // Verify default period is NOT in the request
        const hasDefaultPeriod = requestBody.periods.some(
          (p: IFocus.Period) => p.id === DEFAULT_PERIOD_ID
        );
        expect(hasDefaultPeriod).toBe(false);
      });

      it('should save empty array when only default period exists', async () => {
        const periods: IFocus.Period[] = [
          {
            id: DEFAULT_PERIOD_ID,
            name: 'Default Period',
            description: 'Default period (should be filtered)',
            startFrom: new Date('2024-01-01T09:00:00.000Z'),
            endTo: new Date('2024-01-01T17:00:00.000Z'),
            isFocused: false,
            focusedTimes: [],
            daysOfWeek: [1, 2, 3, 4, 5],
            sessionStartTime: null,
            webSites: [],
          },
        ];

        fetchSpy.and.returnValue(
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { success: true } }),
          } as Response)
        );

        await UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', periods);

        const fetchOptions = fetchSpy.calls.mostRecent().args[1];
        const requestBody = JSON.parse(fetchOptions.body);

        // Should be empty array (default period filtered out)
        expect(requestBody.periods).toEqual([]);
      });
    });
  });

  describe('API Configuration', () => {
    it('should use correct API URL for getUserData', async () => {
      fetchSpy.and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { user: null, periods: [] } }),
        } as Response)
      );

      await UserDataSyncAdapter.getUserData('test@example.com', 'user-123');

      const fetchUrl = fetchSpy.calls.mostRecent().args[0];
      expect(fetchUrl).toContain(API_URLS.USER);
    });

    it('should use correct API URL for createUser', async () => {
      fetchSpy.and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { success: true } }),
        } as Response)
      );

      await UserDataSyncAdapter.createUser('test@example.com', 'user-123');

      expect(fetchSpy.calls.mostRecent().args[0]).toBe(API_URLS.USER);
    });

    it('should use correct API URL for saveUserData', async () => {
      fetchSpy.and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { success: true } }),
        } as Response)
      );

      await UserDataSyncAdapter.saveUserData('test@example.com', 'user-123', []);

      expect(fetchSpy.calls.mostRecent().args[0]).toBe(API_URLS.USER);
    });
  });

  describe('syncPeriodsToBackend', () => {
    it('should filter out default period when syncing to backend', async () => {
      const mockPeriods: IFocus.Period[] = [
        {
          id: DEFAULT_PERIOD_ID,
          name: 'Default Period',
          description: 'Default period',
          startFrom: new Date('2024-01-01T09:00:00.000Z'),
          endTo: new Date('2024-01-01T17:00:00.000Z'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        },
        {
          id: 'period-1',
          name: 'Work Period',
          description: 'Work hours',
          startFrom: new Date('2024-01-01T09:00:00.000Z'),
          endTo: new Date('2024-01-01T17:00:00.000Z'),
          isFocused: false,
          focusedTimes: [],
          daysOfWeek: [1, 2, 3, 4, 5],
          sessionStartTime: null,
          webSites: [],
        },
      ];

      (StorageAdapter.getPeriods as jasmine.Spy).and.returnValue(Promise.resolve(mockPeriods));

      // Mock chrome.storage.local.get to return user credentials using correct enum keys
      const CHROME_STORAGE_KEY_ENUM_VALUES = {
        user_email: 'test@example.com',
        user_id: 'user-123',
      };

      mockChromeStorage.local.get.and.callFake(() => {
        return Promise.resolve(CHROME_STORAGE_KEY_ENUM_VALUES);
      });

      fetchSpy.and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { success: true } }),
        } as Response)
      );

      await UserDataSyncAdapter.syncPeriodsToBackend();

      // Verify fetch was called (user credentials are mocked, so a backend sync is expected)
      expect(fetchSpy.calls.count()).toBeGreaterThan(0);

      const fetchOptions = fetchSpy.calls.mostRecent().args[1];
      expect(fetchOptions).toBeDefined();
      expect(fetchOptions.body).toBeDefined();

      const requestBody = JSON.parse(fetchOptions.body);

      // Should only sync 1 period (default period filtered out)
      expect(requestBody.periods.length).toBe(1);
      expect(requestBody.periods[0].id).toBe('period-1');

      // Verify default period is NOT in the request
      const hasDefaultPeriod = requestBody.periods.some(
        (p: IFocus.Period) => p.id === DEFAULT_PERIOD_ID
      );
      expect(hasDefaultPeriod).toBe(false);
    });
  });
});
