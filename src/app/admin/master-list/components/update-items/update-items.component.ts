import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-updateitems',
  templateUrl: './update-items.component.html',
  styleUrls: ['./update-items.component.scss']
})
export class UpdateItemsComponent implements OnInit {
  private timer: Observable<any>;
  private subs: Subscription;
  itemList: any;
  ordersShow: any;
  statusContainer: string[] = [];
  selected: string = "All";
  reader: any;
  csvInput: any;
  csvData: any;
  bHasError: boolean = false;
  bHasFile: boolean;
  bItemsAdded: boolean;
  itemData: any;

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
    this.itemData = [];

  }

  filterStatus(status){

  }

  convertFile(csvInput: any){
    const input = csvInput;
    var newCsv = [];
    var i;
    var txt;
    this.reader.onload = () => {
      let text = this.reader.result;
      let arr = text.split('\n');
      let fields = arr[0].split(',');
      arr.forEach(function(item, i) {
        if(i !== 0){
          if(!newCsv.includes(item)){
            newCsv.push(item);
          }
        }
      })
      let dArr = [];
      this.bHasFile = false;
      this.csvData = newCsv.slice(0, -1);
      newCsv = [];
      for( i = 0; i < this.csvData.length; i++){
        dArr = this.csvData[i].split(',');
        this.handleCSVData(fields,dArr);
      }
      var Obj = {...this.itemData};
      this.updateItems(this.itemData);

    };
    this.reader.readAsText(input.files[0],'ISO-8859-15');
    this.setLoader();
  }

  handleCSVData(fields:any, data: any){
    var dateCreated = Date.now();

    if (data.length > 1) {
      if (data.length == 2) {
        if(fields[1].toUpperCase() === "price".toUpperCase()) {
            this.itemData.push({
              code: data[0].replace(/'/g,""),
              price: Number(data[1].replace(/'/g,"")),
              displayPrice: Number(data[2].replace(/'/g,"")),
              dateUpdated: dateCreated
            });
        } if(fields[1].toUpperCase() === "name".toUpperCase()) {
            this.itemData.push({
              code: data[0].replace(/'/g,""),
              name: data[1].replace(/'/g,""),
              dateUpdated: dateCreated
            });
        } if(fields[1].toUpperCase() === "slug".toUpperCase()) {
            var slug = this.slugGen(data[1].replace(/'/g,""));
            this.itemData.push({
              code: data[0].replace(/'/g,""),
              slug: slug,
              dateUpdated: dateCreated
            });
        }
      } if(data.length > 2) {
          if(fields[1].toUpperCase() === "name".toUpperCase() && fields[2].toUpperCase() === "price".toUpperCase()){
            this.itemData.push({
              code: data[0].replace(/'/g,""),
              name: data[1].replace(/'/g,""),
              price: Number(data[2].replace(/'/g,"")),
              displayPrice: Number(data[2].replace(/'/g,"")),
              dateUpdated: dateCreated
            });
          }
      } else {
        this.bHasError = true;
      }
    }
  }

  setLoader(){
    this.bItemsAdded = false;
    this.timer = Observable.timer(3000); // 5000 millisecond means 5 seconds
    this.subs = this.timer.subscribe(() => {
        // set showloader to false to hide loading div from view after 5 seconds
       this.router.navigate(['admin/tools/manage-items']);
    });
  }

  slugGen(name: string): string{
    var newString = name.toLowerCase().replace(/\s+/g,'-');
    newString = newString.replace(/[']/g,'-');
    return newString;
  }

  updateItems(data){
    this.adminService.updateItems(data).subscribe();
  }


  enableUpdateBtn(csvInput: any){
    const input = csvInput;
    if(input){
      this.bHasFile = false;
    } else {
      this.bHasFile = true;
    }

  }


  ngOnDestroy() {
    this.reader = new FileReader();
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

}
