import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  {
    path: 'members',
    renderMode: RenderMode.Server,
  },
  {
    path: 'members/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'missions',
    renderMode: RenderMode.Server,
  },
  {
    path: 'employees',
    renderMode: RenderMode.Server,
  },
  {
    path: 'economy',
    renderMode: RenderMode.Server,
  },
  {
    path: 'reputation',
    renderMode: RenderMode.Server,
  },
  {
    path: 'founders',
    renderMode: RenderMode.Server,
  },
];
