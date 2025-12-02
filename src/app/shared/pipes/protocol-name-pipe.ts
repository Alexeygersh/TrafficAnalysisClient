import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'protocolName'
})
export class ProtocolNamePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
