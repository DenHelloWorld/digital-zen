import { DynamicInputComponent } from '../../../common/components/dynamic-input/dynamic-input.component';
import { MultiSelectorComponent } from '../../../common/components/multi-selector/multi-selector.component';
import { SwitchComponent } from '../../../common/components/switch/switch.component';
import { WeekdaysSelectorComponent } from '../../../common/components/weekdays-selector/weekdays-selector.component';
import { ALL_DAYS_OF_WEEK, WORK_DAYS_OF_WEEKS } from '../../../common/constants/days-of-week.const';
import { ICONS } from '../../../common/constants/icons.const';
import {
  ALL_DAY_TIME_RANGE,
  MANUAL_TIME_RANGE,
  TIME_RANGES,
} from '../../../common/constants/time-ranges.const';
import { UI_TEXT } from '../../../common/constants/ui-text.const';
import { VALIDATION_ERROR_KEYS } from '../../../common/constants/validation-errors.const';
import { WEBSITE_FACEBOOK, WEBSITE_TIKTOK } from '../../../common/constants/websites.const';
import {
  BLOCK_BEHAVIOUR_ENUM,
  BlockBehaviourType,
} from '../../../common/enums/block-behaviour.enum';
import { COLORS_ENUM } from '../../../common/enums/colors.enum';
import { VIEW_ENUM } from '../../../common/enums/view.enum';
import { cleanUrlHelper } from '../../../common/helpers/clean-url.helper';
import { FaviconHelper } from '../../../common/helpers/favicon.helper';
import { getUniqueWebsitesHelper } from '../../../common/helpers/get-unique-websites.helper';
import { logger } from '../../../common/helpers/logger';
import { setTimeFromStr } from '../../../common/helpers/time.helper';
import { IFocusForm } from '../../../common/models/focus-form.model';
import { IFocus } from '../../../common/models/focus.model';
import { WebsiteConnectivityProvider } from '../../../common/providers/website-connectivity.provider';
import { MiniRouterService } from '../../../common/services/mini-router.service';
import { arrayMinLengthValidator } from '../../../common/validators/array-min-length.validator';
import { noUnactivatableWebsitesValidator } from '../../../common/validators/no-unactivatable-websites.validator';
import { requiredTrimmedValidator } from '../../../common/validators/required-trimmed.validator';
import { timeRangeValidator } from '../../../common/validators/time-range.validator';
import { uniquePeriodNameValidator } from '../../../common/validators/unique-period-name.validator';
import { FocusService } from '../../services/focus.service';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  OnInit,
  AfterViewInit,
  ElementRef,
  viewChild,
  resource,
  ResourceRef,
  Signal,
  signal,
  untracked,
  WritableSignal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged, map } from 'rxjs';

/**
 * Period form component for creating and editing focus periods
 * Handles form validation, data binding, and period persistence
 *
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Angular Signals (InputSignal, OutputEmitterRef, signal)
 * - DZ_05: RxJS for form value changes (valid use case)
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_10: UI text constants usage
 * - DZ_11: Universal Logger usage
 * - DZ_15: Typed Reactive Forms
 * - DZ_16: Custom validators
 *
 * @see /docs/coding-guidelines.md
 * @see https://angular.dev/guide/forms/typed-forms (Typed Forms)
 * @see https://angular.dev/guide/forms/form-validation (Form Validation)
 */
@Component({
  selector: 'dz-period-form',
  templateUrl: 'period-form.component.html',
  styleUrls: ['period-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // angular modules
    CommonModule,
    ReactiveFormsModule,
    // components
    WeekdaysSelectorComponent,
    DynamicInputComponent,
    MultiSelectorComponent,
    SwitchComponent,
  ],
})
export class PeriodFormComponent implements OnInit, AfterViewInit {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #fb = inject(FormBuilder);
  readonly #destroyRef = inject(DestroyRef);
  readonly #injector = inject(Injector);
  readonly #focusService = inject(FocusService);
  readonly #router = inject(MiniRouterService);
  /** @guideline DZ_11 - Universal Logger usage */
  readonly #logger = logger.createLogger('PeriodFormComponent');

