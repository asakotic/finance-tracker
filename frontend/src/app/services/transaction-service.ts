import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Transaction {
  isIncome: boolean;
  amount: number;
  category: string;
  date: string;
}
@Injectable({
  providedIn: 'root'
})
export class TransactionService {
   private apiUrl = 'http://localhost:8080/transactions';


  constructor(private http: HttpClient) { }

  createTransaction(transaction: Transaction): Observable<any> {
    const jwt = localStorage.getItem('jwt');
    return this.http.post(this.apiUrl, transaction, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
  }
}
