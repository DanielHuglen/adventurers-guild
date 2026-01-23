import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { LoginService } from './services/login.service';
import { inject } from '@angular/core';

export const authHeaderInterceptor: HttpInterceptorFn = (req, next) => {
	const loginService = inject(LoginService);

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status === 403) {
				if (error.url?.includes('dndbeyond')) {
					window.alert('The DnD Beyond character must be set to public to be accessed.');
				} else {
					loginService.openPasswordPrompt();
				}
			}
			return throwError(() => error);
		}),
	);
};
