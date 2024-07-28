import { SubmitProblemComponent } from './../Components/submit-problem/submit-problem.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {

  baseUrl: string = environment.apiUrl + '/auth';

  userData = new BehaviorSubject(null);

  headers: any;

  constructor(
    private _HttpClient: HttpClient,
    private _Router: Router) {
      const token = localStorage.getItem('userToken');
      if (token) {
        this.headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      } else {
        this.headers = new HttpHeaders();
      }
    if (this.isLogin()) {
      this.decodeUserData();
    }
  }

  getUserToken() {
    return localStorage.getItem('userToken');
  }

  ngOnInit(): void {
    this.userData.subscribe(() => {
      setTimeout(() => {
        if (this.getUserHandle()) {
          this.logOut();
        }
      }, 86400000);
    });
  }

  decodeUserData() {
    let encodedToken = JSON.stringify(localStorage.getItem('userToken'));
    let decodedToken: any = jwtDecode(encodedToken);
    if (this.userData.value == null) {
      this.userData.next(decodedToken);
    }
    return decodedToken;
  }

  getUserHandle() {
    if (this.isLogin()) {
      return this.decodeUserData().sub || "";
    }
  }

  register(userData: object): Observable<any> {
    return this._HttpClient.post(
      `${this.baseUrl}/register`,
      userData
    );
  }

  login(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/login`, userData);
  }

  forgetPassword(email: string): Observable<any> {
    return this._HttpClient.post(
      `${this.baseUrl}/forget-password`,
      email
    );

  };

  resetPassword(requestBody: any): Observable<any> {
    return this._HttpClient.post(
      `${this.baseUrl}/reset-password`,
      requestBody
    );
  }

  changePassword(userData: object): Observable<any> {
    return this._HttpClient.post(
      `${this.baseUrl}/change-password`,
      userData,
      { headers: this.headers }
    );
  }

  logOut() {
    localStorage.removeItem('userToken');
    this.userData.next(null);
    this._Router.navigate(['/login']).then(r => r);
  }

  isLogin(): boolean {
    return localStorage.getItem('userToken') != null;
  }

}
