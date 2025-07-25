import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse, Role } from 'app/shared/api-models';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginService {
	private passwordPromptSubject = new Subject<string>();
	public role = new BehaviorSubject<Role>('guest');

	constructor(private http: HttpClient) {}

	login(password: string): Observable<LoginResponse> {
		return this.http.post<LoginResponse>('/api/login', { password });
	}

	openPasswordPrompt(): void {
		this.passwordPromptSubject.next('open');
	}

	onPasswordPrompted(): Observable<string> {
		return this.passwordPromptSubject.asObservable();
	}
}
