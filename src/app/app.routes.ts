import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { NotfoundComponent } from './Components/notfound/notfound.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { VendorComponent } from './Components/vendor/vendor.component';
import { CustomerComponent } from './Components/customer/customer.component';
import { SupplierComponent } from './Components/supplier/supplier.component';
import { ShowVendorComponent } from './Components/show-vendor/show-vendor.component';
import { UpdateVendorComponent } from './Components/update-vendor/update-vendor.component';
import { CreateCustomerComponent } from './Components/create-customer/create-customer.component';
import { UpdateCustomerComponent } from './Components/update-customer/update-customer.component';
import { GroupComponent } from './Components/group/group.component';
import { AddGroupComponent } from './Components/add-group/add-group.component';
import { ShowCustomerComponent } from './Components/show-customer/show-customer.component';
import { UpdateGroupComponent } from './Components/update-group/update-group.component';
import { CreateVendorComponent } from './Components/create-vendor/create-vendor.component';
import { CreateSupplierComponent } from './Components/create-supplier/create-supplier.component';
import { ShowSupplierComponent } from './Components/show-supplier/show-supplier.component';
import { UpdateSupplierComponent } from './Components/update-supplier/update-supplier.component';
import { CityComponent } from './Components/city/city.component';
import { AddCityComponent } from './Components/add-city/add-city.component';
import { UpdateCityComponent } from './Components/update-city/update-city.component';
import { AccountingComponent } from './Components/accounting/accounting.component';
import { AddAccountComponent } from './Components/add-account/add-account.component';
import { CurrencyComponent } from './Components/currency/currency.component';
import { AddCurrencyComponent } from './Components/add-currency/add-currency.component';
import { UpdateCurrencyComponent } from './Components/update-currency/update-currency.component';
import { ShowAccountComponent } from './Components/show-account/show-account.component';
import { UpdateAccountComponent } from './Components/update-account/update-account.component';
import { AccountsComponent } from './Components/accounts/accounts.component';
import { StoresComponent } from './Components/stores/stores.component';
import { AddStoreComponent } from './Components/add-store/add-store.component';
import { ProductsComponent } from './Components/products/products.component';
import { AddProductComponent } from './Components/add-product/add-product.component';
import { ProductUnitComponent } from './Components/product-unit/product-unit.component';
import { UpdateStoreComponent } from './Components/update-store/update-store.component';
import { ShowStoreComponent } from './Components/show-store/show-store.component';
import { ManageBankComponent } from './Components/manage-bank/manage-bank.component';
import { AddProductUnitComponent } from './Components/add-product-unit/add-product-unit.component';
import { UpdateProductUnitComponent } from './Components/update-product-unit/update-product-unit.component';
import { BanksComponent } from './Components/banks/banks.component';
import { AddBankComponent } from './Components/add-bank/add-bank.component';
import { UpdateBankComponent } from './Components/update-bank/update-bank.component';
import { BankBranchComponent } from './Components/bank-branch/bank-branch.component';
import { AddBankBranchComponent } from './Components/add-bank-branch/add-bank-branch.component';
import { UpdateBankBranchComponent } from './Components/update-bank-branch/update-bank-branch.component';
import { ShowBankBranchComponent } from './Components/show-bank-branch/show-bank-branch.component';
import { ShowProductComponent } from './Components/show-product/show-product.component';
import { UpdateProductComponent } from './Components/update-product/update-product.component';
import { DocumentsComponent } from './Components/documents/documents.component';
import { CheckManagementComponent } from './Components/check-management/check-management.component';
import { ProductBranchComponent } from './Components/product-branch/product-branch.component';
import { AddProductBranchComponent } from './Components/add-product-branch/add-product-branch.component';
import { UpdateProductBranchComponent } from './Components/update-product-branch/update-product-branch.component';
import { ViewProductBranchComponent } from './Components/view-product-branch/view-product-branch.component';
import { ProductDeterminantsComponent } from './Components/product-determinants/product-determinants.component';
import { AddProductDeterminantsComponent } from './Components/add-product-determinants/add-product-determinants.component';
import { DocumentEntryComponent } from './Components/document-entry/document-entry.component';
import { AddDocumentEntryComponent } from './Components/add-document-entry/add-document-entry.component';
import { SalesComponent } from './Components/sales/sales.component';
import { PurchasesComponent } from './Components/purchases/purchases.component';
import { PriceCategoryComponent } from './Components/price-category/price-category.component';
import { AddPriceCategoryComponent } from './Components/add-price-category/add-price-category.component';
import { UpdatePriceCategoryComponent } from './Components/update-price-category/update-price-category.component';
import { BankAccountsComponent } from './Components/bank-accounts/bank-accounts.component';
import { AddBankAccountsComponent } from './Components/add-bank-accounts/add-bank-accounts.component';
import { UpdateBankAccountsComponent } from './Components/update-bank-accounts/update-bank-accounts.component';
// import { AdditionalInfoComponent } from './Components/additional-info/additional-info.component';
import { AddCheckComponent } from './Components/add-check/add-check.component';
import { ViewCheckComponent } from './Components/view-check/view-check.component';
import { CheckOperationsComponent } from './Components/check-operations/check-operations.component';
import { AddPurchaseComponent } from './Components/add-purchase/add-purchase.component';
import { UpdatePurchaseComponent } from './Components/update-purchase/update-purchase.component';
import { ShowPurchaseComponent } from './Components/show-purchase/show-purchase.component';
import { OrderComponent } from './Components/order/order.component';
import { AddOrderComponent } from './Components/add-order/add-order.component';
import { UpdateOrderComponent } from './Components/update-order/update-order.component';
import { ShowOrderComponent } from './Components/show-order/show-order.component';
import { AddsalesComponent } from './Components/addsales/addsales.component';
import { UpdateSalesComponent } from './Components/update-sales/update-sales.component';
import { ShowSalesComponent } from './Components/show-sales/show-sales.component';
import { ApprovedPurchasesComponent } from './Components/approved-purchases/approved-purchases.component';
import { UserComponent } from './Components/user/user.component';
import { AddUserComponent } from './Components/add-user/add-user.component';
import { UpdateUserComponent } from './Components/update-user/update-user.component';
import { ShowUserComponent } from './Components/show-user/show-user.component';
import { AddDocumentComponent } from './Components/add-document/add-document.component';
import { SystemSettingsComponent } from './Components/system-settings/system-settings.component';
import { AccountSettingsComponent } from './Components/account-settings/account-settings.component';
import { GeneralSettingsComponent } from './Components/general-settings/general-settings.component';
import { ShowPaymentDocumentComponent } from './Components/show-payment-document/show-payment-document.component';
import { UpdatePaymentDocumentComponent } from './Components/update-payment-document/update-payment-document.component';


