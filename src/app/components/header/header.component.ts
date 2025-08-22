import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from 'app/services/login.service';
import { MetaService } from 'app/services/meta.service';

@Component({
	selector: 'app-header',
	imports: [RouterModule, AsyncPipe, DatePipe],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
	loginService = inject(LoginService);
	role = this.loginService.role;
	currentDate = new Date();

	openPasswordPrompt(): void {
		this.loginService.openPasswordPrompt();
	}

	constructor(public metaService: MetaService) {}
}
