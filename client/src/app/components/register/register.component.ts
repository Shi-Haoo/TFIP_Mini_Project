import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { registerRequest } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  hide = true

  registerForm!: FormGroup
  

  authService = inject(AuthService)
  storageService = inject(StorageService)
  fb: FormBuilder = inject(FormBuilder)
  router = inject(Router)
  
  ngOnInit(): void {
      
      this.registerForm = this.CreateRegisterForm()
  }

  processRegistration(){
    const registerInfo: registerRequest = this.registerForm.value
    console.info("registerInfo>>>", registerInfo)

    firstValueFrom(this.authService.register(registerInfo))
    .then((r)=>{
      console.info("register successful response>>>",r)
      alert(r.message as string)
      this.router.navigate(['/login'])
    })
    //to display error message only, use error.error
    .catch((error: HttpErrorResponse)=>alert(JSON.stringify(error.error)))
  }

  private CreateRegisterForm(): FormGroup{

    return this.fb.group({
      username: this.fb.control<string>('',[Validators.required]),
      password: this.fb.control<string>('', [Validators.required, Validators.minLength(7)]),
      email: this.fb.control<string>('', [Validators.required, Validators.email])
    })
  }

}
