import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cleanUrl',
  standalone: true
})
export class CleanUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    try {
      return  new URL(value).origin;
    } catch  {
      return value;
    }
  }
}
