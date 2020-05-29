import {Vertex} from './vertex.interface';

export interface Repository extends Vertex {
  url?: string;
  name?: string;
  path?: string;
}
