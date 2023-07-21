import { Injectable } from "@angular/core";
import { CheckoutOrderDetails, Item } from "../models";
import { Subject } from "rxjs";




const CART_KEY = 'customer-cart'
const ORDERID_KEY = 'customer-orderId'
const CHECKOUT_DETAILS_KEY = 'customer-checkout'
const PAYMENT_INTENT_KEY = 'paymentIntent-id'
const INSERT_ORDER_STATUS = 'insert-order-status'


//to store customer's cart items in session storage
@Injectable()
export class CustomerStorageService{

    cart: Item[] = []
    
    
    //Everytime a user changes anything in the cart, the updated cart will be sent out to other related components to display the updated content
    updatedCart = new Subject<Item[]>()

    saveCart(cart: Item[]): void{

        //window.sessionStorage.removeItem(CART_KEY)
        window.sessionStorage.setItem(CART_KEY, JSON.stringify(cart))
    }

    getCart(): any{

        const items = window.sessionStorage.getItem(CART_KEY)
        if(items){
            return JSON.parse(items)
        }
        return ""
    }

    deleteCart(){

        //If user remove the only item remaining in the cart, then cart is empty.
        //remove the cart from session storage
        window.sessionStorage.removeItem(CART_KEY)
    }

    addItemToCart(item: Item){

        //If user alr have added something into cart and then go back to shopping again
        if(this.getCart() !== ""){
            this.cart = this.getCart()
        //check whether item added alr exist in cart. If match is found, callback function will return that element.
        //Else find() will return undefined. find() method stops searching once it finds the first matching item

        //i is assigned a reference (a pointer) to the element in the cart array that 
        //satisfies the condition provided in the find() method. It's not a copy of 
        //the element. So any changes made to i will also affect the original 
        //element in the cart array.
            let i = this.cart.find(cartItem => cartItem.productName == item.productName)
            console.info("element returned by find()>>>", i)
    
            // null is falsy value. !!i means not null. => if match is found
            if(!!i){
                i.quantity += item.quantity
                i.totalFinalPrice = i.quantity*i.standardPrice*(1-i.discount)
            }
    
            //else if no match found, add the product to cart
            //The { ...action } syntax is an object spread syntax in JavaScript. It is 
            //used to create a new object by copying all the properties of the action object.
            else{
                this.cart.push({...item} as Item)
            }
        }

        //if user has not added anything into cart
        else{
            this.cart = []
            this.cart.push({...item} as Item)
        }
        

        //save customer's cart into session storage
        this.saveCart(this.cart)
        console.info('cart:', this.cart)

        //send out the updated cart as event so that other components such as Cart Component 
        //and sideNav cart list in App Component can subscribe to latest changes
        this.updatedCart.next(this.cart)
    }

    saveOrderId(orderId: string){
        window.sessionStorage.setItem(ORDERID_KEY, orderId)
    }

    getOrderId(): string{
        const orderId = window.sessionStorage.getItem(ORDERID_KEY)
        if(orderId){
            return orderId
        }

        return ""
    }

    deleteOrderId(){
        window.sessionStorage.removeItem(ORDERID_KEY)
    }

    savePaymentIntentId(paymentIntentId: string){
        window.sessionStorage.setItem(PAYMENT_INTENT_KEY, paymentIntentId)
    }

    getPaymentIntentId(): string{
        const paymentIntentId = window.sessionStorage.getItem(PAYMENT_INTENT_KEY)

        if(paymentIntentId){
            return paymentIntentId
        }

        return ""
    }

    deletePaymentIntentId(){
        window.sessionStorage.removeItem(PAYMENT_INTENT_KEY)
    }

    saveInsertOrderStatus(status: string){
        window.sessionStorage.setItem(INSERT_ORDER_STATUS, status)
    }

    getInsertOrderStatus(): string{
        const status = window.sessionStorage.getItem(INSERT_ORDER_STATUS)

        if(status){
            return status
        }

        return ""
    }

    deleteInsertOrderStatus(){
        window.sessionStorage.removeItem(INSERT_ORDER_STATUS)
    }

    //save customer particulars before proceeding to payment page. Otherwise if user refresh page at '/payment' all data will be gone.
    //No data to insert into database if not saved 
    saveCheckoutDetails(checkoutDeets: CheckoutOrderDetails){
        window.sessionStorage.setItem(CHECKOUT_DETAILS_KEY, JSON.stringify(checkoutDeets))
    }

    getCheckoutDetails(): any{
        const checkoutDetails = window.sessionStorage.getItem(CHECKOUT_DETAILS_KEY)

        if(checkoutDetails){
            return JSON.parse(checkoutDetails)
        }

        return ""
    }

    deleteCheckoutDetails(){
        window.sessionStorage.removeItem(CHECKOUT_DETAILS_KEY)
    }
}