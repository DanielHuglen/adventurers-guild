import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'level',
})
export class LevelPipe implements PipeTransform {
  transform(experience: number): number {
    return Math.floor(experience / 10);
  }
}
