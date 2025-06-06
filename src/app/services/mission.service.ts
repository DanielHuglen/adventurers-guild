import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mission } from '../shared/mission-model';
import { first, Observable } from 'rxjs';
import { ResolveFn } from '@angular/router';
import { Character } from 'app/shared/character-models';

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

	getDispatchedMembers(id: number): Observable<Character[]> {
		return this.http.get<Character[]>(`/api/missions/${id}/dispatched-members`);
	}
}

export const missionsResolver: ResolveFn<Mission[]> = () => {
	return inject(MissionService).getMissions().pipe(first());
};
