import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { OrderData, UpdateOrderStatus, updateDescriptionRequest } from "../models";
import { StorageService } from "./storage.service";
import { Observable } from "rxjs";
import { SafeResourceUrl } from "@angular/platform-browser";

const PROTECTED_URL = '/api/protected'

@Injectable()
export class MerchantService{

    httpClient = inject(HttpClient)
    storageService = inject(StorageService)

    Base64ImgStr!: string

    //safeBase64ImgStr!: SafeResourceUrl
    
    

    updateProductDeets(pdtDetails: updateDescriptionRequest){

        const JWT_TOKEN = this.storageService.getUser().token
        const headers = new HttpHeaders().set('Authorization', `Bearer ${JWT_TOKEN}`)
        return this.httpClient.put<any>(`${PROTECTED_URL}/updateProductDescription`, pdtDetails, {headers: headers})
    }

    insertImage(imageFileName: string, file: File): Observable<any>{

        const formData = new FormData()

        formData.set("imageFileName", imageFileName)
        formData.set("myFile", file)
        
        const JWT_TOKEN = this.storageService.getUser().token
        const headers = new HttpHeaders().set('Authorization', `Bearer ${JWT_TOKEN}`)
        
        return this.httpClient.post<any>(`${PROTECTED_URL}/insertImage`, formData, {headers: headers})
    }

    updateProductPhoto(imageName: string): Observable<Blob>{
        
        const JWT_TOKEN = this.storageService.getUser().token
        const headers = new HttpHeaders().set('Authorization', `Bearer ${JWT_TOKEN}`).set('Accept', 'image/jpeg');
        /*
        TypeScript does not have a specific type for Blob, using as 'json' tells TypeScript to 
        consider the Blob type as json for the purpose of type checking.Recommended to include 
        responseType: 'blob' as 'json' in your code to ensure that the response is correctly 
        interpreted as a Blob object.
        */ 
        return this.httpClient.get<Blob>(`${PROTECTED_URL}/getPhoto/${imageName}`, {headers: headers, responseType: 'blob' as 'json'})
    }

    retrieveOrdersByDeliveryStatus(): Observable<OrderData[]>{

        const JWT_TOKEN = this.storageService.getUser().token
        const headers = new HttpHeaders().set('Authorization', `Bearer ${JWT_TOKEN}`)

        /*const params = new HttpParams()
                            .set("offset", offset)
                            .set("limit", limit)
                            .set("filter", filter)
        const options = {
            headers: headers,
            params: params
        }*/

        return this.httpClient.get<OrderData[]>(`${PROTECTED_URL}/retrieveOrders`, {headers: headers})
    }

    updateOrderStatus(updateDetails: UpdateOrderStatus): Observable<any>{

        const JWT_TOKEN = this.storageService.getUser().token
        const headers = new HttpHeaders().set('Authorization', `Bearer ${JWT_TOKEN}`)

        // const params = new HttpParams()
        //                     .set("orderId", orderId)
        

        return this.httpClient.put<any>(`${PROTECTED_URL}/updateOrderStatus`, updateDetails, {headers: headers})

    }
    
    saveImgNametoLocalStorage(imageName: string){
        localStorage.setItem('kimchiImgName', imageName)
    }
}