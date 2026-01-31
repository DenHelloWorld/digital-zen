import { Pipe, PipeTransform } from '@angular/core';
import { cleanUrlHelper } from '../helpers/clean-url.helper';

@Pipe({
  name: 'cleanUrl',
  standalone: true,
})
export class CleanUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return cleanUrlHelper(value);
  }
}
