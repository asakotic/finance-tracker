import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category-service';
import { TransactionService } from '../../services/transaction-service';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgFor,
    MatIcon
  ],
  selector: 'app-form',
  templateUrl: './form.html',
  styleUrls: ['./form.scss']
})
export class Form {
  transactionType: 'income' | 'expense' = 'expense';
  amount: number | null = null;
  selectedCategory: Category | null = null;
  categories: Category[] = [];

  date: Date = new Date();
  time: string = this.formatTime(new Date());

  constructor(private categoryService: CategoryService, private transactionService: TransactionService, private router: Router) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  getCombinedDateTime(): Date {
    const [hours, minutes] = this.time.split(':').map(Number);
    const combined = new Date(this.date);
    combined.setHours(hours);
    combined.setMinutes(minutes);
    return combined;
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  onTransactionTypeChange(): void {
    this.loadCategories();
    this.selectedCategory = null;
  }

  addNewCategory(): void {
    const name = prompt('Enter the name of the new category:');
    if (name && name.trim()) {
      this.categoryService.addCategory(name.trim()).subscribe(newCat => {
        this.categories.push(newCat);
        this.selectedCategory = newCat;
      });
    }
  }

  submitTransaction(): void {
    const dateTime = this.getCombinedDateTime();
    if (this.amount && this.selectedCategory && dateTime) {
      console.log({
        amount: this.amount,
        category: this.selectedCategory,
        dateTime
      });
      this.transactionService.createTransaction({
        isIncome: this.transactionType === 'income',
        amount: this.amount,
        category: this.selectedCategory.name,
        date: dateTime.toISOString()
      }).subscribe(() => {
        alert('Transaction saved successfully.');
        this.router.navigate(['/dashboard']);
      });
    } else {
      alert('Fill all fields.');
    }
  }
    goBack() {
    this.router.navigate(['/dashboard']);
  }
}
