import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, Observable } from 'rxjs';
import { Character } from '../shared/character-models';
import { CharacterBonusUpdateRequest, CharacterBonusUpdateResponse } from '../shared/api-models';
import { ResolveFn } from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class CharacterService {
	private http = inject(HttpClient);


	getMembers(): Observable<Character[]> {
		return this.http.get<Character[]>('/api/members');
	}

	getMemberIds(): Observable<number[]> {
		return this.http.get<number[]>('/api/members/ids');
	}

	getMember(id: number): Observable<Character> {
		return this.http.get<Character>(`/api/members/${id}`);
	}

	getAvailableMembers(): Observable<Character[]> {
		return this.http.get<Character[]>('/api/members/available');
	}

	updateMemberBonus(id: number, updateRequest: CharacterBonusUpdateRequest): Observable<CharacterBonusUpdateResponse> {
		return this.http.put<CharacterBonusUpdateResponse>(`/api/members/${id}/bonus`, updateRequest);
	}
}

export const charactersResolver: ResolveFn<Character[]> = () => {
	return inject(CharacterService).getMembers().pipe(first());
};
