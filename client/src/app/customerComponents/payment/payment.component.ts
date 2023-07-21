import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Stripe, loadStripe, StripeElements, StripeElementsOptions, StripeElementsOptionsMode, Appearance, StripePaymentElementOptions } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { CheckoutOrderDetails } from 'src/app/models';
import { CustomerStorageService } from 'src/app/services/customer-storage.service';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderDialogComponent } from '../order-dialog/order-dialog.component';
import { PaymentErrorDialogComponent } from '../payment-error-dialog/payment-error-dialog.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})

//On Angular, to use Stripe, instead of adding <script src="https://js.stripe.com/v3/"></script> in index.html,
//we install the Stripe JavaScript (Stripe.js) library in our CMD CLI using 'npm install @stripe/stripe-js' 
export class PaymentComponent implements OnInit{

  @ViewChild('paymentElement')
  paymentElementRef!: ElementRef

  horizontalPosition: MatSnackBarHorizontalPosition = 'center'
  verticalPosition: MatSnackBarVerticalPosition = 'top'

  stripe!: Stripe|null 
  elements!: StripeElements|undefined 
  loading: boolean = false
  clientSecret!: string 
  checkoutDetails!: CheckoutOrderDetails
  
  router = inject(Router)
  customerStorageSvc = inject(CustomerStorageService)
  customerSvc = inject(CustomerService)
  _snackBar = inject(MatSnackBar)
  dialog = inject(MatDialog)

  ngOnInit(): void {
      console.info("Customer Checkout Details in Payment Component >>>", this.customerStorageSvc.getCheckoutDetails())

      if(this.customerStorageSvc.getCart() === ""){
        this.openSnackBar("Please add something to cart before payment","OK!")
        this.router.navigate(['/products'])
      }

      //Create new payment intent with order id if no payment intent has been created yet. 
      else if(this.customerStorageSvc.getCart() !== "" && this.customerStorageSvc.getPaymentIntentId() === ""){
        this.loadStripeLibrary()

        this.checkoutDetails = this.customerStorageSvc.getCheckoutDetails()

        //Request to server to create Payment Intent and retrieve the Client Secret for the PaymentIntent object
        firstValueFrom(this.customerSvc.createPaymentIntent(this.checkoutDetails))
        .then((result)=>{
          this.clientSecret = result.clientSecret
          console.info("clientSecret >>>", this.clientSecret)

          const orderId = result.orderId
          this.customerStorageSvc.saveOrderId(orderId)
          console.info("Order Id saved into payment intent >>>", orderId)

          const paymentIntentId = result.paymentIntentId
          this.customerStorageSvc.savePaymentIntentId(paymentIntentId)
          console.info("Payment Intent Id saved >>>", paymentIntentId)

          //set the appearance of the elements. I select stripe bubblegum theme
          const appearance: Appearance = {
            theme: 'stripe',

            variables: {
              fontWeightNormal: '500',
              borderRadius: '6px',
              colorPrimary: '#f360a6',
              colorIconTabSelected: '#fff',
              spacingGridRow: '16px'
            },
            rules: {
              '.Tab, .Input, .Block, .CheckboxInput, .CodeInput': {
                boxShadow: '0px 3px 10px rgba(18, 42, 66, 0.08)'
              },
              '.Block': {
                borderColor: 'transparent'
              },
              '.BlockDivider': {
                backgroundColor: '#ebebeb'
              },
              '.Tab, .Tab:hover, .Tab:focus': {
                border: '0'
              },
              '.Tab--selected, .Tab--selected:hover': {
                backgroundColor: '#f360a6',
                color: '#fff'
              }
            }
          }

          const options: StripeElementsOptions = {
            appearance: appearance,
            clientSecret: this.clientSecret
          }

          //set how PaymentElement should look. I chose accordian style with spacing and no radio button
          const paymentElementOptions: StripePaymentElementOptions = {
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: true
            }
          }

          //initialize Stripe Element which manages group of elements such as PaymentElement. Manages the UI components
          
           this.elements = this.stripe?.elements(options)

          //create PaymentElement and mount it to the div with the elementRef. This embeds an iframe with a dynamic form 
          //that displays configured payment method types available from the PaymentIntent. The form automatically collects 
          //the associated payment details for the selected payment method type.
          const paymentElement = this.elements?.create('payment', paymentElementOptions)
          paymentElement?.mount(this.paymentElementRef.nativeElement)
        })
        .catch((error: HttpErrorResponse)=>{
          console.error(error)
        })

      }

