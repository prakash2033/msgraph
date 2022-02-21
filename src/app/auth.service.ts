import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';

import { AlertsService } from './alerts.service';
import { OAuthSettings } from '../oauth';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public authenticated: boolean;
  public user?: User;

  constructor(
    private msalService: MsalService,
    private alertsService: AlertsService) {

    this.authenticated = false;
    this.user = undefined;
  }

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
    const result = await this.msalService
      .loginPopup(OAuthSettings)
      .toPromise()
      .catch((reason) => {
        this.alertsService.addError('Login failed',
          JSON.stringify(reason, null, 2));
      });

    if (result) {
      this.msalService.instance.setActiveAccount(result.account);
      this.authenticated = true;
      // Temporary placeholder
      this.user = new User();
      this.user.displayName = 'Adele Vance';
      this.user.email = 'AdeleV@contoso.com';
      this.user.avatar = '/assets/no-profile-photo.png';

      //const account = this.msalService.instance.getActiveAccount();

      // Temporary to display token in an error box
      this.alertsService.addSuccess('Token acquired', result.accessToken);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await this.msalService.logout().toPromise();
    this.user = undefined;
    this.authenticated = false;
  }
}