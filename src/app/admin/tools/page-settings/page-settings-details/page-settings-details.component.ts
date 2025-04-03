import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { ToolsService } from './../../services/tools.service';

@Component({
  selector: 'app-page-settings-details',
  templateUrl: './page-settings-details.component.html',
  styleUrls: ['./page-settings-details.component.scss']
})
export class PageSettingsDetailsComponent implements OnInit, OnDestroy {
  initSub: Subscription;
  form1Sub: Subscription;
  form2Sub: Subscription;
  submitSub: Subscription;
  pageSettingsForm: FormGroup;
  pageSettingData: any;
  operation: string;
  togglePreview = false;
  isPreviewChecked = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toolsService: ToolsService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.initForm();
    this.initSub = this.route.params
      .mergeMap((params: any) => {
        if (params.id) {
          this.operation = 'Edit';
          return this.toolsService.getPageSetting(params.id);
        } else {
          this.operation = 'Add';
          return Observable.of(false);
        }
      })
      .subscribe((pageSettingData: any) => {
        if (pageSettingData) {
          this.pageSettingData = pageSettingData;
          this.pageSettingsForm.patchValue(pageSettingData);
        }
      });
  }

  ngOnDestroy() {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
    if (this.form1Sub) {
      this.form1Sub.unsubscribe();
    }
    if (this.form2Sub) {
      this.form2Sub.unsubscribe();
    }
    if (this.submitSub) {
      this.submitSub.unsubscribe();
    }
  }

  initForm(): void {
    this.pageSettingsForm = this.fb.group({
      route: [null, Validators.required],
      contentUrl: '',
      contentText: '',
      isEnabled: 0,
      isPartialRouteMatch: 0,
      isPopup: 1,
      popupLimitPerSession: 0,
      isConfirmButton: 0,
      confirmButtonText: { value: '', disabled: true },
      isCheckbox: { value: 0, disabled: true },
      checkboxText: { value: '', disabled: true },
    });
    this.form1Sub = this.pageSettingsForm.get('isConfirmButton').valueChanges
      .subscribe((v) => {
        if (v) {
          this.pageSettingsForm.get('confirmButtonText').enable();
          this.pageSettingsForm.get('isCheckbox').enable();
          if (this.operation === 'Edit') {
            this.pageSettingsForm.patchValue({
              confirmButtonText: this.pageSettingData.confirmButtonText,
            });
          }
        } else {
          this.pageSettingsForm.get('confirmButtonText').disable();
          this.pageSettingsForm.get('isCheckbox').disable();
          this.pageSettingsForm.patchValue({
            confirmButtonText: '',
            isCheckbox: 0,
          });
        }
      });
      this.form2Sub = this.pageSettingsForm.get('isCheckbox').valueChanges
      .subscribe((v) => {
        if (v) {
          this.pageSettingsForm.get('checkboxText').enable();
          this.isPreviewChecked = false;
          if (this.operation === 'Edit') {
            this.pageSettingsForm.patchValue({
              checkboxText: this.pageSettingData.checkboxText,
            });
          }
        } else {
          this.pageSettingsForm.get('checkboxText').disable();
          this.isPreviewChecked = true;
          this.pageSettingsForm.patchValue({
            checkboxText: '',
          });
        }
      });
  }

  onSubmit(option?: string): void {
    const values = this.pageSettingsForm.getRawValue();
    values.isConfirmButton = values.isConfirmButton ? 1: 0;
    values.isCheckbox = values.isCheckbox ? 1: 0;
    if (!values.route) {
      this.toolsService.showErrorMsg('Route field cannot be empty');
      return;
    }
    if (!values.contentUrl) {
      this.toolsService.showErrorMsg('Content URL field cannot be empty');
      return;
    }
    if (this.operation === 'Add') {
      this.submitSub = this.toolsService.addPageSetting(values)
        .subscribe((result: any) => {
          if (option === 'Add&Edit') {
            this.router.navigate(['admin/tools/page-settings/edit', result.id]);
          } else {
            this.initForm();
          }
        });
    } else {
      const data = Object.assign(values, {
        id: this.pageSettingData.id,
      });
      this.submitSub = this.toolsService.updatePageSetting(data)
        .subscribe((result: any) => {
          if (result.message.toUpperCase() === 'UPDATED') {
          }
        })
    }
  }

}
