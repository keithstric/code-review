import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {tap} from 'rxjs/operators';
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
    return this._http.requestCall(ApiEndpoints.LOGIN, ApiMethod.POST, loginData)
      .pipe(tap((resp: RawUser) => {
        this._localStorage.setItem(LocalStorageTypes.SESSION, 'user', resp);
        this.authData.next(resp);
        return resp;
      }));
  }

  logout() {
    return this._http.requestCall(ApiEndpoints.LOGOUT, ApiMethod.GET)
      .pipe(tap((args) => {
        this._localStorage.removeItem(LocalStorageTypes.SESSION, 'user');
        this.authData.next(null);
        return args;
      }));
  }

  register(registrationData) {
    return this._http.requestCall(ApiEndpoints.REGISTER, ApiMethod.POST, registrationData)
      .pipe(tap((resp: RawUser) => {
        this._localStorage.setItem(LocalStorageTypes.SESSION, 'user', resp);
        this.authData.next(resp);
        return resp;
      }));
  }

  changePassword(chgPwData) {
    return this._http.requestCall(ApiEndpoints.CHANGE_PW, ApiMethod.PUT, chgPwData)
      .pipe(tap((resp: RawUser) => {
        this._localStorage.setItem(LocalStorageTypes.SESSION, 'user', resp);
        this.authData.next(resp);
        return resp;
      }));
  }

  forgotPassword(forgotPwData) {
    return this._http.requestCall(ApiEndpoints.FORGOT, ApiMethod.PUT, forgotPwData)
      .pipe(tap((resp: RawUser) => {
        this._localStorage.setItem(LocalStorageTypes.SESSION, 'user', resp);
        this.authData.next(resp);
        return resp;
      }));
  }
}
