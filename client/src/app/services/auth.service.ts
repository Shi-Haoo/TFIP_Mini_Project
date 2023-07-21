import { HttpClient } from "@angular/common/http"
import { Injectable, inject } from "@angular/core"
import { loginRequest, registerRequest } from "../models"


const AUTH_URL = '/api/public'

@Injectable()
export class AuthService{

    httpClient = inject(HttpClient)

    login(loginDetails: loginRequest){
        
        return this.httpClient.post<any>(`${AUTH_URL}/signin`, loginDetails)
    }

    register(registerDetails: registerRequest){

        return this.httpClient.post<any>(`${AUTH_URL}/signup`, registerDetails)
    }
    
}