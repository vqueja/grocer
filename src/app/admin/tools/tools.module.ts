import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToolsRoute } from './tools.routes';
import { AdminModule } from '../admin.module';

import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDropdownModule } from 'ngx-bootstrap';

import { ToolsService } from './services/tools.service';  

import { ManageTimeslotComponent } from './manage-timeslot/manage-timeslot.component';
import { PageSettingsComponent } from './page-settings/page-settings.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { SettingsComponent } from './settings/settings.component';
import { PageSettingsDetailsComponent } from './page-settings/page-settings-details/page-settings-details.component';
 


@NgModule({
  imports: [
    CommonModule,
    ToolsRoute,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    BsDropdownModule.forRoot(),
  ],
  declarations: [
    ManageTimeslotComponent,
    PageSettingsComponent,
    SchedulerComponent,
    SettingsComponent,
    PageSettingsDetailsComponent,
  ],
  providers: [
    ToolsService
  ]
})
export class ToolsModule { }
