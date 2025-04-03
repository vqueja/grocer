import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

// Components
import { AppComponent } from './app.component';

// Routes
import { routes } from './app.routes';
// Providers
import { Globals } from './globals';
// Modules
import { SharedModule } from './shared/index';
import { LayoutModule } from './layout/index';
import { CoreModule } from './core/index';
import { MainModule } from './main/main.module';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducer } from './app.reducers';

// adding rx operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/take';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    StoreModule.provideStore(reducer),
    BrowserModule,
    FormsModule,
    HttpModule,
    LayoutModule,
    CoreModule,
    MainModule,
    SharedModule,
    StoreDevtoolsModule.instrumentOnlyWithExtension({
      maxAge: 10
    })
  ],
  providers: [
    Globals
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
