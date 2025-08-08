import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { UserService } from '../services/user-service';

export const publicGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.isLoggedIn$.pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    })
  );
};