import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MetaService {
	constructor(private http: HttpClient) {}

	getCurrentDate(): Observable<Date> {
		return this.http.get<Date>('/api/date');
	}
}
