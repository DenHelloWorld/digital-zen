import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  COLOR_SCHEMA_ENUM,
  ColorSchemaType,
  ThemeService,
  ThemeSwitcherComponent,
  VIEW_ENUM,
  ViewType,
} from '../modules/common';
import { FocusComponent } from '../modules/focus/focus.component';
import { MenuComponent } from '../modules/menu/menu.component';
import { DzToastContainerComponent } from '../modules/common/components/toast-container/toast-container';

@Component({
  selector: 'dz-app',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    // components
    ThemeSwitcherComponent,
    FocusComponent,
    MenuComponent,
    DzToastContainerComponent,
  ],
})
export class App {
  readonly #themeService: ThemeService = inject(ThemeService);

  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;

  protected readonly currentViewType: WritableSignal<ViewType> = signal(VIEW_ENUM.FOCUS);

  protected readonly colorSchemes: typeof COLOR_SCHEMA_ENUM = COLOR_SCHEMA_ENUM;
  protected readonly viewTypes: typeof VIEW_ENUM = VIEW_ENUM;

  protected setViewType(viewType: ViewType) {
    this.currentViewType.set(viewType);
  }

  // logout(): void {
  //   chrome.identity.getAuthToken({ interactive: false }, (result) => {
  //     if (result?.token) {
  //       chrome.identity.removeCachedAuthToken({ token: result.token }, () => {
  //         console.log('Токен удален из кеша. Теперь можно войти заново.');
  //       });
  //     }
  //   });
  // }
  //
  // loginWithGoogle(): void {
  //   if (!chrome?.identity) {
  //     console.warn('Chrome identity API is not available.');
  //     return;
  //   }
  //
  //   chrome.identity.getAuthToken(
  //     { interactive: true },
  //     /**
  //      * Не совпадает типизация из установленіх @types/chrome с реальной в документации
  //      * https://developer.chrome.com/docs/extensions/how-to/integrate/oauth?hl=ru
  //      * */
  //     (token) => {
  //       console.log('Результат вызова identity API:', token);
  //       // TODO: Обработка полученного токена
  //       /**
  //        * Для дебага можно в постмане сделать запрос к Google API с этим токеном
  //        * GET https://www.googleapis.com/oauth2/v3/userinfo
  //        * Headers:
  //        * Authorization: Bearer <token>
  //        */
  //
  //       if (chrome.runtime.lastError) {
  //         console.warn('Ошибка Chrome Runtime:', chrome.runtime.lastError.message);
  //         return;
  //       }
  //     }
  //   );
  // }
}
