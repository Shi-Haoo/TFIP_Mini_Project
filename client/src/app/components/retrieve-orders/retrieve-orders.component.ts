import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OrderData } from 'src/app/models';
import { MerchantService } from 'src/app/services/merchant.service';
import { StorageService } from 'src/app/services/storage.service';
import {MatTable, MatTableDataSource} from '@angular/material/table'
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UpdateOrderComponent } from '../update-order/update-order.component';

@Component({
  selector: 'app-retrieve-orders',
  templateUrl: './retrieve-orders.component.html',
  styleUrls: ['./retrieve-orders.component.css']
})
export class RetrieveOrdersComponent implements OnInit, AfterViewInit{

  router = inject(Router)
  merchantSvc = inject(MerchantService)
  storageService = inject(StorageService)
  _snackBar = inject(MatSnackBar)
  dialog = inject(MatDialog)

  isLoggedIn: boolean = false
  filterActivated: boolean = false
  orderRecords: OrderData[] = []
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  
  // offset:number = 0
  // limit:number = 5
  // filter:string = "delivered"
  // currentPage:number = 1

  dataSource = new MatTableDataSource<OrderData>()
  displayedColumns: string[] = ['order_id','customer_name','customer_email','customer_contact','order_date','payment_status','delivery_status','comments','total_price','quantity','product','action']

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  
  ngOnInit(): void {
    
    this.loadTable()

  }

  ngAfterViewInit(): void {
    //MatSort component in Angular Material requires the MatTableDataSource to be fully initialized before it can be applied
    //dataSource has to be populated with data before applying the sorting functionality. ngAfterViewInit is called 
    //after view and child components are initialized. In this case, when view is rendered, it would mean data is already 
    //retrieved from server and initialize dataSource with it. So we can put MatSort here. We can also put this code in firstValueFrom.then()
    //instead of ngAfterViewInit because data will be retrieved and assigned to dataSource then.
    this.dataSource.sort = this.sort
  }

  //Global filter. By setting this.dataSource.filter to the filterValue, you are applying the filter to 
  //the dataSource using the default filterPredicate, which performs a global search on all columns. 
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
    this.filterActivated = true

    //reset the paginator to first page every filter request
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  
  openEditRecordDialog(i: number){

    const orderToUpdate = this.dataSource.data[i]
    console.info("selected order to update>>>", orderToUpdate)

    //UpdateOrderComponent will be called and displayed in Dialog Box
    //the data for row selected for edit will be passed to UpdateOrderComponent 
    //so that dialog box can display the data I want when dialog box opens
    const dialogRef = this.dialog.open(UpdateOrderComponent,{
      data: orderToUpdate
    })

    //subscribe to receive the response or data passed from the component displayed in the 
    //dialog after the dialog box closes
    dialogRef.afterClosed().subscribe((result)=>{
      
      if(result === 'cancel'){
        console.info("User clicked cancel")
      }
      
      else if(result === 'Successful'){
        console.info("Success message>>>", result)
        this.openSnackBar(`Update is ${result}`, "OK!")
        //make a call to server again to get updated data for table
        this.loadTable()
      }

      else if(result.status === 401 && this.storageService.getUser().token && this.storageService.getUser().userRole === 'ROLE_USER'){
        console.error("postUpdate Error>>>", result)
        this.openSnackBar("Error: 401 Unauthorized. You are not permitted to access this resource!","OK!")
        this.storageService.logout()
        this.storageService.isLoggedInSuccess.next(false)
        this.router.navigate(['/login'])
      }

      else if(result.status === 401 && this.storageService.getUser().token){
        console.error("postUpdate Error>>>", result)
        this.openSnackBar("JWTTokenMalformedException: JWT token has expired. Please login again","OK!")
        this.storageService.logout()
        this.storageService.isLoggedInSuccess.next(false)
        this.router.navigate(['/login'])
      }
      else if(result.status === 401){
        console.error('An error occurred:', result)
        this.openSnackBar(`An error occurred: ${result.error}\nStatus code: ${result.status}\n Unauthorized access/action`, "OK!")
      }
  
      else if(result.status === 404){
        console.error('An error occurred:', result)
        this.openSnackBar(`Error: ${result.status} ${result.statusText}\n No order found with the selected delivery status!`, "OK!")
      }
  
      else{
        console.error('An error occurred:', result)
        this.openSnackBar(`Error: ${result.status} ${result.statusText}`, "OK!")
      }
    })
  }

