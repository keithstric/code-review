import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {CoreModule} from '../../core/core.module';
import {LayoutModule} from '../../layout/layout.module';
import {ReviewDialogComponent} from './components/review-dialog/review-dialog.component';
import {ReviewCardComponent} from './components/review-card/review-card.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { ReviewComponent } from './pages/review/review.component';

export const reviewRoutes: Routes = [
  {path: '', component: ReviewsComponent},
  {path: ':key', component: ReviewComponent}
];

@NgModule({
  declarations: [
    ReviewsComponent,
    ReviewDialogComponent,
    ReviewCardComponent,
    ReviewComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(reviewRoutes),
    FormsModule,
    LayoutModule
  ],
  exports: [
    RouterModule
  ]
})
export class ReviewsModule { }
