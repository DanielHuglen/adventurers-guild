import { Component, signal } from '@angular/core';
import { FounderCardComponent } from './founder-card/founder-card.component';

@Component({
	selector: 'app-founders-page',
	imports: [FounderCardComponent],
	templateUrl: './founders-page.component.html',
	styleUrl: './founders-page.component.scss',
})
export class FoundersPageComponent {
	selectedFounderId = signal<number | null>(null);
}