  private loadTable(): void{
    this.isLoggedIn = this.storageService.isLoggedIn()
    

    firstValueFrom(this.merchantSvc.retrieveOrdersByDeliveryStatus())
    .then((data: OrderData[])=>{
      //this.orderRecords = data
      //assign data retrieved from server to the dataSource
      this.dataSource.data = data
      //set the paginator. paginator will automatically update and adjust based on the number of items
      this.dataSource.paginator = this.paginator
      
    })
    .catch((error: HttpErrorResponse)=>{
    //if user alr logged in and have unauthorized error => token expired
    if(error.status === 401 && this.storageService.getUser().token && this.storageService.getUser().userRole === 'ROLE_USER'){
      console.error("postUpdate Error>>>", error)
      this.openSnackBar("Error: 401 Unauthorized. You are not permitted to access this resource!","OK!")
      this.storageService.logout()
      this.storageService.isLoggedInSuccess.next(false)
      this.router.navigate(['/login'])
    }
    else if(error.status === 401 && this.storageService.getUser().token){
      console.error("postUpdate Error>>>", error)
      this.openSnackBar("JWTTokenMalformedException: JWT token has expired. Please login again","OK!")
      this.storageService.logout()
      this.storageService.isLoggedInSuccess.next(false)
      this.router.navigate(['/login'])
    }
    else if(error.status === 401){
      console.error('An error occurred:', error)
      this.openSnackBar(`An error occurred: ${error.error}\nStatus code: ${error.status}\n Unauthorized access/action`, "OK!")
    }

    else if(error.status === 404){
      console.error('An error occurred:', error)
      this.openSnackBar(`Error: ${error.status} ${error.statusText}\n No order found with the selected delivery status!`, "OK!")
    }

    else{
      console.error('An error occurred:', error)
      this.openSnackBar(`Error: ${error.status} ${error.statusText}`,"OK!")
    }
    })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  //try using paginator first
  /*changeLimit(limit: any){
    //+ sign is used as a unary plus operator. It is used to 
    //convert the limit value from a string to a number.

    this.limit = +limit.target.value
    
    firstValueFrom(this.merchantSvc.retrieveOrdersByDeliveryStatus(this.offset, this.limit, this.filter))
        .then((data: OrderData[])=>{
          this.orderRecords = data

        })
        .catch((error: HttpErrorResponse)=>{
        //if user alr logged in and have unauthorized error => token expired
        if(error.status === 401 && this.storageService.getUser().token){
          console.error("postUpdate Error>>>", error)
          this.openSnackBar("JWTTokenMalformedException: JWT token has expired. Please login again","OK!")
          this.storageService.logout()
          this.storageService.isLoggedInSuccess.next(false)
          this.router.navigate(['/login'])
        }
        else if(error.status === 401){
          console.error('An error occurred:', error)
          this.openSnackBar(`An error occurred: ${error.error}\nStatus code: ${error.status}\n Unauthorized access/action`, "OK!")
        }

        else if(error.status === 404){
          console.error('An error occurred:', error)
          this.openSnackBar(`Error: ${error.status} ${error.statusText}\n No order found with the selected delivery status!`, "OK!")
        }

        else{
          console.error('An error occurred:', error)
          this.openSnackBar(JSON.stringify(error),"OK!")
        }
        })

  }*/

  //try using filter from matTable first
  /*
  changeFilter(selectedFilter: any){

    this.filter = selectedFilter.target.value
    console.info("Selected filter option>>>", this.filter)

    firstValueFrom(this.merchantSvc.retrieveOrdersByDeliveryStatus(this.offset, this.limit, this.filter))
        .then((data: OrderData[])=>{
          //this.orderRecords = data
          //assign data retrieved from server to the dataSource
          this.dataSource.data = data
          //set the paginator. paginator will automatically update and adjust based on the number of items
          this.dataSource.paginator = this.paginator

        })
        .catch((error: HttpErrorResponse)=>{
        //if user alr logged in and have unauthorized error => token expired
        if(error.status === 401 && this.storageService.getUser().token){
          console.error("postUpdate Error>>>", error)
          this.openSnackBar("JWTTokenMalformedException: JWT token has expired. Please login again","OK!")
          this.storageService.logout()
          this.storageService.isLoggedInSuccess.next(false)
          this.router.navigate(['/login'])
        }
        else if(error.status === 401){
          console.error('An error occurred:', error)
          this.openSnackBar(`An error occurred: ${error.error}\nStatus code: ${error.status}\n Unauthorized access/action`, "OK!")
        }

        else if(error.status === 404){
          console.error('An error occurred:', error)
          this.openSnackBar(`Error: ${error.status} ${error.statusText}\n No order found with the selected delivery status!`, "OK!")
        }

        else{
          console.error('An error occurred:', error)
          this.openSnackBar(JSON.stringify(error),"OK!")
        }
        })

  } */


//try using paginator first
/*
  changePage(num: number){
    
    if(num < 0 && this.currentPage > 1){
      
        console.info("CurrentPage>>> ", this.currentPage)
        this.currentPage += num
        this.offset = Math.max(0, this.offset - this.limit)

        firstValueFrom(this.merchantSvc.retrieveOrdersByDeliveryStatus(this.offset, this.limit, this.filter))
        .then((data: OrderData[])=>{
          this.orderRecords = data

        })
        .catch((error: HttpErrorResponse)=>{
        //if user alr logged in and have unauthorized error => token expired
        if(error.status === 401 && this.storageService.getUser().token){
          console.error("postUpdate Error>>>", error)
          this.openSnackBar("JWTTokenMalformedException: JWT token has expired. Please login again","OK!")
          this.storageService.logout()
          this.storageService.isLoggedInSuccess.next(false)
          this.router.navigate(['/login'])
        }
        else if(error.status === 401){
          console.error('An error occurred:', error)
          this.openSnackBar(`An error occurred: ${error.error}\nStatus code: ${error.status}\n Unauthorized access/action`, "OK!")
        }

        else if(error.status === 404){
          console.error('An error occurred:', error)
          this.openSnackBar(`Error: ${error.status} ${error.statusText}\n No order found with the selected delivery status!`, "OK!")
        }

        else{
          console.error('An error occurred:', error)
          this.openSnackBar(JSON.stringify(error),"OK!")
        }
        })

    }

    else if(num > 0 && this.currentPage >= 1){
      this.currentPage += num
      this.offset += this.limit

      firstValueFrom(this.merchantSvc.retrieveOrdersByDeliveryStatus(this.offset, this.limit, this.filter))
        .then((data: OrderData[])=>{
          this.orderRecords = data

        })
        .catch((error: HttpErrorResponse)=>{
        //if user alr logged in and have unauthorized error => token expired
        if(error.status === 401 && this.storageService.getUser().token){
          console.error("postUpdate Error>>>", error)
          this.openSnackBar("JWTTokenMalformedException: JWT token has expired. Please login again","OK!")
          this.storageService.logout()
          this.storageService.isLoggedInSuccess.next(false)
          this.router.navigate(['/login'])
        }
        else if(error.status === 401){
          console.error('An error occurred:', error)
          this.openSnackBar(`An error occurred: ${error.error}\nStatus code: ${error.status}\n Unauthorized access/action`, "OK!")
        }

        else if(error.status === 404){
          console.error('An error occurred:', error)
          this.openSnackBar(`Error: ${error.status} ${error.statusText}\n No order found with the selected delivery status!`, "OK!")
        }

        else{
          console.error('An error occurred:', error)
          this.openSnackBar(JSON.stringify(error),"OK!")
        }
        })

    }
  } */



  
}
