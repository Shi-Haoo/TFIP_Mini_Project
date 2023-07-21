import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { loginRequest } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  isLoggedIn = false;
  //toLogOutMessage = ''
  loginForm!: FormGroup
  hide = true

  authService = inject(AuthService)
  storageService = inject(StorageService)
  fb: FormBuilder = inject(FormBuilder)
  router = inject(Router)
  
  ngOnInit(): void {
      // if(this.storageService.isLoggedIn()){
      //   this.isLoggedIn = true
      // }
    this.isLoggedIn = this.storageService.isLoggedIn()
    this.loginForm = this.CreateLoginForm()
  }

  processLogin(){
    const loginInfo: loginRequest = this.loginForm.value
    console.info("loginInfo>>>", loginInfo)

    firstValueFrom(this.authService.login(loginInfo))
    .then((r)=>{
      console.info("login successful response>>>", r)
      this.storageService.saveUser(r)
      this.isLoggedIn = true
      this.storageService.isLoggedInSuccess.next(true)
      this.router.navigate(['/merchantHome'])
    })
    .catch((error: HttpErrorResponse)=>
    { 
      this.storageService.isLoggedInSuccess.next(false)
      //if case to capture incorrect username or password
      if(error.status === 401){
        console.error("Invalid credentials error>>>", error)
        alert("Invalid username/password. Please try again.\n" + `Error: ${error.status} ${error.statusText}`)
      }
      else{
        console.error('An error occurred:', error)
        alert(`An error occurred: ${error.error}\nStatus code: ${error.status}`)
      }
      
    })
      
  }


  private CreateLoginForm(): FormGroup{

    return this.fb.group({
      username: this.fb.control<string>('',[Validators.required]),
      password: this.fb.control<string>('', [Validators.required, Validators.minLength(7)])
    })
  }

}
