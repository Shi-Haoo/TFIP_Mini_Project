import { Component, OnInit, inject } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { MerchantService } from 'src/app/services/merchant.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Item, ProductInfo } from 'src/app/models';
import { CustomerStorageService } from 'src/app/services/customer-storage.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})


export class ProductsComponent implements OnInit{

  imgName: string = "kimchi default image"
  imageDataUrl!: string
  horizontalPosition: MatSnackBarHorizontalPosition = 'center'
  verticalPosition: MatSnackBarVerticalPosition = 'top'

  productInfo!: ProductInfo
  finalPrice: number = 0
  altProductName: string = ""
  //to bind to mat select to display initial value as kimchi(500g)
  selectedProductName: string = "kimchi_500"
  hasDiscount: boolean = false
  quantity: number = 1

  //need to initialize item like this. Cannot leave it as undefined. Else cannot set property of item in addItemToCart()
  item: Item = {productId: 1, productName: "kimchi_500", quantity: 1, standardPrice: 10, discount: 0, totalFinalPrice: 10, transformedProductName: "Munch Kitchen Original Kimchi (500g)", imgFileName: this.imgName, imgUrl: ""}
  
  //to check whether there is at least an item added to cart before proceeding to checkout
  cartEmpty: boolean = true

  merchantSvc = inject(MerchantService)
  customerSvc = inject(CustomerService)
  customerStorageSvc = inject(CustomerStorageService)
  _snackBar = inject(MatSnackBar)

   ngOnInit(): void {

    this.loadProductImage()
    //retrieve info based on kimchi_500 first. Subsequent changes in selection of size will call for loadProductInfo()
    this.loadProductInfo(this.selectedProductName)

    if(this.customerStorageSvc.getCart() !== ""){
      console.info("customerStorage getCart()>>>", this.customerStorageSvc.getCart())
      this.cartEmpty = false
    }
    
  }

  changeProductSize(name: any){

    //For Mat-Select, we use .value instead of .target.value
    this.selectedProductName = name.value
    console.info("Changed Product >>> ", this.selectedProductName)

    this.loadProductInfo(this.selectedProductName)
  }


  changeQuantity(num: number){
 
    if(num < 0 && this.quantity > 1){
      this.quantity += num
      console.info("quantity after click minus>>>", this.quantity)

      //make a call to server to retrieve product info for this current selected product
      //everytime we change quantity so that total price will be updated on client side
      this.loadProductInfo(this.selectedProductName)
    }

    else if(num > 0){
      this.quantity += num
      console.info("quantity after click add>>>", this.quantity)

      this.loadProductInfo(this.selectedProductName)
    }
  }


  addItemToCart(){
    console.info("productInfo after clicking add to cart>>>", this.productInfo)
     
    this.item.productId = this.productInfo.productId
    this.item.productName = this.productInfo.productName
    this.item.quantity = this.quantity
    this.item.standardPrice = this.productInfo.standardPrice
    this.item.discount = this.productInfo.discount
    this.item.totalFinalPrice =  this.finalPrice
    this.item.transformedProductName = this.altProductName
    this.item.imgFileName = this.imgName
    this.item.imgUrl = ""

    this.customerStorageSvc.addItemToCart(this.item)
    this.cartEmpty = false

    console.info("addItemToCart() in ProductComponent >>>", this.item)
    this.openSnackBar(`${this.item.transformedProductName} has been added to cart, Quantity: ${this.item.quantity}`,"OK!")
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action,{
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  loadProductImage(): void{
    //If merchant request to update image, the file name of the image would be stored in local storage 
    //so that we can retrieve it here and send request to server to retrieve the desired img 
    if(localStorage.getItem('kimchiImgName')){
      //type assertion as string. If use JSON.stringify, the string will be saved with "" so it will result in %22 before and after image file name
      //And server will return 404 because the image file name it searches includes %22 which is not what we saved in sql
      this.imgName = localStorage.getItem('kimchiImgName') as string
      console.info("imgName in ProductsComponent>>>", this.imgName)
    }
    
    firstValueFrom(this.customerSvc.getProductImage(this.imgName))
    .then((imageBlob: Blob)=>{
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = () => {
        this.imageDataUrl = reader.result as string
        console.info("Base64ImgStr in Products Component >>>", reader.result as string)
      }
    })
    .catch((error: HttpErrorResponse)=>{
      if(error.status === 404){
        console.error('An error occurred:', error)
        this.openSnackBar(`Error ${error.status} ${error.statusText}:\n Image with stated image name not found!`, "OK!")
      }

      else{
        console.error('An error occurred:', error)
        this.openSnackBar(`Error ${error.status} ${error.statusText}`,"OK!")
      }
    })
  }

  loadProductInfo(itemName: string): void{

    if(itemName === "kimchi_500"){
      this.altProductName = "Munch Kitchen Original Kimchi (500g)"
    }

    else if(itemName === "kimchi_750"){
      this.altProductName = "Munch Kitchen Original Kimchi (750g)"
    }

    firstValueFrom(this.customerSvc.getProductInfoByName(itemName))
    .then((pdtInfo)=>{
      
      this.productInfo = pdtInfo
      if(this.productInfo.discount > 0){
        this.hasDiscount = true
      }
      this.finalPrice = this.quantity * this.productInfo.standardPrice*(1-this.productInfo.discount)

      console.info("product id>>>", this.productInfo.productId)
      console.info("product info>>>", this.productInfo)
    })
    .catch((error: HttpErrorResponse)=>{
      if(error.status === 404){
        console.error('An error occurred:', error)
        this.openSnackBar(`Error ${error.status} ${error.statusText}:\n Image with stated image name not found!`, "OK!")
      }

      else{
        console.error('An error occurred:', error)
        this.openSnackBar(`Error ${error.status} ${error.statusText}`,"OK!")
      }
    })

  }
}
