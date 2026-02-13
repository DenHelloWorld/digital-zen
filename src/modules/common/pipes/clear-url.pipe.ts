import { cleanUrlHelper } from '../helpers/clean-url.helper';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cleanUrl',
  standalone: true,
})
export class CleanUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return cleanUrlHelper(value);
  }
}
