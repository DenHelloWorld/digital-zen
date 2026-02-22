import { DzToastContainerComponent } from '../../../common/components';
import { SwitchComponent } from '../../../common/components/switch/switch.component';
import { ICONS } from '../../../common/constants/icons.const';
import { CopyToClipboardDirective } from '../../../common/directives/copy.directive';
import { PopupDirective } from '../../../common/directives/popup.directive';
import { CHROME_STORAGE_KEY_ENUM } from '../../../common/enums/chrome-storage-key.enum';
import { cleanProtocolHelper } from '../../../common/helpers/clean-protocol.helper';
import { cleanUrlHelper } from '../../../common/helpers/clean-url.helper';
import { FaviconHelper } from '../../../common/helpers/favicon.helper';
import { IFocus } from '../../../common/models/focus.model';
import { ChromeStorageService } from '../../../common/services/chrome-storage.service';
import { FocusService } from '../../services/focus.service';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  OnInit,
  signal,
  Signal,
} from '@angular/core';

@Component({
  selector: 'dz-websites-library-popup',
  templateUrl: 'websites-library.component.html',
  styleUrls: ['websites-library.component.scss'],
  imports: [
    // angular modules
    NgTemplateOutlet,
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
  readonly #focusService = inject(FocusService);
  readonly #storage = inject(ChromeStorageService);

  protected readonly currentPeriod: Signal<IFocus.Period | null> = this.#focusService.currentPeriod;
  protected readonly websitesLibrary = this.#focusService.websitesLibrary;

  protected readonly currentPeriodWebSites: Signal<IFocus.WebSite[]> = computed(
    () => this.currentPeriod()?.webSites ?? []
  );
  protected readonly categoryActiveCounts = computed(() => {
    const currentWebsites = this.currentPeriodWebSites();
    const counts = {} as Record<IFocus.IWebSiteType, number>;

    this.websiteTypes.forEach(type => (counts[type as IFocus.IWebSiteType] = 0));

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

  protected readonly openedFolders = signal<Set<IFocus.IWebSiteType>>(
    new Set(Object.values(IFocus.EWebSiteType))
  );

  protected readonly websiteTypes = Object.values(IFocus.EWebSiteType).filter(
    type => type !== IFocus.EWebSiteType.UNBLOCKABLE
  );
  protected readonly icons = ICONS;
  protected readonly cleanProtocolHelper = cleanProtocolHelper;

  public readonly isWebsitesPopupShown = model<boolean>(false);

  public ngOnInit(): void {
    this.#initWebsitesFoldersState();
  }

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }

  protected onToggleFolderOfWebsites(type: IFocus.IWebSiteType): void {
    const period = this.currentPeriod();
    if (!period) return;

    const shouldActivate = !this.isFolderFullyActivated(type);

    const presetsInCategory = this.websitesLibrary()[type] || [];
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
  }

  protected isFolderOpen(type: IFocus.IWebSiteType): boolean {
    return this.openedFolders().has(type);
  }

  protected getFavicon(url: string): string {
    return FaviconHelper.getGoogleUrl(url);
  }

  protected toggleFolder(type: IFocus.IWebSiteType): void {
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

  protected isFolderFullyActivated(type: IFocus.IWebSiteType): boolean {
    const sitesInCategory = this.websitesPopupData()[type] || [];
    if (sitesInCategory.length === 0) return false;

    return this.categoryActiveCounts()[type] === sitesInCategory.length;
  }

  protected isFolderPartiallyActivated(type: IFocus.IWebSiteType): boolean {
    const activeCount = this.categoryActiveCounts()[type] || 0;
    const sitesInCategory = this.websitesPopupData()[type] || [];
    const totalCount = sitesInCategory.length;

    return activeCount > 0 && activeCount < totalCount;
  }

  #mapWebsitesToCategories(
    activeWebsites: IFocus.WebSite[]
  ): Record<IFocus.IWebSiteType, IFocus.WebSite[]> {
    const result = {} as Record<IFocus.IWebSiteType, IFocus.WebSite[]>;
    const library = this.websitesLibrary();

    for (const key in library) {
      const category = key as IFocus.IWebSiteType;
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
