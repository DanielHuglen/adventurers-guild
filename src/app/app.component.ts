import { AfterViewInit, Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PasswordDialogComponent } from './components/password-dialog/password-dialog.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginService } from './services/login.service';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, HeaderComponent, PasswordDialogComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
	loginService = inject(LoginService);
	platformId = inject(PLATFORM_ID);

	title = 'adventurers-guild';

	ngAfterViewInit(): void {
		if (isPlatformBrowser(this.platformId)) {
			const cookie = document?.cookie.split('; ').find((row) => row.startsWith('authInfo='));

			if (cookie) {
				const authInfo = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
				this.loginService.role.next(authInfo.role || 'guest');
			}
		}
	}
}
