import { Routes } from '@angular/router';
import { MembersDeckComponent } from './components/members-deck/members-deck.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { MemberDetailsComponent } from './components/character-details/member-details.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'members',
    component: MembersDeckComponent,
  },
  {
    path: 'members/:id',
    component: MemberDetailsComponent,
  },
  {
    path: 'missions',
    redirectTo: '',
  },
  {
    path: 'employees',
    redirectTo: '',
  },
  {
    path: 'economy',
    redirectTo: '',
  },
  {
    path: 'reputation',
    redirectTo: '',
  },
  {
    path: 'founders',
    redirectTo: '',
  },
];
