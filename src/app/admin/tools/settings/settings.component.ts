import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription'
import { AdminService } from './../../services/admin.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings$: Subscription;
  settingsContainer: Array<any>;
  currentSettings: any;
  bDisableSave: boolean
  tobeSaved: any;

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.tobeSaved = [];
    this.bDisableSave = true;
    this.settings$ = this.adminService.getSettings().subscribe(settings => {
      this.settingsContainer = settings;
      console.log(this.settingsContainer);
    });
  }

  updateSettingValue(e, i){
    this.bDisableSave = false;
    if(this.settingsContainer[i].value !== e.srcElement.value){
      this.settingsContainer[i].value = Number(e.srcElement.value)
      this.tobeSaved.push(this.settingsContainer[i]);
    }
    console.log(this.settingsContainer[i]);
  }

  saveSettings(){
    var Obj = {...this.tobeSaved};
    console.log(Obj);
    for(const key in Obj){
      this.adminService.saveSettings(Obj[key]).subscribe();
    }

  }


}
