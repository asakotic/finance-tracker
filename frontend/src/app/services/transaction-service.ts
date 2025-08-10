import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:8080/transactions';
  private jwt = localStorage.getItem('jwt') || '';


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

  private buildHttpParams(filters: {
    isIncome?: boolean | null;
    category?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    minAmount?: number | null;
    maxAmount?: number | null;
  }, page: number, size: number, sortBy: string, sortDirection: string): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (filters.isIncome !== undefined && filters.isIncome !== null) {
      params = params.set('isIncome', filters.isIncome.toString());
    }
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate.toISOString());
    }
    if (filters.minAmount !== undefined && filters.minAmount !== null) {
      params = params.set('minAmount', filters.minAmount.toString());
    }
    if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
      params = params.set('maxAmount', filters.maxAmount.toString());
    }

    return params;
  }

  getTransactions(
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
    filters: {
      isIncome?: boolean | null;
      category?: string | null;
      startDate?: Date | null;
      endDate?: Date | null;
      minAmount?: number | null;
      maxAmount?: number | null;
    }
  ): Observable<Page<TransactionEdit>> {
    const params = this.buildHttpParams(filters, page, size, sortBy, sortDirection);

    return this.http.get<Page<TransactionEdit>>(this.apiUrl, {
      params,
      headers: { Authorization: `Bearer ${this.jwt}` }
    });
  }




  deleteTransaction(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { Authorization: `Bearer ${this.jwt}` }
    });
  }
}
