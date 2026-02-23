import { DzToastContainerComponent } from '../../../common/components';
import { SwitchComponent } from '../../../common/components/switch/switch.component';
import { ICONS } from '../../../common/constants/icons.const';
import { UI_TEXT } from '../../../common/constants/ui-text.const';
import { WEBSITES_LIBRARY_PRESET } from '../../../common/constants/websites.const';
import { CopyToClipboardDirective } from '../../../common/directives/copy.directive';
import { PopupDirective } from '../../../common/directives/popup.directive';
import { CHROME_STORAGE_KEY_ENUM } from '../../../common/enums/chrome-storage-key.enum';
import { cleanProtocolHelper } from '../../../common/helpers/clean-protocol.helper';
import { cleanUrlHelper } from '../../../common/helpers/clean-url.helper';
import { FaviconHelper } from '../../../common/helpers/favicon.helper';
import { IFocus } from '../../../common/models/focus.model';
import { ChromeStorageService } from '../../../common/services/chrome-storage.service';
import { FocusService } from '../../services/focus.service';
import { LibraryService } from '../../services/library.service';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  model,
  OnInit,
  signal,
  Signal,
  viewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dz-websites-library-popup',
  templateUrl: 'websites-library.component.html',
  styleUrls: ['websites-library.component.scss'],
  imports: [
    // angular modules
    NgTemplateOutlet,
    FormsModule,
    // components
    DzToastContainerComponent,
    SwitchComponent,
    // directives
    PopupDirective,
    CopyToClipboardDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsitesLibraryComponent implements OnInit {
  readonly #injector = inject(Injector);
  readonly #focusService = inject(FocusService);
  readonly #libraryService = inject(LibraryService);
  readonly #storage = inject(ChromeStorageService);

  protected readonly currentPeriod: Signal<IFocus.Period | null> = this.#focusService.currentPeriod;
  protected readonly library = this.#libraryService.websitesLibrary;

  protected readonly folders = computed(() => {
    const lib = this.library();
    const presetKeys = Object.keys(WEBSITES_LIBRARY_PRESET);
    const allKeys = Object.keys(lib);

    return [...presetKeys, ...allKeys.filter(k => !presetKeys.includes(k)).sort()].filter(
      k => k !== IFocus.EWebSiteType.UNBLOCKABLE && lib[k]
    );
  });
  protected readonly currentPeriodWebSites: Signal<IFocus.WebSite[]> = computed(
    () => this.currentPeriod()?.webSites ?? []
  );
  protected readonly categoryActiveCounts = computed(() => {
    const currentWebsites = this.currentPeriodWebSites();
    const counts = {} as Record<string, number>;

    this.folders().forEach(type => (counts[type as string] = 0));

    currentWebsites.forEach(site => {
      if (site.isActivated && site.type) {
        counts[site.type] = (counts[site.type] || 0) + 1;
      }
    });

    return counts;
  });
  protected readonly websitesPopupData = computed(() => {
    const currentWebsites = this.currentPeriodWebSites();

    return {
      ...this.#mapWebsitesToCategories(currentWebsites),
    };
  });

  protected readonly openedFolders = signal<Set<string>>(new Set(this.folders()));
  protected readonly newFolderName = signal<string>('');
  protected readonly deleteFolderName = signal<string>('');
  protected readonly isCreateNewFolderPopupShown = signal<boolean>(false);
  protected readonly isDeleteFolderPopupShown = signal<boolean>(false);

  protected readonly icons = ICONS;
  protected readonly uiText = UI_TEXT;
  protected readonly cleanProtocolHelper = cleanProtocolHelper;
  protected readonly presetFolderNames = IFocus.EWebSiteType;

  public readonly isWebsitesPopupShown = model<boolean>(false);
  protected readonly scrollToFolderItems = viewChildren<ElementRef>('folder');

  public ngOnInit(): void {
    this.#initWebsitesFoldersState();

    /**
     * Scroll to new folder
     * */
    effect(
      () => {
        const name = this.newFolderName();
        const items = this.scrollToFolderItems();

        if (!name || items.length === 0) return;

        const target = items.find(item => item.nativeElement.getAttribute('data-name') === name);

        if (target) {
          target.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          target.nativeElement.classList.add('shake');
        }
      },
      { injector: this.#injector }
    );
  }

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }

  protected onToggleFolderOfWebsites(type: string): void {
    const period = this.currentPeriod();
    if (!period) return;

    const shouldActivate = !this.isFolderFullyActivated(type);

    const presetsInCategory = this.library()[type] || [];
    const presetUrlsSet = new Set(presetsInCategory.map(p => cleanUrlHelper(p.url)));

    const finalWebsitesMap = new Map<string, IFocus.WebSite>();

    period.webSites.forEach(site => {
      finalWebsitesMap.set(cleanUrlHelper(site.url), { ...site });
    });

    presetsInCategory.forEach(preset => {
      const cleanUrl = cleanUrlHelper(preset.url);
      if (!finalWebsitesMap.has(cleanUrl)) {
        finalWebsitesMap.set(cleanUrl, { ...preset, isActivated: false, type });
      }
    });

    finalWebsitesMap.forEach(site => {
      if (site.type === type || presetUrlsSet.has(cleanUrlHelper(site.url))) {
        site.isActivated = shouldActivate;
        site.type = type;
      }
    });

    void this.#focusService.updatePeriod({
      ...period,
      webSites: Array.from(finalWebsitesMap.values()),
    });
  }

  protected onCloseWebsitesList(): void {
    this.isWebsitesPopupShown.set(false);
    this.onCloseCreateNewFolderPopup();
  }

  protected onCloseCreateNewFolderPopup(): void {
    this.isCreateNewFolderPopupShown.set(false);
    this.newFolderName.set('');
  }

  protected onCloseDeleteFolderPopup(): void {
    this.isDeleteFolderPopupShown.set(false);
    this.deleteFolderName.set('');
  }

  protected onOpenCreateNewFolderPopup(): void {
    this.isCreateNewFolderPopupShown.set(true);
  }

  protected onOpenDeleteFolderPopup(folder: string): void {
    this.deleteFolderName.set(folder);
    this.isDeleteFolderPopupShown.set(true);
  }

  protected onAddNewFolder(): void {
    this.#libraryService.addNewFolder(this.newFolderName());
    this.isCreateNewFolderPopupShown.set(false);
  }

  protected onDeleteFolder(): void {
    this.#libraryService.removeFolderFromLibrary(this.deleteFolderName());
    this.isDeleteFolderPopupShown.set(false);
  }

  protected isFolderOpen(type: string): boolean {
    return this.openedFolders().has(type);
  }

  protected isFolderSystem(folderName: string): boolean {
    return folderName in WEBSITES_LIBRARY_PRESET;
  }

  // TODO: add opportunity to manage websites in library

  protected getFavicon(url: string): string {
    return FaviconHelper.getGoogleUrl(url);
  }

  protected toggleFolder(type: string): void {
    this.openedFolders.update(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }

      this.#storage.set(CHROME_STORAGE_KEY_ENUM.OPENED_FOLDERS, Array.from(newSet));

      return newSet;
    });
  }

  protected isFolderFullyActivated(type: string): boolean {
    const sitesInCategory = this.websitesPopupData()[type] || [];
    if (sitesInCategory.length === 0) return false;

    return this.categoryActiveCounts()[type] === sitesInCategory.length;
  }

  protected isFolderPartiallyActivated(type: string): boolean {
    const activeCount = this.categoryActiveCounts()[type] || 0;
    const sitesInCategory = this.websitesPopupData()[type] || [];
    const totalCount = sitesInCategory.length;

    return activeCount > 0 && activeCount < totalCount;
  }

  #mapWebsitesToCategories(activeWebsites: IFocus.WebSite[]): Record<string, IFocus.WebSite[]> {
    const result = {} as Record<string, IFocus.WebSite[]>;
    const library = this.library();

    for (const key in library) {
      const category = key as string;
      result[category] = library[category].map(site => ({
        ...site,
        isActivated: false,
      }));
    }

    activeWebsites.forEach(site => {
      if (!site.type) return;

      const category = result[site.type];
      if (!category) return;

      const cleanUrl = cleanUrlHelper(site.url);

      const existingIndex = category.findIndex(p => cleanUrlHelper(p.url) === cleanUrl);

      if (existingIndex !== -1) {
        category[existingIndex] = { ...site };
      } else {
        category.push({ ...site });
      }
    });

    return result;
  }

  #initWebsitesFoldersState(): void {
    this.#storage.get<IFocus.IWebSiteType[]>(CHROME_STORAGE_KEY_ENUM.OPENED_FOLDERS, saved => {
      if (saved) {
        this.openedFolders.set(new Set(saved));
      }
    });
  }
}
