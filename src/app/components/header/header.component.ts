import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from 'app/services/login.service';

@Component({
	selector: 'app-header',
	imports: [RouterModule, AsyncPipe],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
	loginService = inject(LoginService);
	role = this.loginService.role;

	openPasswordPrompt(): void {
		this.loginService.openPasswordPrompt();
	}
}
