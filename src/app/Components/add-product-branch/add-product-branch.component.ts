import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreService } from '../../shared/services/store.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-product-branch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './add-product-branch.component.html',
  styleUrls: ['./add-product-branch.component.css'],
})
export class AddProductBranchComponent implements OnInit {
  selectedType: string = '';
  msgError: string = '';
  isLoading: boolean = false;
  stores: any[] = [];
  products: any[] = [];
  parentAccounts: any[] = [];
  hierarchicalAccounts: any[] = [];
  productDeterminants: any[] = [];
  dynamicInputs: FormArray<FormControl>; // Set FormArray type
  branchForm: FormGroup;
  inputDisabled: boolean[] = []; 
  overrideCount: number = 0; 
  constructor(
    private _ProductsService: ProductsService,
    private _Router: Router,
    private translate: TranslateService,
    private _StoreService: StoreService
  ) {
    this.dynamicInputs = new FormArray<FormControl>([]); // Initialize dynamicInputs as FormArray<FormControl>
    this.branchForm = new FormGroup({
      amount: new FormControl(null, [Validators.required]),
      store_id: new FormControl(null, [Validators.required]),
      product_id: new FormControl(null, [Validators.required]),
      purchase_price: new FormControl(null, [Validators.required]),

      
      dynamicInputs: this.dynamicInputs,
    });
  }

  ngOnInit(): void {
    this.loadStores();
    this.loadProducts();
    this.branchForm.get('amount')?.valueChanges.subscribe((value) => {
      this.updateDynamicInputs(value);
    });
  }

  
  updateDynamicInputs(amount: number): void {
    this.dynamicInputs.clear();
    this.inputDisabled = []; // Reset disabled state
    for (let i = 0; i < amount; i++) {
      // Initially, all inputs are not disabled
      this.dynamicInputs.push(new FormControl({value: '', disabled: false}, Validators.required));
      this.inputDisabled.push(false); // Initially, all inputs are not disabled
    }
  }
  disableInput(index: number): void {
    this.dynamicInputs.at(index).disable(); // Disable the form control at the given index
    this.inputDisabled[index] = true;
     // Update the inputDisabled array
     this.overrideCount++;
  }
  loadProducts(): void {
    this._ProductsService.viewAllProducts().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.products = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  loadStores(): void {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.parentAccounts = response.data;
          this.hierarchicalAccounts = this.buildAccountHierarchy(this.parentAccounts);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  buildAccountHierarchy(accounts: any[]): any[] {
    return accounts.map((account) => ({
      ...account,
      children: account.child ? this.buildAccountHierarchy(account.child) : [],
    }));
  }

  
  selectedDeterminantValues: { [key: number]: number } = {};

onProductChange(event: Event) {
  const selectedValue = (event.target as HTMLSelectElement).value;
  this.selectedType = selectedValue;

  this._ProductsService.getDeterminantByProduct(selectedValue).subscribe({
    next: (response) => {
      if (response) {
        console.log('Product determinants:', response.data);
        this.productDeterminants = this.getGroupedDeterminants(response.data);
        // Reset selected values when product changes
        this.selectedDeterminantValues = {};
      }
    },
    error: (err) => {
      console.error(err);
    },
  });
}
getGroupedDeterminants(productDeterminants: any[]): any[] {
  const grouped = new Map();
  productDeterminants.forEach((item) => {
    if (!grouped.has(item.determinant.id)) {
      grouped.set(item.determinant.id, {
        determinantId: item.determinant.id,
        determinantName: item.determinant.determinant,
        determinantValues: [],
      });
    }
    grouped.get(item.determinant.id).determinantValues.push({
      id: item.id, // Outer ID (e.g., 25, 26)
      value: item.value, // The value (e.g., "red", "blue")
    });
  });
  return Array.from(grouped.values());
}


onValueSelect(determinantId: number, event: Event) {
  // Get the selected value ID (this is the outer ID, e.g., 25, 26)
  const selectedValueId = Number((event.target as HTMLSelectElement).value);

  // Log the determinantId and selectedValueId
  console.log(`Selected determinantId: ${determinantId}`);
  console.log(`Selected value ID: ${selectedValueId}`);

  // Ensure we have the correct determinant
  const determinant = this.productDeterminants.find(d => d.determinantId === determinantId);

  if (determinant) {
    // Log the found determinant to check its contents
    console.log(`Found determinant: ${JSON.stringify(determinant)}`);

    // Find the selected value object based on the selected value ID
    const selectedValue = determinant.determinantValues.find((value: { id: number; }) => value.id === selectedValueId);

    if (selectedValue) {
      // Log the selected value
      console.log(`Selected value: ${JSON.stringify(selectedValue)}`);

      // Store the outer ID in selectedDeterminantValues
      this.selectedDeterminantValues[determinantId] = selectedValue.id;
      console.log(`Stored outer ID: ${selectedValue.id}`);
    } else {
      console.log('Selected value not found!');
    }
  } else {
    console.log('Determinant not found!');
  }
}

  handleForm() {
    if (this.branchForm.valid) {
      this.isLoading = true;
      console.log(this.overrideCount.toString());
  
      const formData = new FormData();
      formData.append('override', this.overrideCount.toString());
      formData.append('amount', this.branchForm.get('amount')?.value);
      formData.append('store_id', this.branchForm.get('store_id')?.value);
      formData.append('product_id', this.branchForm.get('product_id')?.value);
      formData.append('purchase_price', this.branchForm.get('purchase_price')?.value);

      
     
      Object.keys(this.selectedDeterminantValues).forEach((determinantId, index) => {
        const outerId = this.selectedDeterminantValues[+determinantId]; // Convert determinantId to a number
        console.log(`outer ID: ${outerId}`);
        
        formData.append(`determinants[${index}][product_determinant_id]`,  outerId.toString()); // Determinant ID remains a string here for FormData
        // formData.append(`determinants[${index}][value]`, outerId.toString()); // Outer ID (selected value ID)
      });
      const barcodes = this.dynamicInputs.value;

if(this.overrideCount == this.branchForm.get('amount')?.value){

}else{
  barcodes.forEach((barcode: string) => {
    formData.append('barcodes[]', barcode);
  });
}
     
  
      this._ProductsService.addProductBranch(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this._Router.navigate(['/dashboard/productBranch']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.msgError = err.error.error;
          console.log(err.error.error);
        },
      });
    
    }}}
