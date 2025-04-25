import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mission } from '../shared/mission-model';
import { first, Observable } from 'rxjs';
import { ResolveFn } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MissionService {
  constructor(private http: HttpClient) {}

  getMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>('/api/missions');
  }

  getMission(id: number): Observable<Mission> {
    return this.http.get<Mission>(`/api/missions/${id}`);
  }
}

export const missionsResolver: ResolveFn<Mission[]> = () => {
  return inject(MissionService).getMissions().pipe(first());
};
