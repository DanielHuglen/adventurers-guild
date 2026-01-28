import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface DndBeyondCharacterResponse {
	data: {
		decorations: {
			avatarUrl: string;
		};
		background: {
			definition: {
				name: string;
			};
		};
		classes: {
			definition: {
				name: string;
			};
			level: number;
		}[];
		age: number;
		eyes: string;
		gender: string;
		height: string;
		name: string;
		race: {
			baseName: string;
		};
		stats: {
			id: number;
			value: number;
		}[];
		bonusStats?: {
			id: number;
			value: number | null;
		}[];
		overrideStats?: {
			id: number;
			value: number | null;
		}[];
		modifiers?: {
			race?: DndBeyondModifier[];
			class?: DndBeyondModifier[];
			feat?: DndBeyondModifier[];
			item?: DndBeyondModifier[];
			background?: DndBeyondModifier[];
			condition?: DndBeyondModifier[];
		};
	};
}

export interface DndBeyondModifier {
	type?: string;
	subType?: string;
	value?: number;
}

export enum StatId {
	Strength = 1,
	Dexterity = 2,
	Constitution = 3,
	Intelligence = 4,
	Wisdom = 5,
	Charisma = 6,
}

@Injectable({
	providedIn: 'root',
})
export class FoundersService {
	private http = inject(HttpClient);

	private readonly dndBeyondProxyBaseUrl = '/api/dndbeyond/character';

	fetchDndBeyondCharacter(
		characterId: number,
		options?: {
			withCredentials?: boolean;
		},
	): Observable<DndBeyondCharacterResponse> {
		const url = `${this.dndBeyondProxyBaseUrl}/${characterId}`;
		return this.http.get<DndBeyondCharacterResponse>(url, {
			headers: new HttpHeaders({
				Accept: 'application/json',
			}),
			withCredentials: options?.withCredentials ?? false,
		});
	}

	/** Convenience wrapper for the provided example URL. */
	fetchExampleCharacter(): Observable<DndBeyondCharacterResponse> {
		return this.fetchDndBeyondCharacter(92039235);
	}
}
