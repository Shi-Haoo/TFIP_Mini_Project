import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CustomerStorageService } from 'src/app/services/customer-storage.service';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.css']
})
export class OrderDialogComponent implements OnInit{

  
  router = inject(Router)
  customerStorageSvc = inject(CustomerStorageService)
  
  constructor(public dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any){}

  
    ngOnInit(): void {
    
    }
    
    onSuccessOrder(){

      this.dialogRef.close()
      this.router.navigate(['/searchOrders'])
    }

    

}
