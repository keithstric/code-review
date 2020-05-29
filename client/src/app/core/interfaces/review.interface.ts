import {Vertex} from './vertex.interface';

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Review extends Vertex {
  repositoryUrl?: string;
  repositoryName?: string;
  repositoryId?: string;
  branchId?: string;
  branchName?: string;
  requestor?: string;
  reviewer?: string;
  notes?: string;
  status?: ReviewStatus;
  _branch?: Vertex;
  _requestorVert?: Vertex;
  reviewerNotes?: string;
}
