import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CustomerStorageService } from 'src/app/services/customer-storage.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-payment-error-dialog',
  templateUrl: './payment-error-dialog.component.html',
  styleUrls: ['./payment-error-dialog.component.css']
})

//To display any immediate online payment error with Stripe Payment Gateway
export class PaymentErrorDialogComponent implements OnInit{

  router = inject(Router)
  customerStorageSvc = inject(CustomerStorageService)
  
  constructor(public dialogRef: MatDialogRef<PaymentErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private location: Location){}

  
    ngOnInit(): void {
    
    }

    reload(){
      this.dialogRef.close()
      location.reload()
    }
}
