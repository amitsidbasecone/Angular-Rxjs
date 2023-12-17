import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { BehaviorSubject, EMPTY, Subject, Subscription, catchError, combineLatest, filter, map, startWith, subscribeOn } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';

import { ProductService } from './product.service';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { SupplierService } from '../suppliers/supplier.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnDestroy {
  pageTitle = 'Product List';
  errorMessage = '';
  categories: ProductCategory[] = [];
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categoryselectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categoryselectedAction$,
  ]).pipe(
    map(([products, categoryid]) =>
      products.filter((product) =>
        categoryid ? product.categoryId === categoryid : true
      )
    ),
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService
  ) {}

  ngOnDestroy(): void {}

  onAdd(): void {
    this.productService.addProduct();
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
