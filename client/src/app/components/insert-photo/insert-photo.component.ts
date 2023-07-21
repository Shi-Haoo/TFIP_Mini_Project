import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MerchantService } from 'src/app/services/merchant.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-insert-photo',
  templateUrl: './insert-photo.component.html',
  styleUrls: ['./insert-photo.component.css']
})
export class InsertPhotoComponent implements OnInit{

  @ViewChild('uploadFile')
  toUpload!: ElementRef
  
  form!: FormGroup
  fb = inject(FormBuilder)
  router = inject(Router)
  merchantSvc = inject(MerchantService)
  storageService = inject(StorageService)
  _snackBar = inject(MatSnackBar)

  isLoggedIn: boolean = false
  uploadSuccess: boolean = false
  uploadedFileName: string = ""
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  
  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn()
    this.form = this.CreateInsertPhotoForm()
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  upload(){

    const imageFileName = this.form.value.imageFileName
    const file: File = this.toUpload.nativeElement.files[0]

    console.info("imageFileName>>>>", imageFileName)
    console.info("file to upload>>>", file)

    firstValueFrom(this.merchantSvc.insertImage(imageFileName, file))
    .then((resp)=>{
      
      this.uploadSuccess = true
      this.uploadedFileName = this.toUpload.nativeElement.files[0]?.name
      this.openSnackBar(JSON.stringify(resp.message), "OK!")

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

      else{
        console.error('An error occurred:', error)
        this.openSnackBar(JSON.stringify(error),"OK!")
      }
    })
  }

  handleFileInputChange(){
    //matInput element's value is bound to the selectedImageOriginalName form control's value using the formControlName directive. 
    //When the file input changes, the handleFileInputChange method is called, which retrieves the selected file name and 
    //updates the selectedImageOriginalName form control's value using the form.patchValue method. This 
    //change will automatically update the matInput element's value with the selected file name.
    const selectedFileName = this.toUpload.nativeElement.files[0]?.name
    this.form.patchValue({ selectedImageOriginalName: selectedFileName })
      console.info("file selected>>>", this.toUpload.nativeElement.files[0].name)
  }

  private CreateInsertPhotoForm(): FormGroup{

    return this.fb.group({
      //file: this.fb.control<File|null>(null, [Validators.required]),
      imageFileName: this.fb.control<string>('', [Validators.required]),
      selectedImageOriginalName: this.fb.control<string>('', [Validators.required])
    })
  }
}
