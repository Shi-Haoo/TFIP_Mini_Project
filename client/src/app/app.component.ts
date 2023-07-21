import { Component, OnInit, inject } from '@angular/core';
import { StorageService } from './services/storage.service';
import { AuthService } from './services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { CustomerStorageService } from './services/customer-storage.service';
import { Item } from './models';
import { CustomerService } from './services/customer.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  
  isLoggedIn = false
  username: string = " "
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  storageService = inject(StorageService)
  authService = inject(AuthService)
  router = inject(Router)
  _snackBar = inject(MatSnackBar)
  activatedRoute = inject(ActivatedRoute)

  customerStorageSvc = inject(CustomerStorageService)
  customerSvc = inject(CustomerService)
  
  cart: Item[] = []
  imageDataUrl: string = ""
  cartEmpty: boolean = true
  priceOfAllItems: number = 0
  sumOfItems: number = 0

  ngOnInit(): void {

    //This isLoggedIn is used to determine which navbar to display for the first time before user even attempt login
    this.isLoggedIn = this.storageService.isLoggedIn()

    //need subscription to always stay updated/listen to changes to the login status in login component 
    //so that navbar can change when login is successful
    this.storageService.isLoggedInSuccess.subscribe({
      next: result=>{
        console.info("isLoggedInSuccess boolean>>>", result)
        this.isLoggedIn = result
      }
    })
    
    //to load and display the updated cart content. Without this and just using subscribing to event, content in the cart will disappear everytime page refreshes
    //This is because in my case, I only emit events for changes to quantity/item in cart. Thus, only those events are listened to. 
    //Reloading page is not an event subscribed to. So without this.loadCartList() and no events happening, 
    //code in .subscribe() wont be activated. SideNav cart list will be displayed as empty based on property
    //cartEmpty which by default is set to false
    
    this.loadCartList()
    

    //Listen to changes to cart so that sideNav cart list can display latest content realtime
    //changes can be from sideNav itself or from other components
    this.customerStorageSvc.updatedCart.subscribe({
      next: latestCart =>{
        
        if(latestCart.length !== 0){
          console.info("updated cart content for sideNav in AppComponent >>>", latestCart)
          this.cart = latestCart

          //reset the total quantity and total price to 0 and then calculate the latest value
          this.priceOfAllItems = 0
          this.sumOfItems = 0
          for (let cartItem of this.cart){
            this.priceOfAllItems += cartItem.totalFinalPrice
            this.sumOfItems += cartItem.quantity
          }

          //retrieve item images from database to display on cart list
          this.loadItemImgs()
          this.cartEmpty = false
        }

        else{
          this.cartEmpty = true
          this.customerStorageSvc.deleteCart()
          this.sumOfItems = 0
          this.priceOfAllItems = 0
          /*setTimeout(() => {
            this.priceOfAllItems = 0;
          }, 0);*/
        }
      }
    })

  }

  openSnackBar() {
    if(this.isLoggedIn === false){
    this._snackBar.open('You have logout successfully', 'OK!', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    })
  }
  }

  logout(){
    
    this.storageService.logout()
    //need subscription to always stay updated/listen to changes to whether a user has logged out
    //so that navbar can change when user logout
    this.storageService.isLoggedInSuccess.next(false)
    this.storageService.isLoggedInSuccess.subscribe({
      next: result=>{
        this.isLoggedIn = result
        console.info("isLoggedIn status at logout()>>>", this.isLoggedIn)
      }
    })
    this.openSnackBar()
    this.router.navigate(['/login'])
    
  }


  removeItem(i: number){

    console.info("selected item to remove in sideNav cart >>>", this.cart[i])
    //update the total quantity after removing an item
    this.sumOfItems -= this.cart[i].quantity

    //splice will remove item at index i. It returns the element removed. So assigned variable will get the element removed as a return value
    this.cart.splice(i, 1)
    console.info("items in sideNav cart after deleting item>>>", this.cart)

    this.priceOfAllItems = 0
    for(let remainingItem of this.cart){
      this.priceOfAllItems += remainingItem.totalFinalPrice
    }

    this.customerStorageSvc.saveCart(this.cart)

    //send out the updated cart as event so that sideNav cart list in this component and cart 
    //list in Cart Component can be updated real time. If all items are removed, an empty array is sent
    this.customerStorageSvc.updatedCart.next(this.cart)
  }


  onCheckout(){
    console.info("items proceeding to checkout page from sideNav cart>>>", this.cart)
    this.customerStorageSvc.saveCart(this.cart)

    this.router.navigate(['/cart'])
  }


  loadCartList(){

    if(this.customerStorageSvc.getCart() !== ""){
      this.cartEmpty = false
      this.cart = this.customerStorageSvc.getCart()
      console.info("item array in App Component>>>", this.cart)
      let promiseChain = Promise.resolve();

    for (let cartItem of this.cart) {
      promiseChain = promiseChain.then(() => {
        return this.getItemImgUrl(cartItem.imgFileName)
          .then((imageDataUrl: string) => {
            cartItem.imgUrl = imageDataUrl;
            console.info("imageDataUrl in App Component>>>", imageDataUrl);
            console.info("cart item after retrieving image url in AppComponent>>>", cartItem);
          });
      });
    }

    promiseChain.then(() => {
      //reset the total quantity and total price to 0 and then calculate the latest value
      this.priceOfAllItems = 0
      this.sumOfItems = 0
      for (let cartItem of this.cart){
        this.priceOfAllItems += cartItem.totalFinalPrice
        this.sumOfItems += cartItem.quantity
      }
      
    });
    }

    else{
      this.cartEmpty = true
    }
  } 

  loadItemImgs(){
    let promiseChain = Promise.resolve();

    for (let cartItem of this.cart) {
      promiseChain = promiseChain.then(() => {
        return this.getItemImgUrl(cartItem.imgFileName)
          .then((imageDataUrl: string) => {
            cartItem.imgUrl = imageDataUrl;
            console.info("imageDataUrl in App Component>>>", imageDataUrl);
            console.info("cart item after retrieving image url in AppComponent>>>", cartItem);
          });
      });
    }
  }

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

  //disable the cart button if url is at '/payment' page. Don't want user to change items
  //at this page when making payment
  showCartButton(): boolean{
    const currentRoute = this.router.url;
  return currentRoute.includes('/payment');
  }
}
