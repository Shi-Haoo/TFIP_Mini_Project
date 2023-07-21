import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './components/home/home.component';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule, Routes } from '@angular/router';
import { MerchantHomeComponent } from './components/merchant-home/merchant-home.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
import { RetrieveOrdersComponent } from './components/retrieve-orders/retrieve-orders.component';
import { ProductsComponent } from './customerComponents/products/products.component';
import { RecipeComponent } from './customerComponents/recipe/recipe.component';
import { SearchOrdersComponent } from './customerComponents/search-orders/search-orders.component';
import { ContactComponent } from './customerComponents/contact/contact.component';
import { CartComponent } from './customerComponents/cart/cart.component';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
//import { HttpInterceptorService } from './services/httpInterceptor.service';
import { MerchantService } from './services/merchant.service';
import { UpdatePhotoComponent } from './components/update-photo/update-photo.component';
import { InsertPhotoComponent } from './components/insert-photo/insert-photo.component';
import { UpdateOrderComponent } from './components/update-order/update-order.component';
import { CustomerService } from './services/customer.service';
import { CustomerStorageService } from './services/customer-storage.service';
import { CustomerParticularsComponent } from './customerComponents/customer-particulars/customer-particulars.component';
import { OrderDialogComponent } from './customerComponents/order-dialog/order-dialog.component';
import { PaymentComponent } from './customerComponents/payment/payment.component';
import { PaymentStatusDialogComponent } from './customerComponents/payment-status-dialog/payment-status-dialog.component';
import { PaymentErrorDialogComponent } from './customerComponents/payment-error-dialog/payment-error-dialog.component';
//import { WithCredentialsInterceptor } from './with.credentials.interceptor';

const appRoutes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'recipe', component: RecipeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'searchOrders', component: SearchOrdersComponent },
  { path: 'cart', component: CartComponent },
  { path: 'particulars', component: CustomerParticularsComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'merchantHome', component: MerchantHomeComponent },
  { path: 'updateProduct', component: UpdateProductComponent },
  { path: 'insertPhoto', component: InsertPhotoComponent },
  { path: 'updatePhoto', component: UpdatePhotoComponent },
  { path: 'retrieveOrders', component: RetrieveOrdersComponent },
  { path: '**', redirectTo:'/', pathMatch: 'full'}
]


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    MerchantHomeComponent,
    UpdateProductComponent,
    UpdatePhotoComponent,
    InsertPhotoComponent,
    RetrieveOrdersComponent,
    UpdateOrderComponent,
    ProductsComponent,
    RecipeComponent,
    SearchOrdersComponent,
    ContactComponent,
    CartComponent,
    CustomerParticularsComponent,
    OrderDialogComponent,
    PaymentComponent,
    PaymentStatusDialogComponent,
    PaymentErrorDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,HttpClientModule, ReactiveFormsModule, RouterModule.forRoot(appRoutes,{ useHash:true })
  ],
  providers: [AuthService, StorageService, MerchantService, CustomerService, CustomerStorageService /*, { provide: HTTP_INTERCEPTORS, useClass: WithCredentialsInterceptor, multi:true}*/],
  bootstrap: [AppComponent]
})
export class AppModule { }
