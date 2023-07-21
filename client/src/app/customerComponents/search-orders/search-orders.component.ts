import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { OrderData, UpdateOrderStatus } from 'src/app/models';
import { CustomerStorageService } from 'src/app/services/customer-storage.service';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderDialogComponent } from '../order-dialog/order-dialog.component';
import { PaymentStatusDialogComponent } from '../payment-status-dialog/payment-status-dialog.component';

@Component({
  selector: 'app-search-orders',
  templateUrl: './search-orders.component.html',
  styleUrls: ['./search-orders.component.css']
})


export class SearchOrdersComponent implements OnInit{

  ACKNOWLEDGEMENT_MSG = "Thank you for confirming the receipt of your ordered item. We are glad to hear that it has arrived safely."

  orderId: string = ""
  orderNotFound: boolean = true
  searchForm!: FormGroup
  totalPrice: number = 0
  updateOrderStatus: UpdateOrderStatus = {orderId:"", paymentStatus:"", deliveryStatus: ""}
  stripe!: Stripe|null 
  
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  customerSvc = inject(CustomerService)
  customerStorageSvc = inject(CustomerStorageService)
  _snackBar = inject(MatSnackBar)
  fb: FormBuilder = inject(FormBuilder)
  activatedRoute = inject(ActivatedRoute)
  dialog = inject(MatDialog)

  dataSource = new MatTableDataSource<OrderData>()
  displayedColumns: string[] = ['order_id','customer_name','order_date','product','quantity','total_price','delivery_status']

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
      
    if(this.customerStorageSvc.getOrderId() !== ""){
      this.orderId = this.customerStorageSvc.getOrderId()
      this.loadTable()
    }

