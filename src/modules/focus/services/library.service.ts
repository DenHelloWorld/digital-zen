import { DzToastService } from '../../common/components';
import { WEBSITES_LIBRARY_PRESET } from '../../common/constants/websites.const';
import { CHROME_COMMAND_ENUM } from '../../common/enums/chrome-command.enum';
import { CHROME_STORAGE_KEY_ENUM } from '../../common/enums/chrome-storage-key.enum';
import { TOAST_TYPE_ENUM } from '../../common/enums/toast-type.enum';
import { cleanProtocolHelper } from '../../common/helpers/clean-protocol.helper';
import { IFocus } from '../../common/models/focus.model';
import { ChromeStorageService } from '../../common/services/chrome-storage.service';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  readonly #isChromeRuntime: boolean = !!chrome.runtime;
  readonly #storage = inject(ChromeStorageService);
  readonly #toastService = inject(DzToastService);

  readonly #websitesLibrary =
    signal<Record<string, readonly IFocus.WebSite[]>>(WEBSITES_LIBRARY_PRESET);

  public readonly websitesLibrary = this.#websitesLibrary.asReadonly();

  constructor() {
    this.#syncInitialState();
    this.#listenToStorageChanges();
  }

  public addNewFolder(folder: string): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.ADD_NEW_FOLDER, folder });
  }

  public removeFolderFromLibrary(folder: string): void {
    if (!this.#isChromeRuntime) return;

    chrome.runtime.sendMessage(
      { command: CHROME_COMMAND_ENUM.REMOVE_FOLDER, folder },
      (response: { success: boolean; error?: string }) => {
        if (response && !response.success) {
          this.#toastService.show({
            message: response.error || `Failed to remove "${folder}"`,
            type: TOAST_TYPE_ENUM.ERROR,
            durationInMs: 4000,
          });
          return;
        }

        this.#toastService.show({
          message: `Content from "${folder}" moved to ${IFocus.EWebSiteType.DELETE}`,
          type: TOAST_TYPE_ENUM.SUCCESS,
          durationInMs: 3000,
        });
      }
    );
  }

  public addWebsiteToFolder(folder: string, website: IFocus.WebSite): void {
    if (!this.#isChromeRuntime) return;

    chrome.runtime.sendMessage(
      { command: CHROME_COMMAND_ENUM.ADD_WEBSITE_TO_FOLDER, folder, website },
      (response: { success: boolean; error?: string }) => {
        if (response && !response.success) {
          this.#toastService.show({
            message: response.error || 'Failed to add website',
            type: TOAST_TYPE_ENUM.ERROR,
            durationInMs: 4000,
          });
          return;
        }

        this.#toastService.show({
          message: `Website added to "${folder}"`,
          type: TOAST_TYPE_ENUM.SUCCESS,
          durationInMs: 3000,
        });
      }
    );
  }

  public removeWebsiteFromFolder(folder: string, url: string): void {
    if (!this.#isChromeRuntime) return;

    chrome.runtime.sendMessage(
      { command: CHROME_COMMAND_ENUM.REMOVE_WEBSITE, folder, url },
      (response: { success: boolean; error?: string }) => {
        if (response && !response.success) {
          this.#toastService.show({
            message: response.error || 'Failed to remove website',
            type: TOAST_TYPE_ENUM.ERROR,
            durationInMs: 4000,
          });
          return;
        }
        this.#toastService.show({
          message: `${cleanProtocolHelper(url)} removed from ${folder}`,
          type: TOAST_TYPE_ENUM.SUCCESS,
          durationInMs: 3000,
        });
      }
    );
  }

  #syncInitialState(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    this.#storage.get<Record<IFocus.IWebSiteType, readonly IFocus.WebSite[]>>(
      CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY,
      result => {
        if (!result) {
          return;
        }

        this.#websitesLibrary.set(result);
      }
    );
  }

  #listenToStorageChanges(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]) {
        const newLibrary = changes[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY].newValue as Record<
          IFocus.IWebSiteType,
          readonly IFocus.WebSite[]
        > | null;

        if (newLibrary) {
          this.#websitesLibrary.set(newLibrary);
        }
      }
    });
  }
}
