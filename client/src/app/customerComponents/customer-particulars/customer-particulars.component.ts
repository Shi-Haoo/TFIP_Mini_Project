import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CheckoutOrderDetails } from 'src/app/models';
import { CustomerStorageService } from 'src/app/services/customer-storage.service';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderDialogComponent } from '../order-dialog/order-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-customer-particulars',
  templateUrl: './customer-particulars.component.html',
  styleUrls: ['./customer-particulars.component.css']
})
export class CustomerParticularsComponent implements OnInit{

  particularsForm!: FormGroup
  horizontalPosition: MatSnackBarHorizontalPosition = 'center'
  verticalPosition: MatSnackBarVerticalPosition = 'top'
  buttonText: string = "Continue to Payment"

  fb: FormBuilder = inject(FormBuilder)
  router = inject(Router)
  customerStorageSvc = inject(CustomerStorageService)
  customerSvc = inject(CustomerService)
  _snackBar = inject(MatSnackBar)
  dialog = inject(MatDialog)

  
  ngOnInit(): void {
      this.particularsForm = this.createParticularsForm()

      if(this.customerStorageSvc.getCart() === ""){
        this.openSnackBar("Please add something to cart before accessing this page", "OK!")
        this.router.navigate(['/products'])
      }
  }

  //change the button content depending on what user pick for payment mode
  onPaymentModeChange(){
    
    if(this.particularsForm.value.paymentMode === 'cash'){
      this.buttonText = "Confirm Order"
    }

    else if(this.particularsForm.value.paymentMode === 'online_payment'){
      this.buttonText = "Continue to Payment"
    }
  }
  

  processCheckout(){

    const checkoutDeets = this.particularsForm.value
    if(this.particularsForm.value.paymentMode === "cash"){

      checkoutDeets.paymentStatus = "not paid"
      console.info("In Particulars Component, Customer particulars >>>", checkoutDeets)

      checkoutDeets.items = this.customerStorageSvc.getCart()
      console.info("In Particulars Component, Customer checkout details >>>", checkoutDeets)

      firstValueFrom(this.customerSvc.postOrder(checkoutDeets))
      .then((result)=>{
        console.info("response from server after posting order >>>", result)
        this.customerStorageSvc.saveOrderId(result.orderId)
        //delete cart from session once user successfully checkout
        this.customerStorageSvc.deleteCart()
        //let sideNav cart in AppComponent know cart has been deleted from session
        this.customerStorageSvc.updatedCart.next([])
        const dialogRef = this.dialog.open(OrderDialogComponent,{
          data: {success: true, orderId: result.orderId}
        })
      })
      .catch((error: HttpErrorResponse) => {
        console.error('Error returned by server after posting order >>>', error)
        const dialogRef = this.dialog.open(OrderDialogComponent,{
          data: {success: false, error: error}
        })
      })
    }

    else if(this.particularsForm.value.paymentMode === "online_payment"){
      
      //by default set to processing. Once payment is successful, update database to paid
      checkoutDeets.paymentStatus = "processing"

      console.info("In Particulars Component, Customer particulars >>>", checkoutDeets)

      checkoutDeets.items = this.customerStorageSvc.getCart()
      console.info("In Particulars Component, Customer checkout details >>>", checkoutDeets)

      //TODO: Navigate to credit card payment page. Integrate with stripe payment
      //save customer particulars before proceeding to payment page. Otherwise if user refresh page at '/payment' all data will be gone.
      this.customerStorageSvc.saveCheckoutDetails(checkoutDeets)
      this.router.navigate(['/payment'])
    }

    
  }

  private createParticularsForm(): FormGroup{

    return this.fb.group({
      customerFirstName: this.fb.control<string>('', [Validators.required]),
      customerLastName: this.fb.control<string>('', [Validators.required]),
      email: this.fb.control<string>('', [Validators.required, Validators.email]),
      //allow characters + () and digit 0-9. Total length limit to 8-15 
      contact: this.fb.control<string>('', [Validators.required, Validators.pattern('[- +()0-9]{8,15}')]),
      comments: this.fb.control<string>(''),
      paymentMode: this.fb.control<string>('online_payment',[Validators.required])
    })
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
