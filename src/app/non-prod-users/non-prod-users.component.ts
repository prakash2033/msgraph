import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-non-prod-users',
  templateUrl: './non-prod-users.component.html',
  styleUrls: ['./non-prod-users.component.css'],
})
export class NonProdUsersComponent implements OnInit {
  get users(): User[] | undefined {
    return this.authService.nonProductionUsers;
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
}
