import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { OrderData, UpdateOrderStatus } from 'src/app/models';
import { MerchantService } from 'src/app/services/merchant.service';

@Component({
  selector: 'app-update-order',
  templateUrl: './update-order.component.html',
  styleUrls: ['./update-order.component.css']
})
export class UpdateOrderComponent implements OnInit{

  //This is the component to be displayed in dialog in RetrieveOrdersComponent
  //This component which is created via MatDialog can inject MatDialogRef to close dialog from this component. 
  //MAT_DIALOG_DATA is needed to retrieve data from parent component RetrieveOrderComponent to display in dialog box

  constructor(public dialogRef: MatDialogRef<UpdateOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderData){}

    
  merchantSvc = inject(MerchantService)
  fb: FormBuilder = inject(FormBuilder)

  updateOrderForm!: FormGroup
  updateOrderStatus!: UpdateOrderStatus
  
  ngOnInit(): void {
      
    this.updateOrderForm = this.createForm()
  }

  onCancel(): void{
    //close dialog box
    this.dialogRef.close('cancel')
  }

  saveOrderStatus(){

    this.updateOrderStatus = this.updateOrderForm.value
    this.updateOrderStatus.orderId = this.data.order_id

    console.info("Update Order Status>>>", this.updateOrderStatus)

    firstValueFrom(this.merchantSvc.updateOrderStatus(this.updateOrderStatus))
    .then((resp)=>{
      //close the dialog box and send string 'Success' to the component that calls for this dialog box and subscribed to the event after dialog box close
      this.dialogRef.close('Successful')
    })
    //close the dialog box and send HttpErrorResponse object to the component that calls for this dialog box and subscribed to the event after dialog box close
    .catch((error: HttpErrorResponse)=>this.dialogRef.close(error))

  }

  private createForm(): FormGroup{
    return this.fb.group({
      paymentStatus: this.fb.control<string>(this.data.payment_status, [Validators.required]),
      deliveryStatus: this.fb.control<string>(this.data.delivery_status, [Validators.required])
    })
  }
  
}
