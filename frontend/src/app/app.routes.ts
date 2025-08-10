import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Register } from './pages/register/register';
import { Form } from './pages/form/form';
import { EditForm } from './pages/edit-form/edit-form';
import { publicGuard } from './guards/public-guard';
import { authGuard } from './guards/auth-guard-guard';
import { Advice } from './pages/advice/advice';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login,
    canActivate: [publicGuard]
  },
  {
    path: 'form',
    component: Form,
  },
  {
    path: 'register',
    component: Register,
    canActivate: [publicGuard]
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'advices',
    component: Advice,
  },
  {
    path: 'edit/:id',
    component: EditForm,
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];