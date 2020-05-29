import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Review, ReviewStatus} from '../../../../core/interfaces/review.interface';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {HeaderService} from '../../../../layout/services/header/header.service';
import {ReviewDialogComponent} from '../../components/review-dialog/review-dialog.component';
import {ReviewsService} from '../../services/reviews/reviews.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];

  constructor(
    public dialog: MatDialog,
    private _reviews: ReviewsService,
    private _auth: AuthService,
    private _header: HeaderService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._header.updateHeaderTitle('Reviews');
    this._reviews.reviewsSub.subscribe((reviews) => {
      this.reviews = reviews;
    });
    this._reviews.fetchReviews();
  }

  addReviewClick() {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      data: {
        requestor: this._auth.getUser()._id,
        reviewer: null,
        repositoryId: null,
        repositoryUrl: null,
        repositoryName: null,
        branchId: null,
        branchName: null,
        notes: null,
        status: ReviewStatus.DRAFT,
        dialogTitle: 'New Review'
      }
    });
    dialogRef.afterClosed().subscribe((review: Review) => {
      if (review && Object.keys(review).length > 0) {
        review.requestor = this._auth.getUser()._id;
        review.repositoryId = review.repositoryId === 'new' ? null : review.repositoryId;
        this._reviews.createReview(review);
      }
    });
  }

  onEditReview(review: Review) {
    console.log('ReviewsComponent.onEditReview', review);
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      data: {...review, dialogTitle: 'Edit Review'}
    });
    dialogRef.afterClosed().subscribe((review: Review) => {
      if (review && Object.keys(review).length > 0) {
        this._reviews.updateReview(review);
      }
    })
  }

  onDeletReview(review: Review) {
    this._reviews.deleteReview(review);
  }

  onInitReview(review: Review) {
    this._router.navigateByUrl(`/reviews/${review._key}`);
  }

}
