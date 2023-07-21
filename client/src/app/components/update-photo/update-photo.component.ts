import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MerchantService } from 'src/app/services/merchant.service';
import { StorageService } from 'src/app/services/storage.service';

//import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-update-photo',
  templateUrl: './update-photo.component.html',
  styleUrls: ['./update-photo.component.css']
})
export class UpdatePhotoComponent implements OnInit {

  updatePhotoForm!: FormGroup
  fb = inject(FormBuilder)
  router = inject(Router)
  merchantSvc = inject(MerchantService)
  storageService = inject(StorageService)
  _snackBar = inject(MatSnackBar)
  //sanitizer = inject(DomSanitizer)

  isLoggedIn: boolean = false
  retrievedSuccess: boolean = false
  displayMatHint: boolean = true
  //base64Str: string = ""
  //safeImageDataUrl!: SafeResourceUrl;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  imageDataUrl!: string

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn()
    this.updatePhotoForm = this.createUpdatePhotoForm()
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  update(){
    const imageName = this.updatePhotoForm.value.imageName
    console.info("Image File Name>>>", imageName)

    firstValueFrom(this.merchantSvc.updateProductPhoto(imageName))
    /*.then((result)=>{
      this.retrievedSuccess = true
      this.base64Str = JSON.stringify(result.content)
      console.info("base64Str>>>", this.base64Str)
      this.safeImageDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.base64Str)

      //later on, component for product display will get the base64 string from merchant service 
      this.merchantSvc.safeBase64ImgStr = this.safeImageDataUrl
      
      this.openSnackBar("Update Success!", "OK!")
    })*/
    .then((imageBlob: Blob)=>{
      this.merchantSvc.saveImgNametoLocalStorage(imageName)
      this.retrievedSuccess = true
      this.openSnackBar("Update Success!", "OK!")
      // Convert the Blob object to a data URL aka Base64 string
      /**
       * The readAsDataURL method is used to read the contents of the specified Blob or File. When the 
       * read operation is finished, the readyState becomes DONE, and the loadend event is triggered. At that 
       * time, the result attribute contains the data as a data: URL representing the file's data as a base64 
       * encoded string. reader.onloadend is an event handler that listens to loadend event and then access 
       *  the loaded data or perform any necessary operations based on the result of the file reading process.
       * source: https://docs.w3cub.com/dom/filereader/readasdataurl
       */
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = () => {
        this.imageDataUrl = reader.result as string
        console.info("Base64ImgStr>>>", reader.result as string)
      }
      
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
        this.openSnackBar(`Error: ${error.status} ${error.statusText}\n Image with stated image name not found!`, "OK!")
      }

      else{
        console.error('An error occurred:', error)
        this.openSnackBar(JSON.stringify(error),"OK!")
      }
    })
    

  }

  private createUpdatePhotoForm(): FormGroup{
    return this.fb.group({
      imageName: this.fb.control<string>('', [Validators.required])
    })
     
  }
}
