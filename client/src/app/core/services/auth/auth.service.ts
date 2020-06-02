import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {ApiEndpoints, ApiMethod} from 'src/app/core/interfaces/api.interface';
import {LocalStorageTypes} from 'src/app/core/interfaces/local-storage.interface';
import {ErrorService} from 'src/app/core/services/error/error.service';
import {HttpService} from 'src/app/core/services/http/http.service';
import {LocalStorageService} from 'src/app/core/services/local-storage/local-storage.service';
import {RawUser} from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authData: BehaviorSubject<RawUser> = new BehaviorSubject<RawUser>(null);

  constructor(
    private _http: HttpService,
    private _localStorage: LocalStorageService,
    private _error: ErrorService,
    private _router: Router
  ) {
    this.authData.next(this.getUser());
  }

  isAuthenticated() {
    return !!this._localStorage.getItem(LocalStorageTypes.SESSION, 'user');
  }

  getUser() {
    return this._localStorage.getItem(LocalStorageTypes.SESSION, 'user');
  }

  login(loginData) {
    return new Promise((resolve, reject) => {
      this._http.requestCall(ApiEndpoints.LOGIN, ApiMethod.POST, loginData)
        .subscribe((resp: RawUser) => {
          this._localStorage.setItem(LocalStorageTypes.SESSION, 'user', resp);
          this.authData.next(resp);
          resolve(resp);
        });
    });
  }
}
