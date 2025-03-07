import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Character } from '../shared/character-models';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  constructor(private http: HttpClient) {}

  getMembers(): Observable<Character[]> {
    return this.http.get<Character[]>('/api/members');
  }

  getMemberIds(): Observable<number[]> {
    return this.http.get<number[]>('/api/members/ids');
  }

  getMember(id: number): Observable<Character> {
    return this.http.get<Character>(`/api/members/${id}`);
  }
}
