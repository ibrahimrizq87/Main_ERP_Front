// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private _AuthService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this._AuthService.getMyInfo().pipe(
      map((response) => {
        const userRole = response?.data?.user?.role;
        const allowedRoles = route.data['roles'] as Array<string>;
        if (allowedRoles && allowedRoles.includes(userRole)) {
          return true;
        }

        if (userRole === 'worker'|| userRole === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (userRole === 'client') {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/login']);
        }

        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
