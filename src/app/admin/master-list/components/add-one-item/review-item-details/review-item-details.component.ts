import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from './../../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';
import { AppState } from './../../../../../interfaces';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-review-item-details',
  templateUrl: './review-item-details.component.html',
  styleUrls: ['./review-item-details.component.scss']
})
export class ReviewItemDetailsComponent implements OnInit, OnDestroy {
  itemReviewForm: FormGroup;
  newItem$: Subscription;
  @Output() onBackClickEmit: EventEmitter<string> = new EventEmitter();
  displayDetails: {
    'store': string,
    'code':string ,
    'name':string,
    'brand':string,
    'category1':string,
    'category2':string,
    'category3':string,
    'itemPrice':string,
    'itemDescription':string,
    'weighted':string,
    'enabled':string,
  };
  private componentDestroyed: Subject<any> = new Subject();

  constructor(
    private adminService: AdminService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    if (sessionStorage.getItem('showItem')) {
      this.displayDetails = JSON.parse(sessionStorage.getItem('showItem'));
      this.initEmptyForm();
      this.itemReviewForm.patchValue({
        store: this.displayDetails.store,
        itemName: this.displayDetails.name,
        code: this.displayDetails.code,
        customBrand: this.displayDetails.brand,
        price: this.displayDetails.itemPrice,
        cat1: this.displayDetails.category1,
        cat2: this.displayDetails.category2,
        cat3: this.displayDetails.category3,
        isWeighted: this.displayDetails.weighted,
        isEnabled: this.displayDetails.enabled,
      });
    }
  }

  initEmptyForm(): void {
    this.itemReviewForm = this.fb.group({
      store: '',
      itemName: '',
      code: '',
      customBrand: '',
      price: '',
      cat1: '',
      cat2: '',
      cat3: '',
      isWeighted:'',
      isEnabled: '',
    });
  }

  saveItem(){
    if (sessionStorage.getItem('item')) {
      const toFormat = JSON.parse(sessionStorage.getItem('item'));
      const toSave = {
        name: toFormat.name,
        code: toFormat.code,
        brandName: toFormat.brand,
        price: toFormat.price,
        displayPrice: toFormat.price,
        category1: toFormat.category1,
        category2: toFormat.category2,
        category3: toFormat.category3,
        enabled: toFormat.enabled,
        weighted: toFormat.weighted,
        sizing:"medium",
        packageMinimum: 1000.0,
        packageIntervals: 200.0,
        hasVat: "",
        slug: this.slugGen(toFormat.name),
        imageKey: toFormat.code,
        isSenior: "",
        packaging: toFormat.price,
        partner_id: toFormat.partner_id,
      };
      this.adminService.addItem(toSave)
      .takeUntil(this.componentDestroyed)
      .subscribe(response => {
        sessionStorage.clear();
        if(response.message == "Saved") {
          setTimeout(() => {
            this.router.navigate(['/admin/manage-items/add-item']);
            this.onBackClickEmit.emit();
          }, 2000);
        }
      });
    } 
  }

  slugGen(name: string): string{
    var newString = name.toLowerCase().replace(/\s+/g,'-');
    newString = newString.replace(/[']/g,'-');
    return newString;
  }

  onBackBtn(): void {
    this.onBackClickEmit.emit();
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

}
