import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatInputModule, MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true 
})
export class App {
  protected title = 'frontend';
}
