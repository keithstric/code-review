import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {CoreModule} from 'src/app/core/core.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { UserComponent } from './pages/user/user.component';

const routes: Routes = [
  {path: '', redirectTo: 'login'},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'changepw', component: ChangePasswordComponent},
  {path: 'user', component: UserComponent}
];

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ChangePasswordComponent,
    UserComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    RouterModule
  ]
})
export class AuthModule { }
