import { Injectable } from '@angular/core';
import { Toast, ToastType } from 'app/shared/meta-models';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
	public toastList = new BehaviorSubject<Toast[]>([]);

	createToast(toastMessage: string, toastType: ToastType = 'info'): void {
		const newToast = {
			id: Math.floor(Math.random() * 10000),
			message: toastMessage,
			type: toastType,
		};

		const currentToasts = this.toastList.getValue();
		this.toastList.next([...currentToasts, newToast]);
	}

	closeToast(toastId: number): void {
		let currentToasts = this.toastList.getValue();
		currentToasts = currentToasts.filter((toast) => toast.id !== toastId);
		this.toastList.next(currentToasts);
	}
}
