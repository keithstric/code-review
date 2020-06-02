import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ReviewsService} from 'src/app/modules/reviews/services/reviews/reviews.service';
import {MaterialSelectOption} from '../../../../core/interfaces/mat-select.interface';
import {Review} from '../../../../core/interfaces/review.interface';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss']
})
export class ReviewDialogComponent implements OnInit {
  userSelectOptions: MaterialSelectOption[] = [];
  repositorySelectOptions: MaterialSelectOption[] = [];
  branchSelectOptions: MaterialSelectOption[] = [];

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Review,
    private _reviews: ReviewsService
  ) { }

  ngOnInit(): void {
    this.listenToUsers();
    this._reviews.fetchUsers();
    this.listenToRepositories();
    this._reviews.fetchRepositories();
    this.listenToBranches();
    if (this.data && this.data.repositoryId) {
      this._reviews.fetchBranches(this.data.repositoryId);
    }
  }

  listenToUsers() {
    this._reviews.userOptionsSub.subscribe((users: MaterialSelectOption[]) => {
      this.userSelectOptions = users;
    });
  }

  listenToRepositories() {
    this._reviews.repositoryOptionsSub.subscribe((repos: MaterialSelectOption[]) => {
      const options: MaterialSelectOption[] = [{value: 'new', viewValue: 'New'}, ...repos];
      this.repositorySelectOptions = options;
    });
  }

  onRepoSelect() {
    this._reviews.fetchBranches(this.data.repositoryId)
  }

  listenToBranches() {
    this._reviews.branchOptionsSub.subscribe((branches: MaterialSelectOption[]) => {
      const options: MaterialSelectOption[] = [{value: 'new', viewValue: 'New'}, ...branches];
      this.branchSelectOptions = options;
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit(data) {
    this.dialogRef.close(data);
  }

}
