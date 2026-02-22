import { WEBSITES_LIBRARY_PRESET } from '../../common/constants/websites.const';
import { CHROME_STORAGE_KEY_ENUM } from '../../common/enums/chrome-storage-key.enum';
import { IFocus } from '../../common/models/focus.model';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  readonly #isChromeRuntime: boolean = !!chrome.runtime;

  readonly #websitesLibrary =
    signal<Record<IFocus.IWebSiteType, readonly IFocus.WebSite[]>>(WEBSITES_LIBRARY_PRESET);

  public readonly websitesLibrary = this.#websitesLibrary.asReadonly();

  constructor() {
    this.#listenToStorageChanges();
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
