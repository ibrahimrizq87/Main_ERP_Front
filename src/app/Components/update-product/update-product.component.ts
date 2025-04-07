import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PriceService } from '../../shared/services/price.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProductUnitsService } from '../../shared/services/product_units.service';
import { ProductCategoriesService } from '../../shared/services/product_categories.service';
import { ColorService } from '../../shared/services/colors.service';
import { DeterminantService } from '../../shared/services/determinants.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css'
})
export class UpdateProductComponent implements OnInit {
  mainColors: any;
  productColors: ProductColor[] = [];
  productImages: ProductImage[] = [];
  msgError: string = '';
  isLoading: boolean = false;
  isSubmited = false;
  productForm: FormGroup;
  units: any[] = [];
  selectedFiles: any[] = [];
  selectedUnit: any;
  selectedProductCategory: any;
  productPrices: ProductPrice[] = [];
  priceCategories: PriceCategory[] = [];
  pricesAreValid = false;
  MainDeterminants: Determinant[] = [];

  currentProductImage = 'images/image.jpg';
  readonly maxImageSize = 2048 * 1024;

  stock = 0;
  productCategories: any;

  get colors(): FormArray {
    return this.productForm.get('colors') as FormArray;
  }
  addColor(myColor: ProductColor | null) {
    let colorName = myColor?.color.id ?? '';
    let colorId = myColor?.id ?? null;
    let colorImage = myColor?.image ?? '';

    this.colors.push(this.fb.group({
      color_id: [colorName, [Validators.required]],
      image: [null],
      currentImage: [colorImage],
      id: [colorId],

    }));
  }