      //If PaymentIntent Id alr exist. I.e Created when user enter this page but there is card error during payment and page is refreshed again
      //Should use back existing Payment Intent so that webhook can track transaction record properly and data can be updated or removed from sql database
      //correctly based on the order id assigned to each payment intent. 
      else if(this.customerStorageSvc.getCart() !== "" && this.customerStorageSvc.getPaymentIntentId() !== ""){
        
        this.loadStripeLibrary()

        this.checkoutDetails = this.customerStorageSvc.getCheckoutDetails()
        
        //update PaymentIntent for scenario where user leave payment page to add/remove items and then return again
        firstValueFrom(this.customerSvc.updatePaymentIntent(this.customerStorageSvc.getPaymentIntentId(), this.checkoutDetails))
        .then((updatedResult)=>{
          console.info("updated amount >>>", updatedResult.amount)

         return firstValueFrom(this.customerSvc.retrievePaymentIntent(this.customerStorageSvc.getPaymentIntentId()))
        .then((result)=>{
          console.info("Order Id in Session Storage >>>", this.customerStorageSvc.getOrderId())
          console.info("Order Id retrieved from existing Payment Intent >>>", result.orderId)

          this.clientSecret = result.clientSecret
          console.info("clientSecret >>>", this.clientSecret)

          //set the appearance of the elements. I select stripe bubblegum theme
          const appearance: Appearance = {
            theme: 'stripe',

            variables: {
              fontWeightNormal: '500',
              borderRadius: '6px',
              colorPrimary: '#f360a6',
              colorIconTabSelected: '#fff',
              spacingGridRow: '16px'
            },
            rules: {
              '.Tab, .Input, .Block, .CheckboxInput, .CodeInput': {
                boxShadow: '0px 3px 10px rgba(18, 42, 66, 0.08)'
              },
              '.Block': {
                borderColor: 'transparent'
              },
              '.BlockDivider': {
                backgroundColor: '#ebebeb'
              },
              '.Tab, .Tab:hover, .Tab:focus': {
                border: '0'
              },
              '.Tab--selected, .Tab--selected:hover': {
                backgroundColor: '#f360a6',
                color: '#fff'
              }
            }
          }

          const options: StripeElementsOptions = {
            appearance: appearance,
            clientSecret: this.clientSecret
          }

          //set how PaymentElement should look. I chose accordian style with spacing and no radio button
          const paymentElementOptions: StripePaymentElementOptions = {
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: true
            }
          }

          //initialize Stripe Element which manages group of elements such as PaymentElement. Manages the UI components
          
           this.elements = this.stripe?.elements(options)

          //create PaymentElement and mount it to the div with the elementRef. This embeds an iframe with a dynamic form 
          //that displays configured payment method types available from the PaymentIntent. The form automatically collects 
          //the associated payment details for the selected payment method type.
          const paymentElement = this.elements?.create('payment', paymentElementOptions)
          paymentElement?.mount(this.paymentElementRef.nativeElement)
        })
        .catch((error: HttpErrorResponse)=>{
          console.error(error)
        })
      })
      .catch((error: HttpErrorResponse)=>{
        console.error(error)
      })
        
      }
  }

  async loadStripeLibrary(){

    //initialize Stripe.js with your public key to use Stripe.js library. Will be needed for creating PaymentElement and confirm payment.
        //All the credit card/billing info will be sent to Stripe directly instead of our server. This is more secure, avoid ppl from
        //intercepting this data if we  send to server (Man-in-the-middle attack) 
        //Rmb to change to live public key for actual payment to process in production
        this.stripe = await loadStripe('pk_test_51NQloiFEKRQAkZns9rrhX7sK0y1cSqukee3pvNc4bqU15MXhEyZBRprAla5yxJBzYx3Axqi0OFmPh98egEwwDh6g00Rsbouqq1')
        //this.elements = this.stripe?.elements()
  }


   async handleSubmit(){
    
    console.info("Stripe Element for confirmPayment >>> ", this.elements)
    
    this.loading = true

    

    //insert order into database first. Later in server use webhook to detect if payment is successful
    //If unsuccessful, update order payment status to "not paid; online payment failed".
    try{
    
    //if order has not been inserted into sql db before
    if(this.customerStorageSvc.getInsertOrderStatus() === ""){
      const insertOrderResult = await firstValueFrom(this.customerSvc.postOrderforOnlinePayment(this.checkoutDetails, this.customerStorageSvc.getOrderId()))
    
      //save for record that order has alr been inserted.
      this.customerStorageSvc.saveInsertOrderStatus(insertOrderResult.status)
    }  
    

    // Call `submit()` on the PaymentElement to initiate the payment submission to avoid Integration Error
    await this.elements?.submit();

    //confirmPayment will send the contained customer card info directly to Stripe API without hitting the server
    //It will return a Promise and if successful, it will direct to return_url. If unsuccessful, Promise will resolve with {error}
    //object. 
    const result = await this.stripe?.confirmPayment({
      elements: this.elements,
      clientSecret: this.clientSecret,
      confirmParams: {
        //must add /# so that anything after /# will be route handled by Angular instead of making request to server
        return_url: window.location.origin + '/#' + this.router.createUrlTree(['/searchOrders']).toString(),
        //send payment receipt to customer's email
        receipt_email: this.customerStorageSvc.getCheckoutDetails().email
      }
    })
    //this will only be reached if there is an immediate error when confirming payment. Card errors are the most common type of 
    //error that happens when the user enters a card that can't be charged for some reason.
    
      if(result?.error.type === "card_error" || result?.error.type === "validation_error"){
        const dialogRef = this.dialog.open(PaymentErrorDialogComponent,{
          data: {cardError: true, errorMessage: result.error}
        })
      }
      else{
        const dialogRef = this.dialog.open(PaymentErrorDialogComponent,{
          data: {cardError: false, errorMessage: result?.error}
        })
        console.error(result?.error)
      }
    }catch(error){
      console.error(error)
    }
    

    this.loading = false
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
