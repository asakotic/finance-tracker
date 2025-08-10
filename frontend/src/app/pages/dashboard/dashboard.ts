import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TransactionService } from '../../services/transaction-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  page = 0;
  size = 10;
  sortBy = 'date';
  sortDirection = 'desc';
  filters: {
    isIncome?: boolean | null;
    category?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    minAmount?: number | null;
    maxAmount?: number | null;
  } = {};

  totalElements = 0;

  displayedColumns: string[] = ['date', 'category', 'amount', 'type', 'actions'];
  dataSource: any[] = [];

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true
  };

  constructor(private transactionService: TransactionService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getTransactions(this.page, this.size, this.sortBy, this.sortDirection, this.filters)
      .subscribe(page => {
        this.dataSource = page.content;
        this.totalElements = page.totalElements;

        const grouped = this.dataSource.reduce((acc: any, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {});

        this.pieChartData = {
          labels: Object.keys(grouped),
          datasets: [{ data: Object.values(grouped) }]
        };
        this.cdr.detectChanges();
      });
  }

  deleteTransaction(id: number) {
    this.transactionService.deleteTransaction(id)
      .subscribe(() => this.loadTransactions());
  }
  editTransaction(id: number) {
    this.router.navigate(['/edit', id]);
  }
  addNewTransaction() {
  this.router.navigate(['/form']);
}
}
