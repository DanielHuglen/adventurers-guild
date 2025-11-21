import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-landing-page',
	imports: [RouterModule],
	templateUrl: './landing-page.component.html',
	styleUrl: './landing-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {}
