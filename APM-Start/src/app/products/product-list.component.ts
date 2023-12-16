import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { EMPTY, Subscription, catchError } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';

import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnDestroy {
  pageTitle = 'Product List';
  errorMessage = '';
  categories: ProductCategory[] = [];

  products$ = this.productService.productsWithCategory$.pipe(
    catchError(err => {
      this.errorMessage= err;
      return EMPTY;
    })
  );

  constructor(private productService: ProductService) { }

  ngOnDestroy(): void {
  }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    console.log('Not yet implemented');
  }
}
