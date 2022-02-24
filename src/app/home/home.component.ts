import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Is a user logged in?
  get authenticated(): boolean {
    return this.authService.authenticated;
  }
  // The user
  get user(): User | undefined {
    return this.authService.user;
  }

  get users(): User[] | undefined {
    return this.authService.users;
  }

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  async signIn(): Promise<void> {
    await this.authService.signIn();
  }
}
