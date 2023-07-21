// import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
// import { Injectable, inject } from "@angular/core";
// import { StorageService } from "./storage.service";
// import { Observable, catchError, throwError } from "rxjs";



// @Injectable()
// export class HttpInterceptorService implements HttpInterceptor {
    
//     storageService = inject(StorageService)
    
    
//     //If user is already logged in, add the http header to include the bearer token
//     //If there is Authroization error 401 even though user is logged in and has token,
//     //it means token expired. Logout the user
//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         if (this.storageService.isLoggedIn()) {
//             const JWT_TOKEN = this.storageService.getUser().token
//             const request = req.clone({
//                 headers: new HttpHeaders({
//                     'Authorization': `Bearer ${JWT_TOKEN}`
//                 })
//             });
//             return next.handle(request).pipe(
// 				catchError(err => {
// 					if(err instanceof HttpErrorResponse && err.status === 401) {
// 						this.storageService.logout();
// 					}
// 					return throwError(err);
// 				})
// 			);
//         }
       
// 		return next.handle(req);
//     }
// }