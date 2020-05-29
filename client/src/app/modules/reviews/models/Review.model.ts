import {Review, ReviewStatus} from '../../../core/interfaces/review.interface';
import {Vertex} from '../../../core/interfaces/vertex.interface';

export class ReviewModel implements Review {
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
  _invitee?: Vertex;
  _repository?: Vertex;
  reviewerNotes?: string;

  constructor(rawReview: Review) {
    Object.assign(this, rawReview);
  }

  get branch() {
    return this._branch;
  }

  get requestorInfo() {
    return this._requestorVert;
  }

  get requestorFullName() {
    return `${this.requestorInfo.first_name} ${this.requestorInfo.last_name}`;
  }

  get inviteeFullName() {
    return `${this._invitee.first_name} ${this._invitee.last_name}`;
  }

  get repositoryVertexName() {
    return this._repository.name || this.repositoryName;
  }
}
