import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../../core/components/confirm-dialog/confirm-dialog.component';
import {Review} from '../../../../core/interfaces/review.interface';

@Component({
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss']
})
export class ReviewCardComponent implements OnInit {
  @Input() review: Review;
  @Output() deleteEvt: EventEmitter<Review> = new EventEmitter<Review>();
  @Output() editEvt: EventEmitter<Review> = new EventEmitter<Review>();
  @Output() initiateReviewEvt: EventEmitter<Review> = new EventEmitter<Review>();

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  deleteClick() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Review?',
        message: `Really delete the review of the "${this.review._branch.name}" branch in the ${this.review._repository.name} repository for ${this.review._requestorVert.email}?`
      }
    });
    dialogRef.afterClosed().subscribe((resp: boolean) => {
      if (resp) {
        this.deleteEvt.emit(this.review);
      }
    });
  }

  editClick() {
    this.editEvt.emit(this.review);
  }

  initiateReviewClick() {
    this.initiateReviewEvt.emit(this.review);
  }

}
