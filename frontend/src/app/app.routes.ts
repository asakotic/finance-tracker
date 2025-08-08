import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Register } from './pages/register/register';
import { Form } from './pages/form/form';
import { EditForm } from './pages/edit-form/edit-form';
import { publicGuard } from './guards/public-guard';
import { authGuard } from './guards/auth-guard-guard';

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
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    component: EditForm,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];