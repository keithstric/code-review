import {Vertex} from './vertex.interface';

export interface RawUser extends Vertex {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
