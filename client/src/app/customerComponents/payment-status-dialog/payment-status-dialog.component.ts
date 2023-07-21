import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CustomerStorageService } from 'src/app/services/customer-storage.service';

@Component({
  selector: 'app-payment-status-dialog',
  templateUrl: './payment-status-dialog.component.html',
  styleUrls: ['./payment-status-dialog.component.css']
})

//Dialog here is to display online payment via Stripe Payment Gateway that is in status: "processing" or payment failed
export class PaymentStatusDialogComponent implements OnInit {

  router = inject(Router)
  customerStorageSvc = inject(CustomerStorageService)
  
  constructor(public dialogRef: MatDialogRef<PaymentStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any){}

  
    ngOnInit(): void {
    
    }

    onFailedPayment(){
      this.dialogRef.close()
      this.router.navigate(['/payment'])
    }
}
