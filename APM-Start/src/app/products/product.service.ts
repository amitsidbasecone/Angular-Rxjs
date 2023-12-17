import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, catchError, combineLatest, filter, forkJoin, map, merge, Observable, of, scan, shareReplay, Subject, switchMap, tap, throwError } from 'rxjs';

import { Product } from './product';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { SupplierService } from '../suppliers/supplier.service';
import { Supplier } from '../suppliers/supplier';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';

  productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    map((products) =>
      products.map(
        (product) =>
          ({
            ...product,
            price: product.price ? product.price * 1.5 : 0,
            searchKey: [product.productName],
          } as Product)
      )
    ),
    tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategory$ = combineLatest(
    this.products$,
    this.productCategoryService.productCategories$
  ).pipe(
    map(([products, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            category: categories.find(
              (category) => category.id === product.categoryId
            )?.name,
          } as Product)
      )
    ),
    shareReplay(1)
  );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$,
  ]).pipe(
    map(([products, selectedproductId]) =>
      products.find((product) => product.id === selectedproductId)
    ),
    tap((product) => console.log(`selected product`, product)),
    shareReplay(1)
  );

  // selectedProdcutSuppliers$ = combineLatest([
  //   this.selectedProduct$,
  //   this.supplierService.suppliers$,
  // ]).pipe(
  //   map(([selectedProduct, suppliers]) =>
  //     suppliers.filter((supplier) =>
  //       selectedProduct?.supplierIds?.includes(supplier.id)
  //     )
  //   )
  // );

  selectedProdcutSuppliers$ = this.selectedProduct$.pipe(
    filter((product) => Boolean(product)),
    switchMap((selectedProduct) => {
      if (selectedProduct?.supplierIds) {
        return forkJoin(
          selectedProduct.supplierIds.map((supplierid) =>
            this.http.get<Supplier>(`${this.suppliersUrl}/${supplierid}`)
          )
        );
      } else {
        return of([]);
      }
    })
  );

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  ).pipe(
    scan(
      (acc, value) => (value instanceof Array ? [...value] : [...acc, value]),
      [] as Product[]
    )
  );

  constructor(
    private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService
  ) {}

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

  selectedProductChange(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30,
    };
  }
}
