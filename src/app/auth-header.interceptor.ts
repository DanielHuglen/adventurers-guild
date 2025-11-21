import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { LoginService } from './services/login.service';
import { inject } from '@angular/core';

export const authHeaderInterceptor: HttpInterceptorFn = (req, next) => {
	const loginService = inject(LoginService);

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status === 403) {
				console.log('Forbidden request, triggering password prompt');

				loginService.openPasswordPrompt();
			}
			return throwError(() => error);
		}),
	);
};
