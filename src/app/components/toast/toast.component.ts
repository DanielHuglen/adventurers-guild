import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from 'app/services/toast.service';
import { Toast } from 'app/shared/meta-models';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-toast',
	imports: [NgClass],
	templateUrl: './toast.component.html',
	styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit, OnDestroy {
	toastService = inject(ToastService);

	currentToasts: Toast[] = [];

	subscription$: Subscription = new Subscription();

	ngOnInit(): void {
		this.subscription$ = this.toastService.toastList.subscribe((toasts) => {
			this.currentToasts = toasts;
		});
	}

	ngOnDestroy(): void {
		this.subscription$.unsubscribe();
	}
}
