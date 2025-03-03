import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {  FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormArray, FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreService } from '../../shared/services/store.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from 'bootstrap';
import { Product ,ProductColor ,ProductBranch} from '../../models/product.model';
import { ProductBranchMovesService } from '../../shared/services/product_branch_moves.service';
import { ProductBranchesService } from '../../shared/services/product_branches.service';

@Component({
  selector: 'app-add-product-move',
  standalone: true,
  imports: [CommonModule, FormsModule ,ReactiveFormsModule,TranslateModule],
  templateUrl: './add-product-move.component.html',
  styleUrl: './add-product-move.component.css'
})

export class AddProductMoveComponent {
// 'first_entry','store','lost','extra'


  fromBranches:ProductBranch[] =[];
  toBranches:ProductBranch[] =[];
  fromSelectedBranch:ProductBranch|null=null;
  toSelectedBranch:ProductBranch|null=null;
  modelBranchType ='';
  selectedType: string = 'first_entry';
  msgError: string = '';
  isLoading: boolean = false;
  stores: any[] = [];
  productColors:ProductColor[] = [];
  products: Product[] = [];
  parentAccounts: any[] = [];
  hierarchicalAccounts: any[] = [];
  productDeterminants: any[] = [];
  branchForm: FormGroup;
  inputDisabled: boolean[] = []; 
  overrideCount: number = 0; 
  selectedColor :ProductColor|null = null;
  fromStore:string='';
  toStore:string='';
//  barcodeInputs: FormArray<FormControl>;
  isSubmited =false;
  selectedStore :string|null=null;
  selectedProduct :string|null=null;

  constructor(
    private fb: FormBuilder,
    private _Router: Router,
    private translate: TranslateService,
    private _StoreService: StoreService,
    private _ProductBranchMovesService:ProductBranchMovesService,
    private _ProductBranchesService:ProductBranchesService,


  ) {
    this.branchForm = new FormGroup({
      from_branch_id: new FormControl(null),
      to_branch_id: new FormControl(null),
      type: new FormControl(this.selectedType, [Validators.required]),
      quantity: new FormControl(null, [Validators.required]),
      note: new FormControl(null),
      from_store: new FormControl(null),
      to_store: new FormControl(null),
      barcodeInputs: this.fb.array([]),
      override:new FormControl(null),
    });
    // this.barcodeInputs = 
  }

  onTypeChange(event: Event){
    this.selectedType= (event.target as HTMLSelectElement).value;
  }
  get barcodeInputs(): FormArray {
    return this.branchForm.get('barcodeInputs') as FormArray;
  }


  quantity:number = 0;
  override:number = 0;
  onQuantityChange(event: any) {
    this.quantity = event.target.value;  
    if(this.selectedType != 'lost')
    this.updateBarcodes();  
  }


  onOverrideChange(event: any) {
    this.override = event.target.value;  
    this.updateBarcodes();  
  }

  updateBarcodes(){

    this.barcodeInputs.clear(); 
    const num = this.quantity - this.override;
    for (let i = 0; i < num; i++) {
      this.barcodeInputs.push(this.fb.group({
        barcode: [null,[Validators.required]],
        // override: [false],

      }));
    }
   
  
  }
 
  onStoreChange(event: Event , type:string) {

    const selectedValue = (event.target as HTMLSelectElement).value;


    if (type == 'from'){
      if(selectedValue == this.toStore){
      alert('لا يمكن انشاء حركه من المخزن لنفسه');
      this.branchForm.patchValue({
        from_store: null,
      });
        return;
      }
      this.fromStore = selectedValue;

    }else{
      if(selectedValue == this.fromStore){
        alert('لا يمكن انشاء حركه من المخزن لنفسه');
        this.branchForm.patchValue({
          to_store: null,
        });
          return;
        }
this.toStore =  selectedValue;
    }
    this.loadProductBranches(type , selectedValue);
// console.log(type , selectedValue);
  }


  loadProductBranches(type:string ,storeId:string){

    this._ProductBranchesService.getProductBranchByStoreId(storeId).subscribe({
      next: (response) => {
        // console.log(response);

        if (response) {
          console.log(response);
          console.log(storeId , type);

          // this.products = response.data;
          if(type == 'from'){
            this.fromBranches = response.data;
          }else{
            this.toBranches = response.data;

          }
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  ngOnInit(): void {
    this.loadStores();

  }

  

  



  loadStores(): void {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.stores = response.data;      
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }


  

onProductChange(event: Event) {
  const selectedValue = (event.target as HTMLSelectElement).value;
  this.selectedType = selectedValue;
  const selectedProduct = this.products.find(product => product.id == selectedValue);
this.selectedProduct =selectedValue;
  this.productColors = selectedProduct?.colors|| [];
}



  handleForm() {
    this.isSubmited =true;

    if( (this.selectedType == 'store'  || this.selectedType == 'lost') && !this.fromSelectedBranch){
      alert('فرع المنتج المرغوب الانقص منه مطلوب');
return;
    }
    
    if( (this.selectedType == 'store'  || this.selectedType == 'extra'|| this.selectedType == 'first_entry') && !this.toSelectedBranch){
      alert('فرع المنتج المرغوب الزياده عليه مطلوب');
      return;

    }

    if (this.branchForm.valid ) {

      if(this.selectedColor == null &&this.productColors.length>0){
    
        return;
      }
      this.isLoading = true;

  
      const formData = new FormData();
      formData.append('store_id', this.branchForm.get('store_id')?.value);
      formData.append('product_id', this.branchForm.get('product_id')?.value);
      if(this.selectedColor){
        formData.append('color_id', this.branchForm.get('color_id')?.value);
      }

    

     
  
      this._ProductBranchMovesService.addProductBranchMove(formData).subscribe({
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
    
    }}
  
  


    selectBranch(branch:ProductBranch ){
if (this.modelBranchType == 'from'){
  this.branchForm.patchValue({
    from_branch_id: branch.id,
  });
  this.fromSelectedBranch = branch;
}else{
  this.branchForm.patchValue({
    to_branch_id: branch.id,
  });
  this.toSelectedBranch =branch;
}
this.closeModal('shiftModal'); 

    }
    filteredBranches:ProductBranch[]=[];
    openModal(modalId: string ,type:string) {
      const modalElement = document.getElementById(modalId);
      if(type =='from'){
        this.modelBranchType ='from';
        this.filteredBranches = this.fromBranches;
      }else{
        this.modelBranchType ='to';

        this.filteredBranches = this.toBranches;
      }
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    }
    searchQuery ='';
    onSearchChange(){
      if(this.modelBranchType == 'from'){
        this.filteredBranches = this.fromBranches.filter(branch =>
          branch.product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }else{
        this.filteredBranches = this.toBranches.filter(branch =>
          branch.product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
 
    }
    
    closeModal(modalId: string) {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        modal?.hide();
      }
    }
   
 
  
  }

   