    this.searchForm = this.createSearchForm(this.orderId)

  }

  ngAfterViewInit(): void {
    //MatSort component in Angular Material requires the MatTableDataSource to be fully initialized before it can be applied
    //dataSource has to be populated with data before applying the sorting functionality. ngAfterViewInit is called 
    //after view and child components are initialized. In this case, when view is rendered, it would mean data is already 
    //retrieved from server and initialize dataSource with it. So we can put MatSort here. We can also put this code in firstValueFrom.then()
    //instead of ngAfterViewInit because data will be retrieved and assigned to dataSource then.
    this.dataSource.sort = this.sort
  }

  searchOrder(){
    this.orderId = this.searchForm.value.orderId
    console.info("order id to search >>>", this.searchForm.value.orderId)
    this.loadTable()
  }

  changeDeliveryStatus(){

    this.updateOrderStatus.orderId = this.orderId
    this.updateOrderStatus.deliveryStatus = 'delivered'

    firstValueFrom(this.customerSvc.updateDeliveryStatus(this.updateOrderStatus))
    .then((resp)=>{
      this.openSnackBar(this.ACKNOWLEDGEMENT_MSG,"OK!")
      
      //Need to use return keyword for proper chaining of .then(). Using return keyword allows the subsequent 
      //.then() to wait for the returned promise to resolve before proceeding. 
      //This allows for proper sequencing and handling of the asynchronous operations. If we don't use return keyword,
      //the subsequent .then() in loadTable() is not aware of the asynchronous operation in this current callback. As a result, .then() 
      //in loadTable() will execute immediately without waiting for any asynchronous task in the first .then() to complete.
      //can remove the return keyword to see what happens.  
      return this.loadTable()
    })
    .catch((error: HttpErrorResponse)=>{
      console.error('An error occurred:', error)
      this.openSnackBar(`Error: ${error.status} ${error.statusText}`, "OK")
    })
  }

  private loadTable(): void{

    firstValueFrom(this.customerSvc.getOrderByIdAndDeliveryStatus(this.orderId))
    .then((data: OrderData[])=>{

      this.orderNotFound = false

      //recalculate the total price of all items in an order id
      this.totalPrice = 0
      for(let order of data){
        this.totalPrice += order.total_price
      }

      //assign data retrieved from server to the dataSource
      this.dataSource.data = data
      //set the paginator. paginator will automatically update and adjust based on the number of items
      this.dataSource.paginator = this.paginator

      //For online payment. 
    if(this.customerStorageSvc.getCheckoutDetails().paymentMode === "online_payment"){
      
      this.checkStatus()
    }
    })
    .catch((error: HttpErrorResponse)=>{
      if(error.status === 404){
        this.orderNotFound = true
        //reset dataSource data back to empty array if no matching record found. Without resetting, dataSource data will still 
        //be assigned previously matched order record and will display it in table
        this.dataSource.data = []
        this.totalPrice = 0
        console.error('An error occurred:', error)
        this.openSnackBar(`Error: ${error.status} ${error.statusText}! No pending order found with order id: ${this.orderId}`, "OK!") 
              
      }

      else{
        console.error('An error occurred:', error)
      }
    })

  }

  private createSearchForm(orderId: string): FormGroup{

    return this.fb.group({
      orderId: this.fb.control<string>(orderId !== "" ? orderId :'')
    })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  //When Stripe redirects the customer to the return_url, the payment_intent_client_secret query parameter is 
  //appended by Stripe.js. Use this to retrieve the PaymentIntent to determine what to show to your customer.
  checkStatus(){
      
    //let sideNav cart in AppComponent know cart has been deleted from session
    this.customerStorageSvc.updatedCart.next([])

     //Use this to check payment status instead of retrieving payment intent. Backend server has webhook to update payment status
     //into database base on the payment intent status. So payment status obtained here is updated. 
     //if payment is processing, the payment_status in sql db will be "processing"
      console.info("datasource data >>>", this.dataSource.data)
      //just need to check the first data because all items belong to same order id. If one item not paid, it means entire order 
      //for that order id is not paid
        console.info("ppayment status>>>", this.dataSource.data[0].payment_status)
        if(this.dataSource.data[0].payment_status === "paid"){
          const dialogRef = this.dialog.open(OrderDialogComponent,{
            data: {success: true, orderId: this.customerStorageSvc.getOrderId()}
          })

          //delete cart from session once user successfully checkout
          this.customerStorageSvc.deleteCart()
          
          //delete customer particulars
          this.customerStorageSvc.deleteCheckoutDetails()
          //delete PaymentIntent Id
          this.customerStorageSvc.deletePaymentIntentId()
          //delete order id
          this.customerStorageSvc.deleteOrderId()
          //delete record that order is inserted into sql
          this.customerStorageSvc.deleteInsertOrderStatus()
        }

        else if(this.dataSource.data[0].payment_status === "processing"){
          const dialogRef = this.dialog.open(PaymentStatusDialogComponent,{
            data: {processing: true, orderId: this.customerStorageSvc.getOrderId(), paymentStatus:"Payment Processing"}
          })

          //delete cart from session once user successfully checkout
          this.customerStorageSvc.deleteCart()
          //let sideNav cart in AppComponent know cart has been deleted from session
          //this.customerStorageSvc.updatedCart.next([])
          //delete customer particulars
          this.customerStorageSvc.deleteCheckoutDetails()
          //delete PaymentIntent Id
          this.customerStorageSvc.deletePaymentIntentId()
          //delete order id
          this.customerStorageSvc.deleteOrderId()
          //delete record that order is inserted into sql
          this.customerStorageSvc.deleteInsertOrderStatus()
        }

        else{
          const dialogRef = this.dialog.open(PaymentStatusDialogComponent,{
            data: {processing: false, paymentStatus:"Payment Unsuccessful"}
          })
        }
      

  }

  /*async loadStripeLibrary(){

    //Rmb to change to live public key for actual payment to process in production
    this.stripe = await loadStripe('pk_test_51NQloiFEKRQAkZns9rrhX7sK0y1cSqukee3pvNc4bqU15MXhEyZBRprAla5yxJBzYx3Axqi0OFmPh98egEwwDh6g00Rsbouqq1')
        
  }*/

  //const clientSecret = this.customerSvc.paymentIntentClientSecret
      
      
      
      //await this.loadStripeLibrary()
      //const result = await this.stripe?.retrievePaymentIntent(clientSecret)

      /*this.customerSvc.paymentIntentId.subscribe((id)=>{
        
        if(id){
          console.info("PaymentIntent id in searchOrder Component >>>", id)

          //retrieve PaymentIntent initially created after customer confirm payment. We do this to check payment status
      firstValueFrom(this.customerSvc.retrievePaymentIntentStatus())
      .then((result) => {
        console.info("Payment Status in searchOrder Component >>>", result.status)

        //get the paymentIntent status to see the payment status/progress
        switch(result.status){
          case "succeeded":
          //delete cart from session once user successfully checkout
          this.customerStorageSvc.deleteCart()
          //let sideNav cart in AppComponent know cart has been deleted from session
          this.customerStorageSvc.updatedCart.next([])
          //delete customer particulars
          this.customerStorageSvc.deleteCheckoutDetails()
  
          const dialogRef = this.dialog.open(OrderDialogComponent,{
            data: {successOrProcess: true, orderId: this.customerStorageSvc.getOrderId(), paymentStatus:"Payment Success"}
          })
          break
  
          case "processing":
            //delete cart from session once user successfully checkout
            this.customerStorageSvc.deleteCart()
            //let sideNav cart in AppComponent know cart has been deleted from session
            this.customerStorageSvc.updatedCart.next([])
            //delete customer particulars
            this.customerStorageSvc.deleteCheckoutDetails()
  
            const dialogRefPro = this.dialog.open(OrderDialogComponent,{
              data: {successOrProcess: true, orderId: this.customerStorageSvc.getOrderId(), paymentStatus:"Payment Processing"}
            })
            break
  
          case "requires_payment_method":
            const dialogRefFail = this.dialog.open(OrderDialogComponent,{
              data: {successOrProcess: false, paymentStatus:"Payment Unsuccessful"}
            })
            break
          
          default:
            const dialogRefDefault = this.dialog.open(OrderDialogComponent,{
              data: {successOrProcess: false, paymentStatus:"Something Went Wrong"}
            })
            break
        }
      })
      .catch((error: HttpErrorResponse) => {
        console.error(error)
      })
        }
      })
      */
}
