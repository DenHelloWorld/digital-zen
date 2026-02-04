import { Pipe, PipeTransform } from '@angular/core';
import { cleanProtocolHelper } from '../helpers/clean-protocol.helper';

/**
 * Pipe that uses cleanProtocolHelper to remove http:// or https://
 * * @example
 * {{ 'https://google.com' | removeProtocol }} // returns 'google.com'
 */
@Pipe({
  name: 'removeProtocol',
  standalone: true,
})
export class RemoveProtocolPipe implements PipeTransform {
  /**
   * @param value - The URL string to clean.
   * @returns The string without the protocol, processed by cleanProtocolHelper.
   */
  transform(value: string | null | undefined): string {
    return cleanProtocolHelper(value);
  }
}
