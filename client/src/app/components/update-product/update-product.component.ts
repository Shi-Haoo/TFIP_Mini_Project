import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { updateDescriptionRequest } from 'src/app/models';
import { MerchantService } from 'src/app/services/merchant.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit{

  router = inject(Router)
  merchantSvc = inject(MerchantService)
  fb: FormBuilder = inject(FormBuilder)
  storageService = inject(StorageService)
  _snackBar = inject(MatSnackBar)

  updateForm!: FormGroup
  isLoggedIn: boolean = false

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  ngOnInit(): void {
      this.isLoggedIn = this.storageService.isLoggedIn()
      this.updateForm = this.createForm()
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  postUpdate(){
    const updateDetails: updateDescriptionRequest = this.updateForm.value
    
    console.info("updateDetails>>>", updateDetails)
    
    firstValueFrom(this.merchantSvc.updateProductDeets(updateDetails))
    .then((resp)=>this.openSnackBar(resp.message,"OK!"))
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

      else{
        console.error('An error occurred:', error)
        alert(JSON.stringify(error))
      }
    }
      
      )
  }

  private createForm(): FormGroup{
    return this.fb.group({

      productName: this.fb.control<string>('', [Validators.required]),
      productDescription: this.fb.control<string>('', [Validators.required])
    })
  }
}
