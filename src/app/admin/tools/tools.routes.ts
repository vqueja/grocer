import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuardService } from '../guards/admin.guard';
import { RoleGuardService } from '../guards/role.guard';

import { ManageTimeslotComponent } from './manage-timeslot/manage-timeslot.component';
import { PageSettingsComponent } from './page-settings/page-settings.component';
import { PageSettingsDetailsComponent } from './page-settings/page-settings-details/page-settings-details.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: 'manage-timeslot',
    component: ManageTimeslotComponent,
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1, 2, 3]
    }
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1, 2]
    }
  },
  {
    path: 'page-settings',
    component: PageSettingsComponent,
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1, 2, 3]
    }
  },
  {
    path: 'page-settings/edit/:id',
    component: PageSettingsDetailsComponent,
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1, 2, 3]
    }
  },
  {
    path: 'page-settings/add',
    component: PageSettingsDetailsComponent,
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1, 2, 3]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoute { }
