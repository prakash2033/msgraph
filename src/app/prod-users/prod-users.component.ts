import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-prod-users',
  templateUrl: './prod-users.component.html',
  styleUrls: ['./prod-users.component.css'],
})
export class ProdUsersComponent implements OnInit {
  get users(): User[] | undefined {
    return this.authService.productionUsers;
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
}
