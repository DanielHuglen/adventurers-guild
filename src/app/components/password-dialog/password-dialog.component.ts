import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from 'app/services/login.service';
import { LoginResponse } from 'app/shared/api-models';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-password-dialog',
	imports: [ReactiveFormsModule, FormsModule],
	templateUrl: './password-dialog.component.html',
	styleUrl: './password-dialog.component.scss',
})
export class PasswordDialogComponent implements OnDestroy {
	@ViewChild('dialog') dialog: ElementRef<HTMLDialogElement> | undefined;

	password: FormControl = new FormControl('');

	subscription: Subscription | undefined;

	constructor(private loginService: LoginService) {
		this.loginService.onPasswordPrompted().subscribe(() => {
			this.open();
		});
	}

	submit(): void {
		const password = this.password.value;
		this.password.reset();

		if (!password) {
			window.alert('Password cannot be empty');
			return;
		}

		this.loginService.login(password).subscribe({
			next: (response: LoginResponse) => {
				this.setPasswordCookie(password, response.role);
				this.loginService.role.next(response.role);
				this.dialog?.nativeElement.close();
			},
			error: () => {
				window.alert('Login failed: wrong password');
			},
		});
	}

	private open() {
		this.dialog?.nativeElement.showModal();
	}

	private setPasswordCookie(password: string, role = 'guest'): void {
		document.cookie = `authInfo=${encodeURIComponent(
			JSON.stringify({ apiPassword: password, role })
		)}; path=/; max-age=21600;`;
	}

	ngOnDestroy(): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}
}
