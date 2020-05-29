import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiEndpoints, ApiMethod} from '../../../../core/interfaces/api.interface';
import {MaterialSelectOption} from '../../../../core/interfaces/mat-select.interface';
import {Repository} from '../../../../core/interfaces/repository.interface';
import {Review} from '../../../../core/interfaces/review.interface';
import {RawUser} from '../../../../core/interfaces/user.interface';
import {HttpService} from '../../../../core/services/http/http.service';
import {ReviewModel} from '../../models/Review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  reviewsSub: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  usersSub: BehaviorSubject<RawUser[]> = new BehaviorSubject<RawUser[]>([]);
  userOptionsSub: BehaviorSubject<MaterialSelectOption[]> = new BehaviorSubject<MaterialSelectOption[]>([]);
  repositoriesSub: BehaviorSubject<Repository[]> = new BehaviorSubject<Repository[]>([]);
  repositoryOptionsSub: BehaviorSubject<MaterialSelectOption[]> = new BehaviorSubject<MaterialSelectOption[]>([]);
  branchesSub: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  branchOptionsSub: BehaviorSubject<MaterialSelectOption[]> = new BehaviorSubject<MaterialSelectOption[]>([]);

  constructor(
    private _http: HttpService
  ) { }

  createReview(review: Review) {
    this._http.requestCall(ApiEndpoints.REVIEWS, ApiMethod.POST, review).subscribe((resp: Review) => {
      this.fetchReviews();
    });
  }

  updateReview(review: Review) {
    const url = `${ApiEndpoints.REVIEWS}/${review._key}`;
    this._http.requestCall(url, ApiMethod.PATCH, review).subscribe((review: Review) => {
      this.fetchReviews();
    });
  }

  deleteReview(review: Review) {
    const url = `${ApiEndpoints.REVIEWS}/${review._key}`;
    this._http.requestCall(url, ApiMethod.DELETE).subscribe((review: Review) => {
      console.log('Deleted review', review);
      this.fetchReviews();
    });
  }

  fetchReviews() {
    this._http.requestCall(ApiEndpoints.REVIEWS, ApiMethod.GET).subscribe((resp: {count: number, results: Review[]}) => {
      const reviews = resp.results.map(review => new ReviewModel(review));
      this.reviewsSub.next(reviews);
    })
  }

  fetchUsers() {
    this._http.requestCall(ApiEndpoints.PEOPLE, ApiMethod.GET).subscribe((resp: {count: number, results: RawUser[]}) => {
      if (resp && resp.results.length) {
        this.usersSub.next(resp.results);
        const users = resp.results.map((person) => {
          return {
            value: person._id,
            viewValue: person.email
          }
        });
        this.userOptionsSub.next(users);
      }
    })
  }

  fetchRepositories() {
    this._http.requestCall(ApiEndpoints.REPOSITORIES, ApiMethod.GET)
      .subscribe((repos: {count: number, results: Repository[]}) => {
        this.repositoriesSub.next(repos.results);
        const repositories = repos.results.map((repo) => {
          return {
            value: repo._key,
            viewValue: repo.name
          }
        });
        this.repositoryOptionsSub.next(repositories);
      });
  }

  fetchBranches(repoId: string) {
    const url = `${ApiEndpoints.REPOSITORIES}/${repoId}/branches`;
    this._http.requestCall(url, ApiMethod.GET).subscribe((resp: any[]) => {
      this.branchesSub.next(resp);
      const branches = resp.map((branch) => {
        return {
          value: branch._key,
          viewValue: branch.name
        }
      });
      this.branchOptionsSub.next(branches);
    });
  }

  fetchReview(reviewKey: string) {
    const url = `${ApiEndpoints.REVIEWS}/${reviewKey}`;
    return this._http.requestCall(url, ApiMethod.GET);
  }

  fetchCommits(reviewKey: string|number) {
    const url = `${ApiEndpoints.REVIEWS}/${reviewKey}/commits`;
    return this._http.requestCall(url, ApiMethod.GET);
  }
}
