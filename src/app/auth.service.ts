import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';

import { AlertsService } from './alerts.service';
import { OAuthSettings } from '../oauth';
import { User } from './user';

import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public authenticated: boolean;
  public user?: User;
  public graphClient?: Client;
  public users?: User[];

  constructor(
    private msalService: MsalService,
    private alertsService: AlertsService,
    private sanitizer: DomSanitizer
  ) {
    const accounts = this.msalService.instance.getAllAccounts();
    this.authenticated = accounts.length > 0;
    if (this.authenticated) {
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
    this.getUsers().then((users) => {
      this.users = users;
    });
    this.getUser().then((user) => {
      this.user = user;
    });
  }

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
    const result = await this.msalService
      .loginPopup(OAuthSettings)
      .toPromise()
      .catch((reason) => {
        this.alertsService.addError(
          'Login failed',
          JSON.stringify(reason, null, 2)
        );
      });

    if (result) {
      this.msalService.instance.setActiveAccount(result.account);
      this.authenticated = true;
      this.user = await this.getUser();
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await this.msalService.logout().toPromise();
    this.user = undefined;
    this.authenticated = false;
  }

  private async getUser(): Promise<User | undefined> {
    if (!this.authenticated) return undefined;

    // Create an authentication provider for the current user
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
      this.msalService.instance as PublicClientApplication,
      {
        account: this.msalService.instance.getActiveAccount()!,
        scopes: OAuthSettings.scopes,
        interactionType: InteractionType.Popup,
      }
    );

    // Initialize the Graph client
    this.graphClient = Client.initWithMiddleware({
      authProvider: authProvider,
    });

    // Get the user from Graph (GET /me)
    const graphUser: MicrosoftGraph.User = await this.graphClient
      .api('/me')
      //.select('displayName,userPrincipalName')
      .get();

    //console.log('user', JSON.stringify(graphUser));

    const memberOf = await this.graphClient
      .api('/me/memberOf/be4ded57-f480-41a6-8825-564f44fad525')
      //.select('displayName,userPrincipalName')
      .get();

    //console.log('memberOf', JSON.stringify(memberOf));

    const photo = await this.graphClient
      .api('/me/photo/$value')
      //.select('displayName,userPrincipalName')
      .get();

    const user = new User();
    user.displayName = graphUser.displayName ?? '';
    // Prefer the mail property, but fall back to userPrincipalName
    user.email = graphUser.userPrincipalName ?? '';
    user.timeZone = 'UTC';

    // Use default avatar
    const fileReader = new FileReader();
    fileReader.readAsDataURL(photo);
    fileReader.onloadend = function () {
      // result includes identifier 'data:image/png;base64,' plus the base64 data
      user.avatar = fileReader.result as string;
    };

    //  Group members
    //groups/be4ded57-f480-41a6-8825-564f44fad525/members?$count=true
    //const groupMembers = await this.graphClient
    //.api('/groups/be4ded57-f480-41a6-8825-564f44fad525/members?$count=true')
    //.api('/groups/b9738c5e-1195-4baf-9580-1aa33d30c822/members?$count=true')
    //.select('displayName,userPrincipalName')
    //.get();

    //console.log('groupMembers', JSON.stringify(groupMembers));

    return user;
  }

  private async getUsers(): Promise<User[] | undefined> {
    if (!this.authenticated) return undefined;

    // Create an authentication provider for the current user
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
      this.msalService.instance as PublicClientApplication,
      {
        account: this.msalService.instance.getActiveAccount()!,
        scopes: OAuthSettings.scopes,
        interactionType: InteractionType.Popup,
      }
    );

    // Initialize the Graph client
    this.graphClient = Client.initWithMiddleware({
      authProvider: authProvider,
    });

    let users: User[] = [];
    //  Group members
    //groups/be4ded57-f480-41a6-8825-564f44fad525/members?$count=true
    const groupMembers = await this.graphClient
      .api('/groups/be4ded57-f480-41a6-8825-564f44fad525/members?$count=true')
      //.api('/groups/b9738c5e-1195-4baf-9580-1aa33d30c822/members?$count=true')
      //.select('displayName,userPrincipalName')
      .get();

    console.log('groupMembers', JSON.stringify(groupMembers));
    for (const member of groupMembers.value) {
      console.log(member);
      let profilePicture;

      try {
        let photo = await this.graphClient
          ?.api(`/users/${member.id}/photo/$value`)
          .get();

        console.log(photo);

        const fileReader = new FileReader();
        fileReader.readAsDataURL(photo);
        fileReader.onloadend = function () {
          // result includes identifier 'data:image/png;base64,' plus the base64 data
          users.push({
            displayName: member.displayName,
            email: member.userPrincipalName,
            avatar: fileReader.result as string,
            timeZone: 'UTC',
          });
        };
      } catch {
        users.push({
          displayName: member.displayName,
          email: member.userPrincipalName,
          avatar: '/assets/no-profile-photo.png',
          timeZone: 'UTC',
        });
      }
      console.log(profilePicture);
    }

    return users;
  }
}
