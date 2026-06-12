import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private platformId = inject(PLATFORM_ID);

	/** The active theme. Reflected onto <html data-theme="…"> and persisted. */
	readonly theme = signal<Theme>(this.resolveInitialTheme());

	toggle(): void {
		this.set(this.theme() === 'dark' ? 'light' : 'dark');
	}

	set(theme: Theme): void {
		this.theme.set(theme);

		if (!isPlatformBrowser(this.platformId)) {
			return;
		}

		document.documentElement.dataset['theme'] = theme;
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// Ignore storage failures (private mode, quota, etc.)
		}
	}

	/**
	 * On the browser the theme has already been applied to <html> by the inline
	 * boot script in index.html (avoids a flash of the wrong theme). We read it
	 * back so the service's signal matches the DOM. On the server we default to
	 * light, since there is no OS preference or storage to consult.
	 */
	private resolveInitialTheme(): Theme {
		if (!isPlatformBrowser(this.platformId)) {
			return 'light';
		}
		return document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';
	}
}
