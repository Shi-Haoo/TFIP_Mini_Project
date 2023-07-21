import { Injectable } from "@angular/core";
import { loginResponse } from "../models";
import { Subject } from "rxjs";

const USER_KEY = 'auth-user'

@Injectable()
export class StorageService{
    
    isLoggedInSuccess = new Subject<boolean>()

    saveUser(user: loginResponse): void {
        //remove data first in the event where user go to login page without logging out
        window.sessionStorage.removeItem(USER_KEY);
        window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    
    getUser(): any {
        const user = window.sessionStorage.getItem(USER_KEY);
        if (user) {
          return JSON.parse(user);
        }
    
        return {};
      }
    
    isLoggedIn(): boolean {
        const user = window.sessionStorage.getItem(USER_KEY);
        if (user) {
          return true;
        }
    
        return false;
      }

    logout(){
        window.sessionStorage.removeItem(USER_KEY);
    }
}