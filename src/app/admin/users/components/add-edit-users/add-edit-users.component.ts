import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AdminService } from './../../../services/admin.service';

@Component({
  selector: 'app-add-edit-users',
  templateUrl: './add-edit-users.component.html',
  styleUrls: ['./add-edit-users.component.scss']
})
export class AddEditUsersComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  initSub: Subscription;
  addEditUserForm: FormGroup;
  userData: any = null;
  activeUser: any;
  activePartner: any;
  operation: string;
  rolesList: Array<any> = [];
  filteredRoles: Array<any> = [];
  partnerList: Array<any> = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.activeUser = JSON.parse(localStorage.getItem('selleruser'));
    this.partnerList = JSON.parse(localStorage.getItem('partners'));
    this.activePartner = this.partnerList.find(partner =>
      partner.id === Number(this.activeUser.partner_id));
    this.initForm();
    this.initSub = this.adminService.getRolesList()
      .do((roles) => {
        this.rolesList = roles;
        this.filterRolesList(this.activeUser.partner_id);
      })
      .switchMapTo(this.route.params)
      .mergeMap((params: any) => {
        if (params.id) {
          this.operation = 'Edit';
          return this.adminService.getUser(params.id);
        } else {
          this.operation = 'Add';
          return Observable.of(false);
        }
      })
      .subscribe((userData: any) => {
        if (userData) {
          if (userData.message.toUpperCase() === 'FOUND') {
            this.userData = userData;
            this.addEditUserForm.patchValue({
              name: userData.name,
              email: userData.email,
              role: userData.role_id,
            });
            this.addEditUserForm.controls.username.reset({
              value: this.userData.username,
              disabled: true,
            });
            this.addEditUserForm.controls.partner.reset({
              value: userData.partner_id,
              disabled: this.activeUser.role_id !== 1,
            });
          }
        } else {
          this.addEditUserForm.patchValue({
            partner: this.activeUser.partner_id === 1 ? 0 : this.activeUser.partner_id,
            role: 0,
          });
        }
      });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
  }

  initForm(): void {
    this.addEditUserForm = this.fb.group({
      partner: ['', Validators.required],
      username: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      role: ['', Validators.compose([Validators.required, Validators.min(1)])],
    });
  }

  onSubmit(option?: string): void {
    const values = this.addEditUserForm.value;

    if (this.addEditUserForm.valid) {
      if (this.operation === 'Add') {
        const data = {
          username: values.username,
          email: values.email,
          name: values.name,
          role_id: Number(values.role),
          partner_id: Number(values.partner),
        };
        this.userSub = this.adminService.addUser(data).subscribe(response => {
          if (response.message === 'Saved') {
            if (option === 'Add1') {
              setTimeout(() => {
                this.router.navigate(['/admin/users/edit/', response.id]);
              }, 2000);
            } else {
              this.initForm();
            }
          }
        });
      } else {
        const data = {
          id: this.userData.id.toString(),
          email: values.email,
          name: values.name,
          role_id: Number(values.role),
        };
        this.userSub = this.adminService.updateUser(data).subscribe();
      }
    } else {
      const keys = Object.keys(values);
      keys.forEach(val => {
        const ctrl = this.addEditUserForm.controls[val];
        if (!ctrl.valid) {
          ctrl.markAsTouched();
        };
      });
      this.adminService.showErrorMsg('Validation Error');
    }
  }

  resetPassword(): void {
    this.userSub = this.adminService.resetPassword(this.userData.email).subscribe();
  }

  filterRolesList(partnerId): void {
    const [selectedPartner] = this.partnerList.filter((partner) =>
      partner.id === Number(partnerId));
    switch (selectedPartner.type) {
      case 'internal':
        if (this.activeUser.role_id === 1) {
          this.filteredRoles = this.rolesList;
        } else {
          // this.rolesList = roles;
          this.filteredRoles = this.rolesList.filter(role => role.name.indexOf('EOS') >= 0);
          const index = this.rolesList.findIndex((role) => role.name === 'EOS Developer');
          this.filteredRoles.splice(index, 1);
        }
        break;
      case 'buyer':
        this.filteredRoles = this.rolesList.filter(role => role.name.indexOf('Partner Buyer') >= 0);
        break;
      case 'seller':
        this.filteredRoles = this.rolesList.filter(role => role.name.indexOf('Partner Seller') >= 0);
        break;
    }
    this.addEditUserForm.patchValue({ role: 0 });
  }

  setUserStatus(): void {
    const data = {
      id: this.userData.id.toString(),
      enabled: !this.userData.enabled,
    };
    this.adminService.updateUser(data).subscribe(res => {
      if (res.message.toUpperCase() === 'UPDATED') {
        this.userData.enabled = !this.userData.enabled;
      }
    });
  }

}
