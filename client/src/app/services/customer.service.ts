import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { CheckoutOrderDetails, Item, OrderData, ProductInfo, UpdateOrderStatus } from "../models";
import { CustomerStorageService } from "./customer-storage.service";

const PUBLIC_URL = '/api/public'

@Injectable()
export class CustomerService{
    
    

    httpClient = inject(HttpClient)
    customerStorageSvc = inject(CustomerStorageService)

    //paymentIntentId = new Subject<string>()
    
    getProductImage(imgFileName: string): Observable<Blob>{
        
        const params = new HttpParams()
                            .set("imgFileName", imgFileName)

        return this.httpClient.get<Blob>(`${PUBLIC_URL}/getProductImg`, {params, responseType: 'blob' as 'json'})
    }

    getProductInfoByName(itemName: string): Observable<ProductInfo>{

        const params = new HttpParams()
                            .set("productName", itemName)
        
        return this.httpClient.get<ProductInfo>(`${PUBLIC_URL}/getPdtInfo`, {params})
    }

    postOrder(orderDetails: CheckoutOrderDetails ): Observable<any>{

        return this.httpClient.post(`${PUBLIC_URL}/postOrder`, orderDetails)
    }

    getOrderByIdAndDeliveryStatus(orderId: string): Observable<OrderData[]>{
        return this.httpClient.get<OrderData[]>(`${PUBLIC_URL}/getOrderByIdAndDeliveryStatus/${orderId}`)
    }

    updateDeliveryStatus(updateDetails: UpdateOrderStatus): Observable<any>{

        return this.httpClient.put<any>(`${PUBLIC_URL}/updateDeliveryStatusById`, updateDetails)
    }

    createPaymentIntent(codp: CheckoutOrderDetails): Observable<any>{

        return this.httpClient.post(`${PUBLIC_URL}/create-PaymentIntent`, codp)
    }

    postOrderforOnlinePayment(codp: CheckoutOrderDetails, orderId: string): Observable<any>{

        return this.httpClient.post(`${PUBLIC_URL}/postOrderforOnlinePay/${orderId}`, codp)
    }

    //Try not to put paymentIntent id as query param or path variable
    //this method is if I decide to retrieve payment intent from server to check payment status or just to check if payment intent based on the payment intent id alr exist
    retrievePaymentIntent(paymentIntentId: string): Observable<any>{

        return this.httpClient.post(`${PUBLIC_URL}/getPaymentIntentStatus`, {paymentIntentId})
    }

    updatePaymentIntent(paymentIntentId: string, codp: CheckoutOrderDetails): Observable<any>{

        const payload = {
            paymentIntentId: paymentIntentId,
            codp: codp
        }

        return this.httpClient.post(`${PUBLIC_URL}/updatePaymentIntent`, payload);
    }
    
}