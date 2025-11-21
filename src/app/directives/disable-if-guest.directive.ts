import { Directive, ElementRef, OnDestroy, Renderer2, inject } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs';

@Directive({
	selector: '[appDisableIfGuest]',
})
export class DisableIfGuestDirective implements OnDestroy {
	private el = inject(ElementRef);
	private renderer = inject(Renderer2);
	private loginService = inject(LoginService);

	private sub: Subscription;

	constructor() {
		this.sub = this.loginService.role.subscribe((role) => {
			const isGuest = !role || role === 'guest';
			this.renderer.setProperty(this.el.nativeElement, 'disabled', isGuest);
			this.renderer.setProperty(this.el.nativeElement, 'title', 'Log in as editor to edit');
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
