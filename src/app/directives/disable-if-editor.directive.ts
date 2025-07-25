import { Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs';

@Directive({
	selector: '[appDisableIfEditor]',
})
export class DisableIfEditorDirective implements OnDestroy {
	private sub: Subscription;

	constructor(private el: ElementRef, private renderer: Renderer2, private loginService: LoginService) {
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
