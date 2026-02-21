import { DzToastService } from '../components';
import { logger } from '../helpers/logger';
import { Directive, HostListener, inject, input } from '@angular/core';

@Directive({
  selector: '[dzCopy]',
  standalone: true,
})
export class CopyToClipboardDirective {
  readonly #toasterService = inject(DzToastService);
  readonly #logger = logger.createLogger('CopyToClipboardDirective');

  public readonly value = input.required<string | number>({ alias: 'dzCopy' });

  @HostListener('click', ['$event'])
  async onClick(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const textToCopy = String(this.value());

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.#toasterService.show({
        durationInMs: 1000,
        message: `Copied ${textToCopy}`,
      });
      this.#logger.info(`Copied ${textToCopy}`);
    } catch (err) {
      this.#logger.error(err);
    }
  }
}
