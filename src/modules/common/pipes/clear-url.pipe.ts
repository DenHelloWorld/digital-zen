import { Pipe, PipeTransform } from '@angular/core';

export const cleanUrlHelper = (value: string | null | undefined): string => {
  if (!value) return '';
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

@Pipe({
  name: 'cleanUrl',
  standalone: true
})
export class CleanUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return cleanUrlHelper(value);
  }
}
