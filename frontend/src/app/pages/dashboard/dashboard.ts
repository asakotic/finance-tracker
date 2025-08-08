import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true
})
export class Dashboard {

  constructor(private router: Router) { }

  navigateToEdit(transactionId: number): void {
    this.router.navigate(['/edit', transactionId]);
  }
}
