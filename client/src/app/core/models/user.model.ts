import {RawUser} from '../interfaces/user.interface';

export class UserModel implements RawUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;

  constructor(rawUser: RawUser) {
    Object.assign(this, rawUser);
  }

  get fullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  get fullNameEmail() {
    return `${this.fullName} <${this.email}>`;
  }
}
