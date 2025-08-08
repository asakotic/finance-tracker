import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category-service';
import { TransactionService } from '../../services/transaction-service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgFor } from '@angular/common';


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
    NgFor
  ],
  selector: 'app-edit-form',
  templateUrl: './edit-form.html',
  styleUrls: ['./edit-form.scss']
})
export class EditForm {
  transactionType: 'income' | 'expense' = 'expense';
  amount: number | null = null;
  selectedCategory: Category | null = null;
  categories: Category[] = [];
  date: Date = new Date();
  time: string = this.formatTime(new Date());

  transactionId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    this.transactionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTransaction(this.transactionId);
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

  loadTransaction(id: number): void {
    this.transactionService.getTransactionById(id).subscribe(tx => {
      this.transactionType = tx.income ? 'income' : 'expense';
      this.amount = tx.amount;
      this.date = new Date(tx.date);
      this.time = this.formatTime(new Date(tx.date));

      this.categoryService.getCategories().subscribe(cats => {
        this.categories = cats;
        this.selectedCategory = cats.find(c => c.name === tx.category) || null;
      });
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

  updateTransaction(): void {
    const dateTime = this.getCombinedDateTime();

    if (this.amount && this.selectedCategory && dateTime) {
      const payload = {
        isIncome: this.transactionType === 'income',
        amount: this.amount,
        category: this.selectedCategory.name,
        date: dateTime.toISOString()
      };

      this.transactionService.updateTransaction(this.transactionId, payload).subscribe(() => {
        alert('Transaction updated successfully.');
        this.router.navigate(['/dashboard']);
      });
    } else {
      alert('Fill all fields.');
    }
  }
}
