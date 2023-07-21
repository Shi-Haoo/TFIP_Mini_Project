import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-merchant-home',
  templateUrl: './merchant-home.component.html',
  styleUrls: ['./merchant-home.component.css']
})
export class MerchantHomeComponent implements OnInit {

  username!: string 

  authService = inject(AuthService)
  storageService = inject(StorageService)
  router = inject(Router)
  
  ngOnInit(): void {

    //If user is already logged in, object returned by getUser() should not be undefined
     if(this.storageService.getUser().username){
       this.username = this.storageService.getUser().username
       
       console.info("username>>>", this.username)
     }
    
    // undefined => not logged in yet. Route back to login page
    else{this.router.navigate(['/login'])}
      
  }
}