  loadColors(): void {
    this._ColorService.viewAllColors().subscribe({
      next: (response) => {
        if (response) {
          // console.log(response);
          this.mainColors = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }



  removeColor(index: number) {
    const colorItem = this.colors.at(index).value;

    if (colorItem.id) {
      this.productColors.push({
        id: colorItem.id,
        image: colorItem.currentImage || null,
        color: colorItem.color || ''
      });
    }


    this.colors.removeAt(index);

  }
  onFileSelect(event: any) {
    if (event.target.files) {
      this.selectedFiles = [];
      for (let file of event.target.files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedFiles.push({ file, preview: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    }
  }
  addPriceRange(index: number) {
    const priceControl = this.prices.at(index) as FormGroup;
    const ranges = priceControl.get('ranges') as FormArray;
    let last_price = 0;
    this.pricesAreValid = false;
    if (ranges.length > 0) {
      const lastRange = ranges.at(ranges.length - 1) as FormGroup;
      last_price = lastRange.get('range_to')?.value;
    }

    ranges.push(this.fb.group({
      price: [null],
      range_to: [null],
      range_from: [last_price],


    }));
  }

  getRanges(index: number): FormArray {
    return (this.prices.at(index).get('ranges') as FormArray);
  }

  addDeterminant() {
    const id = this.productForm.get('determinant_id')?.value;

    if (id) {
      let isDublicted = false;

      this.determinants.controls.forEach((element) => {
        if (element.get('determinant_id')?.value == id) {
          isDublicted = true;
        }
      });


      if (!isDublicted) {
        const determinant = this.MainDeterminants.find(d => d.id == id);


        this.determinants.push(this.fb.group({
          determinant_name: [determinant?.name],
          determinant_id: [determinant?.id],

        }));
      } else {
        this.toastr.error('هذا المحدد تم اختياره من قبل');
        alert('لقد تم اختيار هذا المحمدد من قبل')

      }
      this.productForm.patchValue({ determinant_id: null });

    }

  }
  onFileColorSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.colors.at(index).patchValue({ image: file }); // Storing Base64
      };
      reader.readAsDataURL(file);
    }
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _ColorService: ColorService,
    private _ProductsService: ProductsService,
    private _DeterminantService: DeterminantService,
    private _PriceService: PriceService,
    private _ProductUnitsService: ProductUnitsService,
    private _ProductCategoriesService: ProductCategoriesService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {
    this.productForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required, Validators.maxLength(255)]),
      product_name_en: this.fb.control(null, [Validators.required, Validators.maxLength(255)]),
      // default_price :[null,[Validators.required]],
      product_category_id: [null, [Validators.required]],
      need_serial: this.fb.control(false),
      product_description: [null],
      image: this.fb.control(null, [this.validateImage.bind(this)]), // Removed required validator
      unit_id: this.fb.control(null, [Validators.required]),
      prices: this.fb.array([]),
      colors: this.fb.array([]),
      determinants: this.fb.array([]),
      determinant_id: [null]
    });


  }
  onProductCategoryChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedProductCategory = selectedValue;
    // console.log(this.selectedUnit);
  }
  onUnitChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedUnit = selectedValue;
    // console.log(this.selectedUnit);
  }
  get prices(): FormArray {
    return this.productForm.get('prices') as FormArray;
  }

  removePrice(index: number) {
    if (this.prices.length > 1) {
      this.prices.removeAt(index);
    }
  }
  createRangeGroup(price: ProductPrice): FormGroup {
    return this.fb.group({
      id: [price.id],
      range_from: [price.quantity_from],
      range_to: [price.quantity_to],
      price: [price.price],
    });
  }


  addPrice(priceCategory: PriceCategory, price: PriceCategory | null) {
    if (price != null) {

      const priceForm = this.fb.group({
        price_category_id: [priceCategory.id],
        price_category_name: [priceCategory.name],
        ranges: this.fb.array([])
      });

      this.prices.push(priceForm);

      price.prices.forEach((item) => {
        const ranges = priceForm.get('ranges') as FormArray;


        ranges.push(this.fb.group({
          price: [item.price],
          range_to: [item.quantity_to],
          range_from: [item.quantity_from],


        }));
      })

      // this.fb.array(
      //             price.prices.map(price => this.createRangeGroup(price)) // Populate ranges
      //         ),

      // const ranges = priceControl.get('ranges') as FormArray;




    } else {
      this.prices.push(this.fb.group({
        // price: [null],
        price_category_id: [priceCategory.id],
        price_category_name: [priceCategory.name],
        ranges: this.fb.array([])

      }));
    }

  }

  get determinants(): FormArray {
    return this.productForm.get('determinants') as FormArray;
  }





  selectedFile: File | null = null;


  onFileCoverImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.productForm.patchValue({ image: file });
    }
  }


  removeDeterminant(index: number) {
    this.determinants.removeAt(index);

  }

  validateImage(control: AbstractControl): ValidationErrors | null {
    const file = this.selectedFile;
    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(fileType)) {
        return { invalidFileType: true };
      }
      if (fileSize > this.maxImageSize) {
        return { fileTooLarge: true };
      }
    }
    return null;
  }


  loadDeterminants(): void {
    this._DeterminantService.getAllDeterminants().subscribe({
      next: (response) => {
        if (response) {
          // console.log(response)
          this.MainDeterminants = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  ngOnInit(): void {
    const unitId = this.route.snapshot.paramMap.get('id');
    if (unitId) {
      this.fetchProduct(unitId);
    }
    this.loadDeterminants();

    this.loadUnits();
    this.loadProductCategories();
    this.loadColors();
  }


  deleteImage(imageId: number) {


    this._ProductsService.deleteProductImage(imageId).subscribe({
      next: (response) => {
        if (response) {
          this.productImages = this.productImages.filter(image => image.id !== imageId);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  fetchProduct(unitId: string): void {
    this._ProductsService.viewProductById(unitId).subscribe({
      next: (response) => {
        if (response) {
          const categoryData = response.data;
          console.log(categoryData)
          this.productForm.patchValue({
            name_ar: categoryData.name_lang.ar,
            product_name_en: categoryData.name_lang.en,
            // default_price :categoryData.default_price,
            product_category_id: categoryData.productCategory.id,
            unit_id: categoryData.product_unit.id,
            need_serial: categoryData.need_serial_number,
            product_description: categoryData.description,


          });

          categoryData.productDeterminants.forEach((element: any) => {
            this.determinants.push(this.fb.group({
              determinant_name: [element?.determinant.name],
              determinant_id: [element?.determinant.id],
            }));

            console.log(element);
          })
          this.productImages = categoryData.images;
          this.productColors = categoryData.colors;
          this.currentProductImage = categoryData.cover_image;
          this.selectedUnit = categoryData.product_unit.id;
          this.selectedProductCategory = categoryData.productCategory.id;
          // this.loadPriceCategories();
          this.productPrices = categoryData.prices;
          this.stock = categoryData.stock;

        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  loadUnits(): void {
    this._ProductUnitsService.getAllProductUnits().subscribe({
      next: (response) => {
        if (response) {
          this.units = response.data;
          console.log('units:', this.units);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  loadProductCategories(): void {
    this._ProductCategoriesService.getAllProductCategories().subscribe({
      next: (response) => {
        if (response) {
          this.productCategories = response.data;

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  updateColor(color: ProductColor) {
    this.productColors = this.productColors.filter(myColor => myColor.id !== color.id);
    this.addColor(color);
  }

  deleteColor(colorId: number) {


    this._ProductsService.deleteProductColor(colorId).subscribe({
      next: (response) => {
        if (response) {
          this.toastr.success('تم حذف اللون بنجاح');
          this.productColors = this.productColors.filter(color => color.id !== colorId);
        }
      },
      error: (err) => {
        this.toastr.error('حدث خطا اثناء حذف اللون');
        console.error(err);
      }
    });
  }
  onPriceRangeChange(index: number, rangeIndex: number, event: any) {
    const priceControl = this.prices.at(index) as FormGroup;
    const ranges = priceControl.get('ranges') as FormArray;
    let from_value = event.target.value;
    if (ranges.length > rangeIndex + 1) {
      const lastRange = ranges.at(rangeIndex + 1) as FormGroup;
      lastRange.patchValue({ range_from: from_value })
    }

    const range = ranges.at(rangeIndex) as FormGroup;

    if (range.get('range_from')?.value < range.get('range_to')?.value) {
      this.pricesAreValid = true;
    }
    // console.log(priceControl.get('price_category_id')?.value);


  }

  removeRange(index: number, rangeIndex: number) {
    const priceControl = this.prices.at(index) as FormGroup;
    const ranges = priceControl.get('ranges') as FormArray;

    if (ranges.length > 0) {
      ranges.removeAt(rangeIndex);
    }
  }

  // loadPriceCategories(): void {
  //   this._PriceService.viewAllCategory().subscribe({
  //     next: (response) => {
  //       if (response) {
  //         this.priceCategories = response.data;
  //         console.log(this.priceCategories);
  //         console.log(this.productPrices);

  //         this.priceCategories.forEach((category)=>{
  //           let currentPrice =null;

  //           this.productPrices.forEach((price)=>{
  //             if(price.id == category.id){
  //               currentPrice = price ;
  //             }

  //           });

  //           this.addPrice(category ,currentPrice );


  //         });

  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }

  handleForm() {
    // alert(this.productForm.get('need_serial')?.value);

    this.isSubmited = true;
    if (this.productForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      formData.append('name[ar]', this.productForm.get('name_ar')?.value);
      formData.append('name[en]', this.productForm.get('product_name_en')?.value);
      formData.append('product_unit_id', this.productForm.get('unit_id')?.value);
      formData.append('product_category_id', this.productForm.get('product_category_id')?.value);
      formData.append('description', this.productForm.get('product_description')?.value || '');

      this.determinants.controls.forEach((item, index) => {
        formData.append(`determinant_values[${index}][determinant_value_id]`, item.get('value_id')?.value);
      });

      if (this.productForm.get('need_serial')?.value) {
        formData.append('need_serial_number', '1');
      }

      // formData.append('default_price', this.productForm.get('default_price')?.value);
      if (this.productForm.get('image')?.value) {
        formData.append('cover_image', this.productForm.get('image')?.value);

      }




      let counter = 0;



      this.determinants.controls.forEach((determinant, index) => {
        formData.append(`determinants[${index}][determinant_id]`, determinant.get('determinant_id')?.value);
      });



      // this.prices.controls.forEach((priceControl) => {
      //   const ranges = priceControl.get('ranges') as FormArray;
      //     // if(ranges.length>0){

      //       ranges.controls.forEach((rangeControl) => {
      //         if(!rangeControl.get('price')?.value){
      //             alert('prices are invalid')
      //             return;

      //         }
      //       formData.append(`prices[${counter}][price]`, rangeControl.get('price')?.value);
      //       formData.append(`prices[${counter}][quantity_from]`, rangeControl.get('range_from')?.value);
      //       formData.append(`prices[${counter}][quantity_to]`, rangeControl.get('range_to')?.value);
      //       formData.append(`prices[${counter}][price_category_id]`, priceControl.get('price_category_id')?.value);
      //       counter++;
      //       });






      // });


      // this.prices.controls.forEach((priceControl, index) => {
      //   if(priceControl.get('price')?.value){

      //     if(priceControl.get('id')?.value){
      //       formData.append(`prices[${index}][id]`, priceControl.get('id')?.value);

      //     }

      //     formData.append(`prices[${index}][price]`, priceControl.get('price')?.value);
      //     formData.append(`prices[${index}][price_category_id]`, priceControl.get('price_category_id')?.value);
      //   }
      // });

      this.colors.controls.forEach((priceControl, index) => {
        if (priceControl.get('id')?.value) {
          formData.append(`colors[${index}][id]`, priceControl.get('id')?.value);
        }
        formData.append(`colors[${index}][color_id]`, priceControl.get('color_id')?.value);
        if (priceControl.get('image')?.value) {
          formData.append(`colors[${index}][image]`, priceControl.get('image')?.value);
        }

      });


      if (this.selectedFiles.length > 0) {
        this.selectedFiles.forEach((image, index) => {
          formData.append(`images[${index}][image]`, image.file);

        });

      }
      const productId = this.route.snapshot.paramMap.get('id');
      if (productId) {
        this._ProductsService.updateProduct(productId, formData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response) {
              this.toastr.success('تم تعديل المنتج بنجاح');
              this.router.navigate(['/dashboard/products']);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء تعديل المنتج');
            this.isLoading = false;
            this.msgError = err.error.error;
          }
        });
      }

    } else {
      console.log('invalid dataaaa')
    }
  }
}


interface PriceCategory {
  id: number;
  name: string;
  prices: ProductPrice[];

}

interface ProductPrice {
  id: number;
  quantity_from: number;
  quantity_to: number;
  price: number;
  priceCategory: PriceCategory;
}
// quantity_from: [price.quantity_from], // Minimum quantity
//         quantity_to: [price.quantity_to], 

interface ProductImage {
  id: number;
  image: string;
}

interface ProductColor {
  id: number;
  image: string | null;
  color: Color;
}

interface Color {
  id: number;
  color: string;
}
interface Determinant {
  id: number;
  name: string;
  values: DeterminantValues[];

}

interface DeterminantValues {
  id: number;
  value: string;
}