export const routes: Routes = [
    {path:"",component:LoginComponent},
    {path:"login",component:LoginComponent},
    {path:"dashboard",component:DashboardComponent,children:[
        
        {path:"vendor",component:VendorComponent},
        
        {path:"system-settings",component:SystemSettingsComponent,children:[
            {path:"account-setting",component:AccountSettingsComponent},
            {path:"general-setting",component:GeneralSettingsComponent},

        ]},

        {path:"check-operation",component:CheckOperationsComponent},
        
        {path:"addPurchase",component:AddPurchaseComponent},
        {path:"purchases",component:PurchasesComponent},
        {path:"approvedPurchases",component:ApprovedPurchasesComponent},
        {path:"updatePurchase/:id",component:UpdatePurchaseComponent},
        {path:"showPurchase/:id",component:ShowPurchaseComponent},
        {path:"showPaymentDocument/:id",component:ShowPaymentDocumentComponent},
        {path:"updatePaymentDocument/:id",component:UpdatePaymentDocumentComponent},

        
        
        {path:"addcheck",component:AddCheckComponent},
        
        {path:"check/:id",component:ViewCheckComponent},

        {path:"createVendor",component:CreateVendorComponent},
        //   {path:"document/:type",component:AddDocumentComponent},
        {path:"addDocument/:type",component:AddDocumentComponent},
        {path:"document/:type",component:DocumentsComponent},
        {path:"check",component:CheckManagementComponent},

        {path:"documentEntry",component:DocumentEntryComponent},
        {path:"addDocumentEntry",component:AddDocumentEntryComponent},


        {path:"updateVendor/:id",component:UpdateVendorComponent},
        {path:"showVendor/:id",component:ShowVendorComponent},

        {path:"createCustomer",component:CreateCustomerComponent},
        {path:"updateCustomer",component:UpdateCustomerComponent},
        {path:"showCustomer",component:ShowCustomerComponent},

        {path:"createSupplier",component:CreateSupplierComponent},
        {path:"updateSupplier",component:UpdateSupplierComponent},
        {path:"showSupplier",component:ShowSupplierComponent},
        {path:"group",component:GroupComponent},
        {path:"addGroup",component:AddGroupComponent},
        {path:"updateGroup/:id",component:UpdateGroupComponent},
        // {path:"addtionalInformation",component:AdditionalInfoComponent},
        {path:"city",component:CityComponent},
        {path:"bank",component:ManageBankComponent},

        {path:"addCity",component:AddCityComponent},
        {path:"updateCity/:id",component:UpdateCityComponent},

        {path:"currency",component:CurrencyComponent},
        {path:"addCurrency",component:AddCurrencyComponent},
        {path:"updateCurrency/:id",component:UpdateCurrencyComponent},

        {path:"customer",component:CustomerComponent},
        {path:"supplier",component:SupplierComponent},
        {path:"accounting",component:AccountingComponent},
        {path:"accounting/:type",component:AccountingComponent},
        {path:"addAccount/:type",component:AddAccountComponent},
        {path:"showAccount/:id",component:ShowAccountComponent},
        {path:"updateAccount/:id",component:UpdateAccountComponent},
        {path:"accounts",component:AccountsComponent},
         
        {path:"stores",component:StoresComponent},
        {path:"addStore",component:AddStoreComponent},
        {path:"updateStore/:id",component:UpdateStoreComponent},
        {path:"showStore/:id",component:ShowStoreComponent},
         
        {path:"products",component:ProductsComponent},
        {path:"addProduct",component:AddProductComponent},
        {path:"updateProduct/:id",component:UpdateProductComponent},
        {path:"showProduct/:id",component:ShowProductComponent},

        {path:"productUnit",component:ProductUnitComponent},
        {path:"addProductUnit",component:AddProductUnitComponent},
        {path:"updateProductUnit/:id",component:UpdateProductUnitComponent},

        {path:"banks",component:BanksComponent},
        {path:"addBank",component:AddBankComponent},
        {path:"updateBank/:id",component:UpdateBankComponent},
         
        {path:"bankBranch",component:BankBranchComponent},
        {path:"addBankBranch",component:AddBankBranchComponent},
        {path:"updateBankBranch/:id",component:UpdateBankBranchComponent},
        {path:"showBankBranch/:id",component:ShowBankBranchComponent},

        {path:"bankAccounts",component:BankAccountsComponent},
        {path:"addBankAccount",component:AddBankAccountsComponent},
        {path:"updateBankAccount/:id",component:UpdateBankAccountsComponent},

        {path:"productBranch",component:ProductBranchComponent},
        {path:"addProductBranch",component:AddProductBranchComponent},
        {path:"updateProductBranch/:id",component:UpdateProductBranchComponent},
        {path:"showProductBranch/:id",component:ViewProductBranchComponent},

        {path:"productDeterminants",component:ProductDeterminantsComponent},
        {path:"addProductDeterminant",component:AddProductDeterminantsComponent},

        {path:"priceCategory",component:PriceCategoryComponent},
        {path:"addPriceCategory",component:AddPriceCategoryComponent},
        {path:"updateCategory/:id",component:UpdatePriceCategoryComponent},

        {path:"orders",component:OrderComponent},
        {path:"addOrder",component:AddOrderComponent},
        {path:"updateOrder/:id",component:UpdateOrderComponent},
        {path:"showOrder/:id",component:ShowOrderComponent},
         
        {path:"sales",component:SalesComponent},
        {path:"addSale",component:AddsalesComponent},
        {path:"updateSale/:id",component:UpdateSalesComponent},
        {path:"showSale/:id",component:ShowSalesComponent},

        {path:"users",component:UserComponent},
        {path:"addUser",component:AddUserComponent},
        {path:"updateUser/:id",component:UpdateUserComponent},
        {path:"showUser/:id",component:ShowUserComponent},

    ]},
    {path:"**",component:NotfoundComponent},


];
