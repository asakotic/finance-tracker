import { Routes } from '@angular/router';
import { Login} from './pages/login/login';
import { Layout} from './pages/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
// import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      // {
      //   path: 'settings',
      //   component: SettingsComponent
      // },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];