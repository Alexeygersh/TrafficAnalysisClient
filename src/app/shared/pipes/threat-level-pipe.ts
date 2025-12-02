import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'threatLevel'
})
export class ThreatLevelPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
