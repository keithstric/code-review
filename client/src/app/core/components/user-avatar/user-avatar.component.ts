import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {RawUser} from '../../interfaces/user.interface';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit, OnDestroy {
  user: RawUser;
  userSub: Subscription;

  constructor(
    private _auth: AuthService
  ) { }

  ngOnInit(): void {
    console.log('UserAvatarComponent.ngOnInit');
    this.userSub = this._auth.authData.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

}
