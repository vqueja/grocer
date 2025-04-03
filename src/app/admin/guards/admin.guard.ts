import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AdminService } from './../services/admin.service';


@Injectable()
export class AdminGuardService implements CanActivate {

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.adminService.isAuthenticated()) {
      this.router.navigate(
        ['/admin/login'],
        { queryParams: { returnUrl: state.url }}
      );
      return false;
    }
    return true;
  }
}
