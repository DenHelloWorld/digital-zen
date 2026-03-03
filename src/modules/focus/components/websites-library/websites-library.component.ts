import { DzToastContainerComponent } from '../../../common/components';
import { SwitchComponent } from '../../../common/components/switch/switch.component';
import { ICONS } from '../../../common/constants/icons.const';
import { UI_TEXT } from '../../../common/constants/ui-text.const';
import {
  FOLDER_EMOJI_COLLECTION,
  WEBSITES_LIBRARY_PRESET,
} from '../../../common/constants/websites.const';
import { CopyToClipboardDirective } from '../../../common/directives/copy.directive';
import { PopupDirective } from '../../../common/directives/popup.directive';
import { CHROME_STORAGE_KEY_ENUM } from '../../../common/enums/chrome-storage-key.enum';
import { PERMISSION_LVL_ENUM } from '../../../common/enums/permission-lvl.enum';
import { cleanProtocolHelper } from '../../../common/helpers/clean-protocol.helper';
import { cleanUrlHelper } from '../../../common/helpers/clean-url.helper';
import { FaviconHelper } from '../../../common/helpers/favicon.helper';
import { buildRequestDomainVariants } from '../../../common/helpers/request-domain-variants.helper';
import { IFocus } from '../../../common/models/focus.model';
import { ChromeStorageService } from '../../../common/services/chrome-storage.service';
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
  readonly #storage = inject(ChromeStorageService);

  public readonly period = model.required<IFocus.Period>();
  public readonly isWebsitesPopupShown = model<boolean>(false);

  protected readonly library = computed(() => this.period().library);

  protected readonly folders = computed(() => {
    const lib = this.library();
    const presetKeys = Object.keys(WEBSITES_LIBRARY_PRESET);
    const allKeys = Object.keys(lib);

    return [...presetKeys, ...allKeys.filter(k => !presetKeys.includes(k)).sort()].filter(
      k => k !== IFocus.EWebSiteType.UNBLOCKABLE
    );
  });
  protected readonly webSites: Signal<IFocus.WebSite[]> = computed(() =>
    Object.values(this.period().library).flat()
  );
  protected readonly categoryActiveCounts = computed(() => {
    const currentWebsites = this.webSites();
    const counts = {} as Record<string, number>;

    this.folders().forEach(type => (counts[type as string] = 0));

    currentWebsites.forEach(site => {
      if (site.isActivated && site.type) {
        counts[site.type] = (counts[site.type] || 0) + 1;
      }
    });

    return counts;
  });
  protected readonly availableFoldersForMove = computed(() => {
    const currentMove = this.moveLink();
    if (!currentMove) return [];

    return this.folders().filter(
      f => f !== currentMove.fromFolder && f !== this.presetFolderNames.DELETE
    );
  });

  protected readonly openedFolders = signal<Set<string>>(new Set());
  protected readonly newFolderName = signal<string>('');
  protected readonly newLink = signal<{ url: string; type: string; isDuplicate: boolean } | null>(
    null
  );
  protected readonly moveLink = signal<{ url: string; fromFolder: string } | null>(null);
  protected readonly isMoveLinkPopupShown = signal<boolean>(false);
  protected readonly deleteLink = signal<{ url: string; folder: string } | null>(null);
  protected readonly deleteFolderName = signal<string>('');
  protected readonly isCreateFolderPopupShown = signal<boolean>(false);
  protected readonly isCreateLinkPopupShown = signal<boolean>(false);
  protected readonly isDeleteFolderPopupShown = signal<boolean>(false);
  protected readonly isDeleteLinkPopupShown = signal<boolean>(false);

  protected readonly emojiCollection = FOLDER_EMOJI_COLLECTION;
  protected readonly permissionLvls = PERMISSION_LVL_ENUM;
  protected readonly icons = ICONS;
  protected readonly uiText = UI_TEXT;
  protected readonly presetFolderNames = IFocus.EWebSiteType;

  protected readonly scrollToFolderItems = viewChildren<ElementRef>('folder');

  protected readonly cleanProtocolHelper = cleanProtocolHelper;

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
    const period = this.period();
    const folderName = site.type;

    if (!folderName || !period.library[folderName]) return;

    const updatedFolder = period.library[folderName].map(s =>
      s.url === site.url ? { ...s, isActivated: !s.isActivated } : s
    );

    this.period.set({
      ...period,
      library: {
        ...period.library,
        [folderName]: updatedFolder,
      },
    });
  }

  protected onToggleFolderInLibrary(folderName: string): void {
    const period = this.period();
    const folderContent = period.library[folderName] || [];
    const shouldActivate = !folderContent.every(site => site.isActivated);
    const updatedPeriod = {
      ...period,
      library: {
        ...period.library,
        [folderName]: folderContent.map(site => ({
          ...site,
          isActivated: shouldActivate,
        })),
      },
    };

    this.period.set(updatedPeriod);
  }

  protected onCloseWebsitesList(): void {
    this.isWebsitesPopupShown.set(false);
    this.onCloseCreateNewFolderPopup();
  }

  // Create folder
  protected onOpenCreateNewFolderPopup(): void {
    this.isCreateFolderPopupShown.set(true);
  }
  protected onCloseCreateNewFolderPopup(): void {
    this.isCreateFolderPopupShown.set(false);
    this.newFolderName.set('');
  }
  protected onAddNewFolder(): void {
    const period = this.period();
    const newFolderName = this.newFolderName();

    this.period.set({
      ...period,
      library: {
        ...period.library,
        [newFolderName]: [],
      },
    });

    this.isCreateFolderPopupShown.set(false);
  }

  // Delete folder
  protected onOpenDeleteFolderPopup(folder: string): void {
    this.deleteFolderName.set(folder);
    this.isDeleteFolderPopupShown.set(true);
  }

  protected onCloseDeleteFolderPopup(): void {
    this.isDeleteFolderPopupShown.set(false);
    this.deleteFolderName.set('');
  }
  protected onDeleteFolder(): void {
    const period = this.period();
    const deleteFolderName = this.deleteFolderName();

    if (!period || !deleteFolderName) return;

    const library = { ...period.library };

    const itemsToDelete = (library[deleteFolderName] || []).map(site => ({
      ...site,
      isActivated: false,
      type: IFocus.EWebSiteType.DELETE,
    }));

    const deleteKey = IFocus.EWebSiteType.DELETE;

    library[deleteKey] = [...(library[deleteKey] || []), ...itemsToDelete];

    delete library[deleteFolderName];

    this.period.set({
      ...period,
      library,
    });

    this.isDeleteFolderPopupShown.set(false);
    this.deleteFolderName.set('');
  }

  // Create Link
  protected onOpenCreateLinkPopup(folder: string): void {
    this.newLink.set({
      url: '',
      type: folder,
      isDuplicate: false,
    });
    this.isCreateLinkPopupShown.set(true);
  }
  protected onAddNewLink(): void {
    const linkData = this.newLink();
    const period = this.period();

    if (!linkData || !linkData.url || linkData.isDuplicate || !period) return;

    const folderName = linkData.type;

    const newSite: IFocus.WebSite = {
      id: linkData.url,
      name: cleanProtocolHelper(linkData.url),
      url: linkData.url,
      description: linkData.url,
      imageUrl: this.getFavicon(linkData.url),
      iconUrl: '',
      type: folderName,
      isActivated: true,
      permissionLvl: PERMISSION_LVL_ENUM.USER,
    };

    const updatedLibrary = {
      ...period.library,
      [folderName]: [...(period.library[folderName] || []), newSite],
    };

    this.period.set({
      ...period,
      library: updatedLibrary,
    });

    this.onCloseCreateLinkPopup();
  }
  protected onCloseCreateLinkPopup(): void {
    this.newLink.set(null);
    this.isCreateLinkPopupShown.set(false);
  }
  protected onInputNewLinkUrl(url: string): void {
    const current = this.newLink();
    if (!current) return;

    const trimmedUrl = url.trim();

    const inputBaseDomain = buildRequestDomainVariants(trimmedUrl)[0];

    const lib = this.library();
    const isDuplicate =
      !!inputBaseDomain &&
      Object.values(lib)
        .flat()
        .some(site => buildRequestDomainVariants(site.url)[0] === inputBaseDomain);

    this.newLink.set({
      ...current,
      url: cleanUrlHelper(url),
      isDuplicate,
    });
  }

  // Delete link
  protected onOpenDeleteLinkPopup(folder: string, url: string): void {
    this.deleteLink.set({ folder, url });
    this.isDeleteLinkPopupShown.set(true);
  }
  protected onCloseDeleteLinkPopup(): void {
    this.isDeleteLinkPopupShown.set(false);
    this.deleteLink.set(null);
  }
  protected onDeleteLink(): void {
    const deleteData = this.deleteLink();
    const period = this.period();

    if (!deleteData || !period) {
      this.onCloseDeleteLinkPopup();
      return;
    }

    const { folder, url } = deleteData;
    const currentLibrary = { ...period.library };
    const deleteKey = IFocus.EWebSiteType.DELETE;

    const siteToDelete = currentLibrary[folder]?.find(s => s.url === url);
    if (!siteToDelete) {
      this.onCloseDeleteLinkPopup();
      return;
    }

    currentLibrary[folder] = currentLibrary[folder].filter(s => s.url !== url);

    if (folder !== deleteKey) {
      const movedSite: IFocus.WebSite = {
        ...siteToDelete,
        isActivated: false,
        type: deleteKey,
      };

      currentLibrary[deleteKey] = [...(currentLibrary[deleteKey] || []), movedSite];
    }

    this.period.set({
      ...period,
      library: currentLibrary,
    });

    this.onCloseDeleteLinkPopup();
  }

  // Move link
  protected onOpenMoveLinkPopup(folder: string, url: string): void {
    this.moveLink.set({ fromFolder: folder, url });
    this.isMoveLinkPopupShown.set(true);
  }
  protected onCloseMoveLinkPopup(): void {
    this.isMoveLinkPopupShown.set(false);
    this.moveLink.set(null);
  }
  protected onMoveLink(toFolder: string): void {
    const moveData = this.moveLink();
    const period = this.period();

    if (!moveData || !period) return;

    const { fromFolder, url } = moveData;
    const library = { ...period.library };

    const siteIndex = library[fromFolder]?.findIndex(s => s.url === url);
    if (siteIndex === -1) return;

    const [site] = library[fromFolder].splice(siteIndex, 1);

    const updatedSite = { ...site, type: toFolder };
    library[toFolder] = [...(library[toFolder] || []), updatedSite];

    this.period.set({ ...period, library });
    this.onCloseMoveLinkPopup();
  }

  // Tree helpers
  protected isFolderOpen(type: string): boolean {
    return this.openedFolders().has(type);
  }

  protected isFolderSystem(folderName: string): boolean {
    return folderName in WEBSITES_LIBRARY_PRESET;
  }

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
    const sitesInCategory = this.period().library[type] || [];
    if (sitesInCategory.length === 0) return false;

    return this.categoryActiveCounts()[type] === sitesInCategory.length;
  }

  protected isFolderPartiallyActivated(type: string): boolean {
    const activeCount = this.categoryActiveCounts()[type] || 0;
    const sitesInCategory = this.period().library[type] || [];
    const totalCount = sitesInCategory.length;

    return activeCount > 0 && activeCount < totalCount;
  }

  #initWebsitesFoldersState(): void {
    this.#storage.get<IFocus.IWebSiteType[]>(CHROME_STORAGE_KEY_ENUM.OPENED_FOLDERS, saved => {
      if (saved) {
        this.openedFolders.set(new Set(saved));
      }
    });
  }
}
