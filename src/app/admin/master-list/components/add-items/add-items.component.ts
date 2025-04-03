import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-additems',
  templateUrl: './add-items.component.html',
  styleUrls: ['./add-items.component.scss']
})
export class AddItemsComponent implements OnInit {
  private timer: Observable<any>;
  private subs: Subscription;
  orders: any;
  ordersSub: Subscription;
  orderSub: Subscription;
  orderItem$: Subscription;
  orderIndex$: any;
  orderItems: any;
  itemList: any;
  ordersShow: any;
  statusContainer: string[] = [];
  selected: string = "All";
  reader: any;
  csvInput: any;
  csvData: any;
  bHasFile: boolean;
  bItemsAdded: boolean;

  constructor(
    private adminService: AdminService,
    private router: Router,
  ) { }

  ngOnInit() {
    //NOTE: dummy ID
    this.reader = new FileReader();
    this.csvData = [];
    this.bHasFile = true;
    this.bItemsAdded = true;

  }

  filterStatus(status){

  }

  convertFile(csvInput: any){
    var dateCreated = Date.now();
    const input = csvInput;
    var newCsv = [];
    var i;
    var txt;
    this.reader.onload = () => {
      let text = this.reader.result;
      let arr = text.split('\n');
      arr.forEach(function(item, i) {
        if(i !== 0){
          if(!newCsv.includes(item)){
            newCsv.push(item);
          }
        }
      })

      this.bHasFile = false;
      this.csvData = newCsv.slice(0, -1);
      for( i = 0; i < this.csvData.length; i++){
        let dArr = [];
        dArr = this.csvData[i].split(',');
        var name = dArr[1] ? dArr[1].replace(/'/g,"") : "no name";
        var cat1 = dArr[4] ? dArr[4].replace(/'/g,"") : 0;
        var cat2 = dArr[5] ? dArr[5].replace(/'/g,"") : 0;
        var cat3 = dArr[6] ? dArr[6].replace(/'/g,"") : 0;
        var price = dArr[2] ? Number(dArr[2].replace(/'/g,"")) : 0.00;
        var brand = dArr[3] ? dArr[3].replace(/'/g,"") : "";
        var enabled = 0;
        if (price > 0) {
          enabled = 1;
        }
        if (dArr[0]) {
          newCsv.push({
            code: dArr[0].replace(/'/g,""),
            name: name,
            brandName: brand,
            price: Number(price),
            displayPrice: Number(price),
            hasVat: null,
            isSenior: null,
            weighted: null,
            packaging: Number(price),
            packageMeasurement: 0,
            sizing: 'medium',
            packageMinimum: 1000.00,
            packageIntervals: 200.0,
            availableOn: 0,
            slug: this.slugGen(name),
            imageKey: dArr[0].replace(/'/g,""),
            enabled: enabled,
            category1: Number(cat1),
            category2: Number(cat2),
            category3: Number(cat3),
            partner_id: 0,
            dateCreated: dateCreated,
            dateUpdated: dateCreated
          });
        }
      }
      var Obj = {...newCsv};
      this.addItems(Obj);

    };
    this.reader.readAsText(input.files[0],'ISO-8859-1');
    this.setLoader();
  }

  setLoader(){
    this.bItemsAdded = false;
    this.timer = Observable.timer(3000); // 5000 millisecond means 5 seconds
    this.subs = this.timer.subscribe(() => {
        // set showloader to false to hide loading div from view after 5 seconds
       this.router.navigate(['/admin/tools/manage-items']);
    });
  }

  addItems(data: any){
    this.adminService.addItems(data).subscribe();
  }

  slugGen(name: string): string{
    var newString = name.toLowerCase().replace(/\s+/g,'-');
    newString = newString.replace(/[']/g,'-');
    return newString;
  }

  enableAddBtn(csvInput: any){
    const input = csvInput;
    if(input){
      this.bHasFile = false;
    } else {
      this.bHasFile = true;
    }

  }


  ngOnDestroy() {
    this.reader = new FileReader();
    // localStorage.removeItem('order');
  }

}
