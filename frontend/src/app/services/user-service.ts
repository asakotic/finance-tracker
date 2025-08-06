import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private loginUrl = 'http://localhost:8080/users/login';
  private registerUrl = 'http://localhost:8080/users/register';
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedIn.asObservable();

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, { username, password });
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(this.registerUrl, { username, password });
  }

  setLoginStatus(status: boolean): void {
    this.isLoggedIn.next(status);
  }

  logout() {
    localStorage.removeItem('jwt');
    this.isLoggedIn.next(false);
  }

  checkLoginStatus() {
    const token = localStorage.getItem('jwt');
    this.isLoggedIn.next(!!token);
  }
}