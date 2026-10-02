import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authHeaderInterceptor } from './auth-header.interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(
			routes,
			withViewTransitions(),
			withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
		),
		provideClientHydration(),
		provideHttpClient(withFetch(), withInterceptors([authHeaderInterceptor])),
	],
};
