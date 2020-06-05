import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/core/services/auth/auth.service';
import {RawUser} from 'src/app/core/interfaces/user.interface';
import {UiService} from '../../../../core/services/ui/ui.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotPwForm: FormGroup;
  email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  new_password: FormControl = new FormControl('', [Validators.required]);
  verify_password: FormControl = new FormControl('', [Validators.required]);
  user: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _auth: AuthService,
    private _router: Router,
    private _ui: UiService
  ) { }

  ngOnInit(): void {
    this.buildFormGroup();
    this.user = this._auth.getUser();
  }

  ngOnDestroy() { }

  getErrorMessage(field: string) {

  }

  buildFormGroup() {
    this.forgotPwForm = this._formBuilder.group({
      email: this.email,
      new_password: this.new_password,
      verify_password: this.verify_password
    });
  }

  onCancelClick() {
    this._router.navigateByUrl('/auth/login');
  }

  onUpdateClick() {
    this._auth.forgotPassword(this.forgotPwForm.getRawValue())
      .subscribe((resp: RawUser) => {
        this._router.navigateByUrl('/auth/login');
        this._ui.notifyUser(`Reset of forgotten password successful`);
      });
  }
}
