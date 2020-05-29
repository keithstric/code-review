import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as Diff2Html from 'diff2html';
import {Review} from '../../../../core/interfaces/review.interface';
import {ReviewModel} from '../../models/Review.model';
import {ReviewsService} from '../../services/reviews/reviews.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  review: Review = {};
  diffOutputHtml: any = '<b>This should be innerHtml</b>';
  commits: any[] = [];

  constructor(
    private _activeRoute: ActivatedRoute,
    private _reviewService: ReviewsService
  ) { }

  ngOnInit(): void {
    console.log(Diff2Html)
    this.fetchReview();
  }

  fetchReview() {
    const reviewKey = this._activeRoute.snapshot.paramMap.get('key');
    this._reviewService.fetchReview(reviewKey).subscribe((resp: Review) => {
      this.review = new ReviewModel(resp);
      this.fetchCommits();
    });
  }

  fetchCommits() {
    this._reviewService.fetchCommits(this.review._key).subscribe((commits) => {
      this.commits = commits;
      console.log('this.commits=', this.commits);
    });
  }

  onCommitClick(commit: any) {
    console.log('onCommitClick, diff=', commit.diff);
    this.diffOutputHtml = Diff2Html.html(commit.diff, {outputFormat: 'side-by-side', matching: 'lines'});
  }

}
