import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';

import { AlertsService } from './alerts.service';
import { OAuthSettings } from '../oauth';
import { User } from './user';

import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public authenticated: boolean;
  public isProdUser: boolean = false;
  public isNonProdUser: boolean = false;
  public user?: User;
  public graphClient?: Client;
  public productionUsers?: User[];
  public nonProductionUsers?: User[];

  constructor(
    private msalService: MsalService,
    private alertsService: AlertsService
  ) {
    const accounts = this.msalService.instance.getAllAccounts();
    this.authenticated = accounts.length > 0;

    if (this.authenticated) {
      this.msalService.instance.setActiveAccount(accounts[0]);

      this.getProductionUsers().then((users) => {
        this.productionUsers = users;
      });

      this.getNonProductionUsers().then((users) => {
        this.nonProductionUsers = users;
      });

      this.userIsProdUser().then((isProdUser) => {
        this.isProdUser = isProdUser;
      });
      this.userIsNonProdUser().then((isNonProdUser) => {
        this.isNonProdUser = isNonProdUser;
      });

      this.getUser().then((user) => {
        this.user = user;
      });
    }
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
      this.isProdUser = await this.userIsProdUser();
      this.isNonProdUser = await this.userIsNonProdUser();
      this.productionUsers = await this.getProductionUsers();
      this.nonProductionUsers = await this.getNonProductionUsers();
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await this.msalService.logout().toPromise();
    this.user = undefined;
    this.authenticated = false;
    this.isNonProdUser = false;
    this.isProdUser = false;
    this.productionUsers = [];
    this.nonProductionUsers = [];
  }

  async userIsProdUser(): Promise<boolean> {
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

    const memberOf = await this.graphClient
      .api('/me/memberOf/be4ded57-f480-41a6-8825-564f44fad525')
      .get();

    console.log(memberOf ? true : false);

    return memberOf ? true : false;
  }

  async userIsNonProdUser(): Promise<boolean> {
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

    const memberOf = await this.graphClient
      .api('/me/memberOf/1442a75e-c15d-46a1-94b1-5fbb38f2b7f4')
      .get()
      .catch(() => {
        return false;
      });

    console.log(memberOf ? true : false);

    return memberOf ? true : false;
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
      .get();

    const photo = await this.graphClient.api('/me/photo/$value').get();

    const user = new User();
    user.displayName = graphUser.displayName ?? '';
    user.email = graphUser.userPrincipalName ?? '';
    user.timeZone = 'UTC';

    // Use default avatar
    const fileReader = new FileReader();
    fileReader.readAsDataURL(photo);
    fileReader.onloadend = function () {
      user.avatar = fileReader.result as string;
    };

    return user;
  }

  private async getProductionUsers(): Promise<User[] | undefined> {
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
    const groupMembers = await this.graphClient
      .api('/groups/be4ded57-f480-41a6-8825-564f44fad525/members?$count=true')
      .get();

    for (const member of groupMembers.value) {
      try {
        let photo = await this.graphClient
          ?.api(`/users/${member.id}/photo/$value`)
          .get();

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
    }

    return users;
  }

  private async getNonProductionUsers(): Promise<User[] | undefined> {
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
    const groupMembers = await this.graphClient
      .api('/groups/1442a75e-c15d-46a1-94b1-5fbb38f2b7f4/members?$count=true')
      .get();

    for (const member of groupMembers.value) {
      try {
        let photo = await this.graphClient
          ?.api(`/users/${member.id}/photo/$value`)
          .get();

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
    }

    return users;
  }
}
