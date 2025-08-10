import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TransactionService } from '../../services/transaction-service';
import { Router } from '@angular/router';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableDataSource } from '@angular/material/table';

interface Transaction {
  id: number;
  date: string;
  category: string;
  amount: number;
  income: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
    MatSort,
    MatPaginator,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    NgIf,
    NgFor
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  page = 0;
  size = 10;
  sortBy = 'date';
  sortDirection = 'desc';

  filters: {
    isIncome?: boolean | null;
    category?: string | null;
  } = {
    isIncome: null, // null = all, true = income, ...
    category: null
  };

  totalElements = 0;
  displayedColumns: string[] = ['date', 'category', 'amount', 'type', 'actions'];
  allTransactions: Transaction[] = [];
  dataSource = new MatTableDataSource<Transaction>([]);

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true
  };

  availableCategories: string[] = [];

  constructor(
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadAllTransactions();
  }
  get totalIncome(): number {
    return this.getFilteredTransactions()
      .filter(transaction => transaction.income)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  get totalExpenses(): number {
    return this.getFilteredTransactions()
      .filter(transaction => !transaction.income)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  get balance(): number {
    return this.totalIncome - this.totalExpenses;
  }

  private getFilteredTransactions(): Transaction[] {
    let filteredTransactions = this.allTransactions;

    if (this.filters.isIncome !== null) {
      filteredTransactions = filteredTransactions.filter(t => t.income === this.filters.isIncome);
    }
    if (this.filters.category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === this.filters.category);
    }

    return filteredTransactions;
  }

  loadAllTransactions() {
    this.transactionService.getTransactions(0, 9999, this.sortBy, this.sortDirection, {})
      .subscribe(page => {
        this.allTransactions = page.content;
        this.totalElements = this.allTransactions.length;
        this.extractCategories();
        this.updateView();
      });
  }


  updateView() {
    const filteredTransactions = this.getFilteredTransactions();

    this.updatePieChart(filteredTransactions);
    let sortedTransactions = [...filteredTransactions];
    if (this.sortBy) {
      sortedTransactions.sort((a: any, b: any) => {
        const aValue = a[this.sortBy];
        const bValue = b[this.sortBy];
        let comparison = 0;

        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }
        return this.sortDirection === 'asc' ? comparison : comparison * -1;
      });
    }

    const startIndex = this.page * this.size;
    const endIndex = startIndex + this.size;
    this.dataSource.data = sortedTransactions.slice(startIndex, endIndex);

    this.totalElements = filteredTransactions.length;
    this.cdr.detectChanges();
  }

  updatePieChart(transactions: Transaction[]) {
    const grouped = transactions.reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    this.pieChartData = {
      labels: Object.keys(grouped),
      datasets: [{ data: Object.values(grouped) }]
    };
  }

  extractCategories() {
    this.availableCategories = [...new Set(this.allTransactions.map(t => t.category))].sort();
  }

  deleteTransaction(id: number) {
    this.transactionService.deleteTransaction(id)
      .subscribe(() => this.loadAllTransactions());
  }
  
  editTransaction(id: number) {
    this.router.navigate(['/edit', id]);
  }
  
  addNewTransaction() {
    this.router.navigate(['/form']);
  }
  goToAdvices() {
    this.router.navigate(['/advices']);
  }

  onFilterChange() {
    this.page = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updateView();
  }

  onSortChange(sort: Sort) {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.updateView();
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.updateView();
  }
}