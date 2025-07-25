import { Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs';

@Directive({
	selector: '[appDisableIfGuest]',
})
export class DisableIfGuestDirective implements OnDestroy {
	private sub: Subscription;

	constructor(private el: ElementRef, private renderer: Renderer2, private loginService: LoginService) {
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
