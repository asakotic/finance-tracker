import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Transaction {
  isIncome: boolean;
  amount: number;
  category: string;
  date: string;
}

interface TransactionEdit {
  id: number;
  income: boolean;
  amount: number;
  category: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:8080/transactions';
  private jwt = localStorage.getItem('jwt');


  constructor(private http: HttpClient) { }

  createTransaction(transaction: Transaction): Observable<any> {
    return this.http.post(this.apiUrl, transaction, {
      headers: {
        Authorization: `Bearer ${this.jwt}`
      }
    });
  }
  getTransactionById(id: number) {
    return this.http.get<TransactionEdit>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${this.jwt}`
      }
    });
  }

  updateTransaction(id: number, transaction: any) {
    return this.http.put(`${this.apiUrl}/${id}`, transaction, {
      headers: {
        Authorization: `Bearer ${this.jwt}`
      }
    });
  }
}
