import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Item } from 'src/app/models';
import { CustomerStorageService } from 'src/app/services/customer-storage.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MerchantService } from 'src/app/services/merchant.service';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit{

  customerStorageSvc = inject(CustomerStorageService)
  customerSvc = inject(CustomerService)
  merchantSvc = inject(MerchantService)
  router = inject(Router)

  cart: Item[] = []
  imageDataUrl: string = ""
  cartEmpty: boolean = true
  priceOfAllItems: number = 0

  dataSource = new MatTableDataSource<Item>()
  displayedColumns: string[] = ['productDetails','quantity', 'totalFinalPrice', 'action']

  ngOnInit(): void {
      this.loadTable()

      //Subscribe to changes to cart event so that page can display latest content
      this.customerStorageSvc.updatedCart.subscribe({
        next: latestCart =>{
          
          if(latestCart.length !== 0){
            console.info("updated cart content >>>", latestCart)
            this.dataSource.data = latestCart
            //reset the total price to 0 and then calculate the latest value
            this.priceOfAllItems = 0
            for (let cartItem of this.dataSource.data){
              this.priceOfAllItems += cartItem.totalFinalPrice
            }
          }
          
          else{
            this.cartEmpty = true
            this.customerStorageSvc.deleteCart()
          }
        }
      })
  }

  
   loadTable(){

    if(this.customerStorageSvc.getCart() !== ""){
      this.cartEmpty = false
      this.cart = this.customerStorageSvc.getCart()
      console.info("item array>>>", this.cart)

      //loop through the Item[] and for each item, call getItemImgUrl() to get item image url
      //and set the url to imgUrl property of each element
      
      /*
      for(let cartItem of this.cart){
        this.getItemImgUrl(cartItem.imgFileName)
        cartItem.imgUrl = this.imageDataUrl
        console.info("imageDataUrl >>>", this.imageDataUrl)
        console.info("cart item after retrieving image url>>>", cartItem)
      } 


  
      this.dataSource.data = this.cart
    } */

    let promiseChain = Promise.resolve();

    for (let cartItem of this.cart) {
      promiseChain = promiseChain.then(() => {
        return this.getItemImgUrl(cartItem.imgFileName)
          .then((imageDataUrl: string) => {
            cartItem.imgUrl = imageDataUrl;
            console.info("imageDataUrl >>>", imageDataUrl);
            console.info("cart item after retrieving image url>>>", cartItem);
          });
      });
    }

    promiseChain.then(() => {
      for (let cartItem of this.cart){
        this.priceOfAllItems += cartItem.totalFinalPrice
      }
      this.dataSource.data = this.cart;
    });
  }

    else{
      this.cartEmpty = true
    }
    
  }

  /*
  getItemImgUrl(imageFileName: string){
    
     firstValueFrom(this.customerSvc.getProductImage(imageFileName))
    .then((imageBlob: Blob)=>{
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = () => {
        this.imageDataUrl = reader.result as string
        console.info("Base64ImgStr in Cart Component >>>", this.imageDataUrl)
      }
    })
    .catch((error: HttpErrorResponse)=>{
      if(error.status === 404){
        console.error('An error occurred:', error)
        //this.openSnackBar(`Error ${error.status} ${error.statusText}:\n Image with stated image name not found!`, "OK!")
      }

      else{
        console.error('An error occurred:', error)
        //this.openSnackBar(`Error ${error.status} ${error.statusText}`,"OK!")
      }
    })
  }
  */

  getItemImgUrl(imageFileName: string): Promise<string> {
    return firstValueFrom(this.customerSvc.getProductImage(imageFileName))
      .then((imageBlob: Blob) => {
        return this.convertBlobToDataUrl(imageBlob);
      })
      .then((imageDataUrl: string) => {
        console.info("Base64ImgStr in Cart Component >>>", imageDataUrl);
        return imageDataUrl;
      })
      .catch((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.error('An error occurred:', error);
          //this.openSnackBar(`Error ${error.status} ${error.statusText}:\n Image with stated image name not found!`, "OK!")
        }
        return ''; // Return an empty string or handle error case as needed
      });
  }
  
  convertBlobToDataUrl(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  changeQuantity(row: Item, num: number){
    //const orderToUpdate = this.dataSource.data[i]
    console.info("selected product to change quantity>>>", row)
    console.info("dataSource data before changing quantity>>>", this.dataSource.data)

    if(num < 0 && row.quantity > 1){
      row.quantity += num
      row.totalFinalPrice = row.quantity*row.standardPrice*(1-row.discount)
      
      //update total price of all products
      this.priceOfAllItems = 0 
      for (let updatedItem of this.dataSource.data){
        this.priceOfAllItems += updatedItem.totalFinalPrice
      }
    }

    else if(num > 0){
      row.quantity += num
      row.totalFinalPrice = row.quantity*row.standardPrice*(1-row.discount)

      //update total price of all products
      this.priceOfAllItems = 0 
      for (let updatedItem of this.dataSource.data){
        this.priceOfAllItems += updatedItem.totalFinalPrice
      }
    }

    console.info("selected product after changing quantity>>>", row)
    console.info("dataSource data after changing quantity>>>", this.dataSource.data)

    this.customerStorageSvc.saveCart(this.dataSource.data)

    //Everytime a customer changes quantity, send the updated cart out as event so that other component
    //such as sideNav cart list in AppComponent can be updated
    this.customerStorageSvc.updatedCart.next(this.dataSource.data)
  }


  removeItem(i: number){
    console.info("row number selected in cart >>>", i)
    console.info("selected product to remove>>>", this.dataSource.data[i])
    
    //splice will remove item at index i. It returns the element removed. So assigned variable will get the element removed as a return value
    this.dataSource.data.splice(i, 1)
    this.customerStorageSvc.saveCart(this.dataSource.data)
    console.info("dataSource data after removing product>>>", this.dataSource.data)

    //Send out the changes to cart event so that relevant components can subscribe
    this.customerStorageSvc.updatedCart.next(this.dataSource.data)

    //update total price of all products 
    this.priceOfAllItems = 0
    for (let updatedItem of this.dataSource.data){
      this.priceOfAllItems += updatedItem.totalFinalPrice
    }
  }

  saveFinalOrder(){

    console.info("final dataSource data to be saved for payment>>>", this.dataSource.data)
    this.customerStorageSvc.saveCart(this.dataSource.data)
    this.router.navigate(['/particulars'])

  }
}

