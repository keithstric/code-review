import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {AuthService} from 'src/app/core/services/auth/auth.service';
import {PROJECT_NAME} from 'src/environments/environment';
import {RawUser} from '../../../../core/interfaces/user.interface';
import {UiService} from '../../../../core/services/ui/ui.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  changePwForm: FormGroup;
  password: FormControl = new FormControl('');
  new_password: FormControl = new FormControl('');
  verify_password: FormControl = new FormControl('');
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
    this.changePwForm = this._formBuilder.group({
      password: this.password,
      new_password: this.new_password,
      verify_password: this.verify_password
    });
  }

  onCancelClick() {
    this._router.navigateByUrl('/auth/user');
  }

  onUpdateClick() {
    this._auth.changePassword(this.changePwForm.getRawValue())
      .subscribe((resp: RawUser) => {
        this._router.navigateByUrl('/auth/user');
        this._ui.notifyUser('Successfully changed password');
      });
  }
}
