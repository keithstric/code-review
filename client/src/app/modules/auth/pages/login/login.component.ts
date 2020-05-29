import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ErrorService} from 'src/app/core/services/error/error.service';
import {AuthService} from 'src/app/core/services/auth/auth.service';
import {PROJECT_NAME} from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth-shared-styles.scss']
})
export class LoginComponent implements OnInit {
  loginData: FormGroup;
  email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  password: FormControl = new FormControl('', [Validators.required]);
  errorMsg: string;
  projectName: string = PROJECT_NAME;

  constructor(
    private _formBuilder: FormBuilder,
    private _error: ErrorService,
    private _auth: AuthService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to the error service to catch errors
    this._error.errorEvent.subscribe((err: Error) => {
      this.errorMsg = err.message;
    });
    if (this._auth.isAuthenticated()) {
      this._router.navigateByUrl('/');
    }
    this.buildFormGroup();
  }

  /**
   * Build the formGroup
   */
  private buildFormGroup() {
    this.loginData = this._formBuilder.group({
      email: this.email,
      password: this.password
    });
  }

  /**
   * Gets the validation message to show for each field
   * @param {string} field
   */
  getErrorMessage(field: string) {
    if (field === 'email') {
      if (this.email.hasError('required')) {
        return 'You must provide an email address';
      }else if (this.email.hasError('email')) {
        return 'Please enter a valid email address (yourname@knowhere.com)';
      }
    }else if (field === 'password') {
      if (this.password.hasError('required')) {
        return 'You must provide a password';
      }
    }
    return '';
  }

  /**
   * Perform the authentication
   */
  login() {
    this._auth.login(this.loginData.getRawValue())
      .then((resp) => {
        console.log('login response=', resp);
        this._router.navigateByUrl('/');
      });
  }
}
