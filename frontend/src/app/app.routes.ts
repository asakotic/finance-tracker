import { Routes } from '@angular/router';
import { Login} from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Register } from './pages/register/register';
import { Form } from './pages/form/form';

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
    path: 'form',
    component: Form
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: '**',
    redirectTo: 'login'
  },
  {
    path: 'dashboard',
    component: Dashboard
  }
];