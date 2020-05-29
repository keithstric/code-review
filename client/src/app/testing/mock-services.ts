import {HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {ApiEndpoints, ApiMethod} from 'src/app/core/interfaces/api.interface';
import userJson from 'src/app/testing/mock-data/user.json';

export class MockHttpService {
  requestCall(api: ApiEndpoints | string, method: ApiMethod, data?: any) { }
  handleError(error: HttpErrorResponse, self: MockHttpService) { }
}

export class MockErrorService {
  errorEvent: Subject<Error> = new Subject<any>();
  notifyUser(notificationCode: number, notification: string) { }
  handleError(errorCode: number, message: string, err: Error) { }
}

export class MockLocalStorageService {
  getItem(storageType: 'local'|'session', varName: string) { }
  setItem(storageType: 'local'|'session', varName: string, value: any) { }
  removeItem(storageType: 'local'|'session', varName: string) { }
}

export class MockUiService {
  notifyUser(msg: string, duration?: number, action?: string, actionFn?: (...args) => void) { }
}

export class MockAuthService {
  authData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isAuthenticated() { }
  getUser() {
    return userJson;
  }
  login(loginData: any) { }
}

export class MockHeaderService {
  currentHeaderTitleSub: BehaviorSubject<string> = new BehaviorSubject('code-review');
  updateHeaderTitle(newTitle: string) {}
}

export class MockRouter {
  navigateByUrl(url: string) { return url; }
}
