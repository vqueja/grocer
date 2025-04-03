import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-addcategory',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
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
  bCategoriesAdded: boolean;

  constructor(
    private adminService: AdminService,
    private router: Router,
  ) { }

  ngOnInit() {
    //NOTE: dummy ID
    this.reader = new FileReader();
    this.csvData = [];
    this.bHasFile = true;
    this.bCategoriesAdded = true;

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
      let dArr = [];
      this.csvData = newCsv.slice(0, -1);
      newCsv = [];
      for( i = 0; i < this.csvData.length; i++){
        dArr = this.csvData[i].split(',');
        newCsv.push({
          name: dArr[1].replace(/'/g,""),
          level: dArr[2].replace(/'/g,""),
          category_id: dArr[3].replace(/'/g,""),
          dateCreated: dateCreated,
          dateUpdated: dateCreated
        });
      }
      var Obj = {...newCsv};
      this.createCategories(Obj);

    };
    this.reader.readAsText(input.files[0]);
    this.setLoader();
  }

  setLoader(){
    this.bCategoriesAdded = false;
    this.timer = Observable.timer(3000); // 5000 millisecond means 5 seconds
    this.subs = this.timer.subscribe(() => {
        // set showloader to false to hide loading div from view after 5 seconds
        this.bCategoriesAdded = true;
        this.router.navigate(['/admin']);
    });
  }

  createCategories(data){
    this.adminService.addCategories(data).subscribe();
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

    // localStorage.removeItem('order');
  }

}
