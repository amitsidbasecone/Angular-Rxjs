import { Component, OnInit, OnDestroy } from '@angular/core';

import { EMPTY, Subscription, catchError } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent implements OnInit, OnDestroy {
  pageTitle = 'Products';
  errorMessage = '';
  selectedProductId = 0;

  products$ = this.productService.products$
  .pipe(
    catchError(err => {
      this.errorMessage= err;
      return EMPTY;
    })
  );
  
  constructor(private productService: ProductService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    
  }

  onSelected(productId: number): void {
    console.log('Not yet implemented');
  }
}
