import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Supplier } from '../../suppliers/supplier';
import { Product } from '../product';

import { ProductService } from '../product.service';
import { EMPTY, catchError, combineLatest, filter, map } from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  errorMessage = '';
  productSuppliers: Supplier[] | null = null;

  product$ = this.productService.selectedProduct$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  pageTitle$ = this.product$.pipe(
    map((p) => (p ? `product details for: ${p.productName}` : null))
  );

  productSuppliers$ = this.productService.selectedProdcutSuppliers$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  vm$ = combineLatest([
    this.product$,
    this.productSuppliers$,
    this.pageTitle$,
  ]).pipe(
    filter(([product]) => Boolean(product)),
    map(([product, productSuppliers, pageTitle]) => ({
      product,
      productSuppliers,
      pageTitle,
    }))
  );

  constructor(private productService: ProductService) {}
}
