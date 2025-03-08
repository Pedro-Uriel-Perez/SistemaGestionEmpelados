// components/shared/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  username: string = '';
  userRole: string = '';

  constructor(
    public authService: AuthService // Public para poder usarlo en el template
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.username = user.username;
      this.userRole = this.authService.getUserRole();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}