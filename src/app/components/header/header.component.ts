import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from 'app/services/login.service';
import { MetaService } from 'app/services/meta.service';
import { take } from 'rxjs';
import { AdjustDateFormComponent } from '../adjust-date-form/adjust-date-form.component';

@Component({
	selector: 'app-header',
	imports: [RouterModule, AsyncPipe, DatePipe, AdjustDateFormComponent],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
	metaService = inject(MetaService);
	loginService = inject(LoginService);

	@ViewChild('dialog') dialog: ElementRef<HTMLDialogElement> | undefined;

	role = this.loginService.role;
	currentDate = new Date();

	openPasswordPrompt(): void {
		this.loginService.openPasswordPrompt();
	}

	openAdjustDate(): void {
		this.dialog?.nativeElement.showModal();
	}

	handleAdjustedDate(newDate: Date): void {
		this.currentDate = newDate;
		this.dialog?.nativeElement.close();
	}

	constructor() {
		this.metaService
			.getCurrentDate()
			.pipe(take(1))
			.subscribe((date) => {
				this.currentDate = date;
			});
	}
}
