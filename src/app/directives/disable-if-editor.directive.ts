import { Directive, ElementRef, inject, OnDestroy, Renderer2 } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs';

@Directive({
	selector: '[appDisableIfEditor]',
})
export class DisableIfEditorDirective implements OnDestroy {
	el = inject(ElementRef);
	renderer = inject(Renderer2);
	loginService = inject(LoginService);

	private sub: Subscription;

	constructor() {
		this.sub = this.loginService.role.subscribe((role) => {
			const isEditor = role === 'editor';
			this.renderer.setProperty(this.el.nativeElement, 'disabled', isEditor);
			this.renderer.setProperty(this.el.nativeElement, 'title', 'Log in as admin to edit');
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