  readonly #maxPeriodNameLength = 100;
  readonly #siteStatusesCache = new Map<string, ResourceRef<boolean | undefined>>();

  protected readonly payload = this.#router.payload as Signal<{
    period: IFocus.Period;
    scrollToBehaviours: boolean;
  } | null>;

  protected readonly currentRoute = this.#router.currentRoute;
  protected readonly currentPeriod = this.#focusService.currentPeriod;
  /** @guideline DZ_15 - Typed Reactive Form */
  protected form: FormGroup<IFocusForm.UpsertPeriod>;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  /** @guideline DZ_10.1 - Icon constants */
  protected readonly icons = ICONS;
  protected readonly views = VIEW_ENUM;
  protected readonly colors = COLORS_ENUM;
  /** Validation error keys for template usage */
  protected readonly validationErrorKeys = VALIDATION_ERROR_KEYS;
  protected readonly timeRanges = [...TIME_RANGES];
  protected readonly manualTimeRangeId = MANUAL_TIME_RANGE.id;
  protected readonly blockBehaviours = BLOCK_BEHAVIOUR_ENUM;
  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];

  protected readonly excludedSiteKeysArray: (keyof IFocus.WebSite)[] = [
    'imageUrl',
    'iconUrl',
    'isActivated',
    'description',
    'type',
    'name',
    'permissionLvl',
  ];

  protected readonly isCurrentPeriod = computed(
    () => this.#focusService.currentPeriod()?.id === this.payload()?.period?.id
  );

  protected readonly setAsCurrentPeriod = signal<boolean>(false);
  protected readonly selectedTimeRanges: WritableSignal<IFocus.TimeRange[]> = signal<
    IFocus.TimeRange[]
  >([]);
  protected readonly selectedDays: WritableSignal<IFocus.DayOfWeek[]> = signal<IFocus.DayOfWeek[]>(
    []
  );
  protected readonly selectedWebSites: WritableSignal<IFocus.WebSite[]> = signal<IFocus.WebSite[]>([
    WEBSITE_TIKTOK,
    WEBSITE_FACEBOOK,
  ]);

  protected readonly siteStatuses = signal<Record<string, ResourceRef<boolean | undefined>>>({});

  protected readonly behaviourBlock = viewChild<ElementRef>('behaviourBlock');

  public ngOnInit(): void {
    // TODO: отобразить здесь вебсайты как в попапе или просто показывать здесь тот же попап.
    this.#initForm();
    this.#loadPeriodData();
    this.#setupValidatorUpdates();

    this.form.valueChanges
      .pipe(
        map(() => this.form.getRawValue()),
        distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(value => {
        this.#logger.debug('Form value changed:', value);
        this.setAsCurrentPeriod.set(value.setAsCurrentPeriod);
      });

    toObservable(this.selectedDays, { injector: this.#injector })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((value: IFocus.DayOfWeek[]) => {
        this.form.controls.daysOfWeek.setValue(value.map((value: IFocus.DayOfWeek) => value.day));
      });

    effect(
      () => {
        const sites = this.selectedWebSites();
        const cleaned = getUniqueWebsitesHelper(sites);

        untracked(() => {
          this.form.controls.webSites.setValue(cleaned);

          if (JSON.stringify(sites) !== JSON.stringify(cleaned)) {
            this.selectedWebSites.set(cleaned);
          }
        });
      },
      { injector: this.#injector }
    );

    effect(
      () => {
        const timeRange: IFocus.TimeRange | null = this.selectedTimeRanges()?.[0] ?? null;

        if (timeRange === null) {
          return;
        }

        this.form.controls.startFrom.enable();
        this.form.controls.endTo.enable();

        if (timeRange.id !== this.manualTimeRangeId) {
          this.form.controls.startFrom.disable();
          this.form.controls.endTo.disable();
        }

        this.form.controls.startFrom.setValue(timeRange.startFrom);
        this.form.controls.endTo.setValue(timeRange.endTo);
      },
      { injector: this.#injector }
    );

    effect(
      () => {
        const sites = this.selectedWebSites();
        let hasChanged = false;
        const currentMap = { ...this.siteStatuses() };

        sites.forEach(site => {
          if (!this.#siteStatusesCache.has(site.url)) {
            const res = untracked(() =>
              resource({
                loader: () => WebsiteConnectivityProvider.isAlive(site.url),
                injector: this.#injector,
              })
            );
            this.#siteStatusesCache.set(site.url, res);
            currentMap[site.url] = res;
            hasChanged = true;
          }
        });

        if (hasChanged) {
          this.siteStatuses.set(currentMap);
        }
      },
      { injector: this.#injector }
    );
  }

  public ngAfterViewInit(): void {
    if (this.payload()?.scrollToBehaviours) {
      this.behaviourBlock()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.behaviourBlock()?.nativeElement.classList.add('shake');
    }
  }

  protected savePeriod() {
    if (this.form.valid) {
      const rawValue = this.form.getRawValue();
      const isCurrentPeriod = this.isCurrentPeriod();

      const webSitesWithFavicons: IFocus.WebSite[] = rawValue.webSites.map(site => {
        const cleanedUrl = cleanUrlHelper(site.url);
        const imageUrl = FaviconHelper.getGoogleUrl(cleanedUrl);

        return {
          ...site,
          url: cleanedUrl,
          imageUrl,
        };
      });

      const now = new Date();

      const periodData: IFocus.Period = {
        // TODO: process timeLeftSec
        timeLeftSec: null,
        id: rawValue.id,
        name: rawValue.name,
        description: rawValue.description,
        startFrom: setTimeFromStr(now, rawValue.startFrom ?? ALL_DAY_TIME_RANGE.startFrom),
        endTo: setTimeFromStr(now, rawValue.endTo ?? ALL_DAY_TIME_RANGE.endTo),
        webSites: webSitesWithFavicons,
        blockBehaviour: rawValue.blockBehaviour,
        daysOfWeek: rawValue.daysOfWeek,
        focusedTimes: rawValue.focusedTimes,
        isActive: rawValue.isActive,
        sessionStartTime: rawValue.sessionStartTime,
      };

      if (this.currentRoute() === VIEW_ENUM.EDIT_PERIOD) {
        this.#focusService.updatePeriod(periodData);
        this.#router.navigate(this.#router.previousRoute() || VIEW_ENUM.FOCUS, {
          scrollPeriodId: periodData.id,
        });
      } else if (this.currentRoute() === VIEW_ENUM.ADD_PERIOD) {
        this.#focusService.addPeriod(periodData);
        this.#router.navigate(VIEW_ENUM.MENU, { scrollPeriodId: periodData.id });
      }

      if (!isCurrentPeriod && rawValue.setAsCurrentPeriod) {
        this.#focusService.setCurrentPeriod(periodData.id);
      }
    }
  }

  protected onSetAsCurrentPeriodChange(value: boolean): void {
    if (this.isCurrentPeriod()) return;
    this.form.controls.setAsCurrentPeriod.setValue(value);
  }

  protected cancelForm(): void {
    this.#router.navigate(this.#router.previousRoute() || VIEW_ENUM.FOCUS);
  }

  protected getFavicon(url: string): string {
    return FaviconHelper.getGoogleUrl(url);
  }

  protected setBlockBehaviour(blockBehaviour: BlockBehaviourType): void {
    this.form.patchValue({ blockBehaviour });
  }

  protected onToggleBlockedWebsite(toggledSite: IFocus.WebSite): void {
    this.selectedWebSites.update(sites =>
      sites.map(site =>
        site.url === toggledSite.url ? { ...site, isActivated: !site.isActivated } : site
      )
    );
  }

  /**
   * Updates the validators for the name field.
   * Extracted to avoid code duplication between #setupValidatorUpdates effect and #initForm.
   */
  #updateNameValidators(periods: IFocus.Period[] | null, currentPeriodId?: string): void {
    this.form.controls.name.clearValidators();
    this.form.controls.name.setValidators([
      requiredTrimmedValidator,
      uniquePeriodNameValidator(periods, currentPeriodId),
      Validators.maxLength(this.#maxPeriodNameLength),
    ]);
    this.form.controls.name.updateValueAndValidity();
  }

  /**
   * Sets up reactive validator updates whenever the periods list changes.
   * Uses effect to automatically update validators when periods or current period changes.
   */
  #setupValidatorUpdates(): void {
    effect(
      () => {
        const periods = this.#focusService.periods();
        const currentPeriodId = this.payload()?.period?.id;

        this.#updateNameValidators(periods, currentPeriodId);
      },
      { injector: this.#injector }
    );
  }

  #initForm(): void {
    const periods = this.#focusService.periods();
    const currentPeriodId = this.payload()?.period?.id;

    this.form = this.#fb.group<IFocusForm.UpsertPeriod>(
      {
        id: this.#fb.nonNullable.control<string>(
          `${Date.now()}-${Math.floor(Math.random() * 10000)}`
        ),
        name: this.#fb.nonNullable.control(
          `New Period ${(this.#focusService.periods()?.length ?? 0) + 1}`,
          [
            requiredTrimmedValidator,
            uniquePeriodNameValidator(periods, currentPeriodId),
            Validators.maxLength(this.#maxPeriodNameLength),
          ]
        ),
        description: this.#fb.nonNullable.control<string | null>(null),
        startFrom: this.#fb.control<string | null>(null),
        endTo: this.#fb.control<string | null>(null),
        webSites: this.#fb.nonNullable.control(
          [],
          [arrayMinLengthValidator(), noUnactivatableWebsitesValidator]
        ),
        daysOfWeek: this.#fb.nonNullable.control([], arrayMinLengthValidator()),
        focusedTimes: this.#fb.nonNullable.control([]),
        isActive: this.#fb.nonNullable.control(false),
        setAsCurrentPeriod: this.#fb.nonNullable.control(false),
        sessionStartTime: this.#fb.control<Date | null>(null),
        blockBehaviour: this.#fb.nonNullable.control<BlockBehaviourType>(
          BLOCK_BEHAVIOUR_ENUM.BLOCK
        ),
      },
      { validators: timeRangeValidator('startFrom', 'endTo') }
    );
  }

  #loadPeriodData(): void {
    const periodData = this.payload()?.period;

    if (this.currentRoute() === VIEW_ENUM.ADD_PERIOD) {
      this.selectedTimeRanges.set([ALL_DAY_TIME_RANGE]);
      this.selectedDays.set([...WORK_DAYS_OF_WEEKS]);
      return;
    }

    if (this.currentRoute() === VIEW_ENUM.EDIT_PERIOD && periodData) {
      const startFromTime = periodData.startFrom
        ? this.#dateToTimeString(periodData.startFrom)
        : '';
      const endToTime = periodData.endTo ? this.#dateToTimeString(periodData.endTo) : '';

      this.form.patchValue({
        id: periodData.id,
        name: periodData.name,
        description: periodData.description ?? null,
        startFrom: startFromTime,
        endTo: endToTime,
        focusedTimes: periodData.focusedTimes,
        isActive: periodData.isActive,
        setAsCurrentPeriod: this.isCurrentPeriod(),
        sessionStartTime: periodData.sessionStartTime,
        blockBehaviour: periodData.blockBehaviour,
      });

      const matchingRange =
        TIME_RANGES.find(r => r.startFrom === startFromTime && r.endTo === endToTime) ??
        MANUAL_TIME_RANGE;
      this.selectedTimeRanges.set([matchingRange]);

      const selectedDays = ALL_DAYS_OF_WEEK.filter(day => periodData.daysOfWeek.includes(day.day));
      this.selectedDays.set(selectedDays);

      this.selectedWebSites.set(periodData.webSites);
    }
  }

  #dateToTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  protected normalizeWebsite(site: IFocus.WebSite): IFocus.WebSite {
    return {
      ...site,
      url: cleanUrlHelper(site.url),
    };
  }

  protected previewNormalizedWebsite(site: IFocus.WebSite | null): string | null {
    if (!site) {
      return null;
    }

    return cleanUrlHelper(site.url);
  }
}
