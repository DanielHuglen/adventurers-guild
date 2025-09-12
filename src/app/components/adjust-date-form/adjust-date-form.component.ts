import { Component, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaService } from 'app/services/meta.service';
import { take } from 'rxjs';

@Component({
	selector: 'app-adjust-date-form',
	imports: [ReactiveFormsModule],
	templateUrl: './adjust-date-form.component.html',
	styleUrl: './adjust-date-form.component.scss',
})
export class AdjustDateFormComponent {
	metaService = inject(MetaService);
	adjustedDate = output<Date>();

	currentDate = input.required<Date>();

	newDate = new FormControl('', [Validators.required]);

	ngOnInit(): void {
		this.newDate.setValue(new Date(this.currentDate()).toISOString().slice(0, 10));
	}

	setNewDate(): void {
		if (this.newDate.valid) {
			const dateValue = new Date(this.newDate.value as string);
			this.metaService
				.setCurrentDate(dateValue)
				.pipe(take(1))
				.subscribe((response) => {
					console.log('Date updated successfully:', response);
					this.adjustedDate.emit(dateValue);
				});
		}
	}
}
