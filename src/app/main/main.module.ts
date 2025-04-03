import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from './../shared/index';
import { LayoutModule } from './../layout/index';
import { FilterPipeStore } from './pipes/filter.pipe';
import { MainRoutes as routes } from './main.routes';

// 3rd Party
import { ModalModule } from 'ngx-bootstrap/modal';

// Components
import { MainComponent } from './main.component';



@NgModule({
  declarations: [
    MainComponent,
    FilterPipeStore
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    LayoutModule,
    ModalModule,
  ],
  exports: [],
  providers: [],

})
export class MainModule {}
