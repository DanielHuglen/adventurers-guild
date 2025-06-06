import { Routes } from '@angular/router';
import { MembersDeckComponent } from './components/member-page/members-deck/members-deck.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { MemberDetailsComponent } from './components/member-page/member-details/member-details.component';
import { charactersResolver } from './services/character.service';
import { MissionsDeckComponent } from './components/mission-page/missions-deck/missions-deck.component';
import { missionsResolver } from './services/mission.service';
import { MissionOverviewComponent } from './components/mission-page/mission-overview/mission-overview.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'members',
    component: MembersDeckComponent,
    resolve: {
      members: charactersResolver,
    },
  },
  {
    path: 'members/:id',
    component: MemberDetailsComponent,
  },
  {
    path: 'missions',
    component: MissionsDeckComponent,
    resolve: {
      missions: missionsResolver,
    },
  },
  {
    path: 'missions/:id',
    component: MissionOverviewComponent
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
