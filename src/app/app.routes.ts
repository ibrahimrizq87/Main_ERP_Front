import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { NotfoundComponent } from './Components/notfound/notfound.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
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
import { AddCheckComponent } from './Components/add-check/add-check.component';
import { ViewCheckComponent } from './Components/view-check/view-check.component';
import { CheckOperationsComponent } from './Components/check-operations/check-operations.component';
import { AddPurchaseComponent } from './Components/add-purchase/add-purchase.component';
import { UpdatePurchaseComponent } from './Components/update-purchase/update-purchase.component';
import { ShowPurchaseComponent } from './Components/show-purchase/show-purchase.component';
import { UpdateOrderComponent } from './Components/update-order/update-order.component';
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
import { UpdateEntryDocumentComponent } from './Components/update-entry-document/update-entry-document.component';
import { CountriesComponent } from './Components/countries/countries.component';
import { ShowCountryComponent } from './Components/show-country/show-country.component';
import { UpdateCountryComponent } from './Components/update-country/update-country.component';
import { AddCountryComponent } from './Components/add-country/add-country.component';
import { ProductCategoryComponent } from './Components/product-category/product-category.component';
import { AddProductCategoryComponent } from './Components/add-product-category/add-product-category.component';
import { UpdateProductCategoryComponent } from './Components/update-product-category/update-product-category.component';
import { ProductMovesComponent } from './Components/product-moves/product-moves.component';
import { AddProductMoveComponent } from './Components/add-product-move/add-product-move.component';
import { UpdateProductMoveComponent } from './Components/update-product-move/update-product-move.component';
import { UpdateAccountCategoriesComponent } from './Components/update-account-categories/update-account-categories.component';
import { AccountCategoriesComponent } from './Components/account-categories/account-categories.component';
import { AddAccountCategoryComponent } from './Components/add-account-category/add-account-category.component';
import { ClientsComponent } from './Components/clients/clients.component';
import { AddClientsComponent } from './Components/add-clients/add-clients.component';
import { DelegatesComponent } from './Components/delegates/delegates.component';
import { AddDelegateComponent } from './Components/add-delegate/add-delegate.component';
import { UpdateDelegateComponent } from './Components/update-delegate/update-delegate.component';
import { VendorsComponent } from './Components/vendors/vendors.component';
import { AddVendorComponent } from './Components/add-vendor/add-vendor.component';
import { UpdateClientsComponent } from './Components/update-clients/update-clients.component';
import { TestingDesignComponent } from './Components/testing-design/testing-design.component';
import { ColorsComponent } from './Components/colors/colors.component';
import { AddColorComponent } from './Components/add-color/add-color.component';
import { UpdateColorComponent } from './Components/update-color/update-color.component';
import { UpdateDeterminantComponent } from './Components/update-determinant/update-determinant.component';
import { ShowCityComponent } from './Components/show-city/show-city.component';
import { ShowDocumentEntryComponent } from './Components/show-document-entry/show-document-entry.component';
import { CheckDocumentsComponent } from './Components/check-documents/check-documents.component';
import { CurrencyPriceTrackingComponent } from './Components/currency-price-tracking/currency-price-tracking.component';
import { RolesSystemComponent } from './Components/roles-system/roles-system.component';
import { SalesReportsComponent } from './Components/sales-reports/sales-reports.component';
import { PurchasesReportsComponent } from './Components/purchases-reports/purchases-reports.component';
import { ProductMovesReportsComponent } from './Components/product-moves-reports/product-moves-reports.component';
import { AccountMovesReportsComponent } from './Components/account-moves-reports/account-moves-reports.component';
import { RolesComponent } from './Components/roles/roles.component';
import { AddRolesComponent } from './Components/add-roles/add-roles.component';
import { AddReturnPurchaseBillComponent } from './Components/add-return-purchase-bill/add-return-purchase-bill.component';
import { ReturnPurchaseBillsComponent } from './Components/return-purchase-bills/return-purchase-bills.component';
import { ViewReturnPurchaseBillComponent } from './Components/view-return-purchase-bill/view-return-purchase-bill.component';
import { AddProductInternalMovesComponent } from './Components/add-product-internal-moves/add-product-internal-moves.component';
import { ProductInternalMovesComponent } from './Components/product-internal-moves/product-internal-moves.component';
import { UpdateProductInternalMovesComponent } from './Components/update-product-internal-moves/update-product-internal-moves.component';
import { ShowProductInternalMovesComponent } from './Components/show-product-internal-moves/show-product-internal-moves.component';
import { ReturnSalesComponent } from './Components/return-sales/return-sales.component';
import { AddReturnSalesComponent } from './Components/add-return-sales/add-return-sales.component';
import { UpdateReturnSalesComponent } from './Components/update-return-sales/update-return-sales.component';
import { ViewReturnSalesComponent } from './Components/view-return-sales/view-return-sales.component';
import { EmployeesComponent } from './Components/employees/employees.component';
import { AddEmployeeComponent } from './Components/add-employee/add-employee.component';
import { UpdateEmployeesComponent } from './Components/update-employees/update-employees.component';
import { ShowEmployeeComponent } from './Components/show-employee/show-employee.component';
import { RegisterComponent } from './Components/register/register.component';
import { LoginClientComponent } from './Components/login-client/login-client.component';
import { HomeComponent } from './Components/home/home.component';
import { ShowproductBranchesClientComponent } from './Components/showproduct-branches-client/showproduct-branches-client.component';
import { RoleGuard } from './shared/guards/role.guard';
import { CompanyBranchesComponent } from './Components/company-branches/company-branches.component';
import { AddCompanyBranchComponent } from './Components/add-company-branch/add-company-branch.component';
import { UpdateCompanyBranchesComponent } from './Components/update-company-branches/update-company-branches.component';
import { ShowCompanyBranchesComponent } from './Components/show-company-branches/show-company-branches.component';
import { VecationsComponent } from './Components/vecations/vecations.component';
import { AddVecationComponent } from './Components/add-vecation/add-vecation.component';
import { UpdateVecationComponent } from './Components/update-vecation/update-vecation.component';
import { ShowVecationComponent } from './Components/show-vecation/show-vecation.component';
import { VecationRequestsComponent } from './Components/vecation-requests/vecation-requests.component';
import { ShowVecationRequestsComponent } from './Components/show-vecation-requests/show-vecation-requests.component';
import { AttendanceReportsComponent } from './Components/attendance-reports/attendance-reports.component';
import { ShowAttendanceDetailsComponent } from './Components/show-attendance-details/show-attendance-details.component';
import { SalariesReportsComponent } from './Components/salaries-reports/salaries-reports.component';
import { UpdateAttendanceComponent } from './Components/update-attendance/update-attendance.component';


export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "loginClient", component: LoginClientComponent },
    { path: "showProductClient/:id", component: ShowproductBranchesClientComponent },
    {
        path: "dashboard", component: DashboardComponent
        , children: [


            {
                path: "system-settings", component: SystemSettingsComponent, children: [
                    { path: "account-setting", component: AccountSettingsComponent },
                    { path: "general-setting", component: GeneralSettingsComponent },

                ]
            },

            { path: "add-return-purchase", component: AddReturnPurchaseBillComponent },
            { path: "return-purchase/:status", component: ReturnPurchaseBillsComponent },
            { path: "show-return-purchase/:id", component: ViewReturnPurchaseBillComponent },

            { path: "account-moves-reports", component: AccountMovesReportsComponent },
            { path: "product-moves-reports", component: ProductMovesReportsComponent },
            { path: "purchases-reports", component: PurchasesReportsComponent },
            { path: "sales-reports", component: SalesReportsComponent },
            { path: "currency-price-tracking", component: CurrencyPriceTrackingComponent },
            { path: "check-documents/:type", component: CheckDocumentsComponent },

            { path: "colors", component: ColorsComponent },
            { path: "add-color", component: AddColorComponent },
            { path: "update-color/:id", component: UpdateColorComponent },


            { path: "product-moves", component: ProductMovesComponent },
            { path: "add-product-move", component: AddProductMoveComponent },
            { path: "update-product-move", component: UpdateProductMoveComponent },

            { path: "clients", component: ClientsComponent },
            { path: "add-client", component: AddClientsComponent },
            { path: "update-client/:id", component: UpdateClientsComponent },
            { path: "testing", component: TestingDesignComponent },


            { path: "vendors", component: VendorsComponent },
            { path: "add-vendor", component: AddVendorComponent },
            { path: "update-vendor/:id", component: UpdateVendorComponent },

            { path: "delegates", component: DelegatesComponent },
            { path: "add-delegate", component: AddDelegateComponent },
            { path: "update-delegate/:id", component: UpdateDelegateComponent },


            { path: "update-account-category/:id", component: UpdateAccountCategoriesComponent },
            { path: "add-account-category/:type", component: AddAccountCategoryComponent },
            { path: "account-categories/:type", component: AccountCategoriesComponent },

            { path: "check-operation", component: CheckOperationsComponent },

            { path: "addPurchase", component: AddPurchaseComponent },
            { path: "purchases/:status", component: PurchasesComponent },
            { path: "approvedPurchases", component: ApprovedPurchasesComponent },
            { path: "updatePurchase/:id", component: UpdatePurchaseComponent },
            { path: "showPurchase/:id", component: ShowPurchaseComponent },


            { path: "addProductInternalMoves", component: AddProductInternalMovesComponent },
            { path: "productInternalMoves/:status", component: ProductInternalMovesComponent },
            { path: "updateProductInternalMoves/:id", component: UpdateProductInternalMovesComponent },
            { path: "showProductInternalMoves/:id", component: ShowProductInternalMovesComponent },



            { path: "showPaymentDocument/:id", component: ShowPaymentDocumentComponent },
            { path: "updatePaymentDocument/:id", component: UpdatePaymentDocumentComponent },
            { path: "updateEntryDocument/:id", component: UpdateEntryDocumentComponent },
            { path: "showEntryDocument/:id", component: ShowDocumentEntryComponent },
            { path: "productCategories", component: ProductCategoryComponent },
            { path: "addCategory", component: AddProductCategoryComponent },
            { path: "updateproductCategory/:id", component: UpdateProductCategoryComponent },



            { path: "countries", component: CountriesComponent },
            { path: "showCountry/:id", component: ShowCountryComponent },
            { path: "updateCountry/:id", component: UpdateCountryComponent },
            { path: "addCountry", component: AddCountryComponent },


            { path: "addcheck", component: AddCheckComponent },
            { path: "check/:id", component: ViewCheckComponent },
            { path: "createVendor", component: CreateVendorComponent },
            { path: "addDocument/:type", component: AddDocumentComponent },
            { path: "document/:type/:status", component: DocumentsComponent },
            { path: "check_list/:status", component: CheckManagementComponent },

            { path: "documentEntry/:status", component: DocumentEntryComponent },
            { path: "addDocumentEntry", component: AddDocumentEntryComponent },


            { path: "updateVendor/:id", component: UpdateVendorComponent },
            { path: "showVendor/:id", component: ShowVendorComponent },

            { path: "createCustomer", component: CreateCustomerComponent },
            { path: "updateCustomer", component: UpdateCustomerComponent },
            { path: "showCustomer", component: ShowCustomerComponent },

            { path: "createSupplier", component: CreateSupplierComponent },
            { path: "updateSupplier", component: UpdateSupplierComponent },
            { path: "showSupplier", component: ShowSupplierComponent },
            { path: "group", component: GroupComponent },
            { path: "addGroup", component: AddGroupComponent },
            { path: "updateGroup/:id", component: UpdateGroupComponent },

            { path: "city", component: CityComponent },
            { path: "bank", component: ManageBankComponent },
            { path: "addCity", component: AddCityComponent },
            { path: "updateCity/:id", component: UpdateCityComponent },
            { path: "showCity/:id", component: ShowCityComponent },

            { path: "currency", component: CurrencyComponent },
            { path: "addCurrency", component: AddCurrencyComponent },
            { path: "updateCurrency/:id", component: UpdateCurrencyComponent },

            { path: "customer", component: CustomerComponent },
            { path: "supplier", component: SupplierComponent },
            { path: "accounting", component: AccountingComponent },
            { path: "accounting/:type", component: AccountingComponent },
            { path: "addAccount/:type", component: AddAccountComponent },
            { path: "showAccount/:id", component: ShowAccountComponent },
            { path: "updateAccount/:id", component: UpdateAccountComponent },
            { path: "accounts", component: AccountsComponent },

            { path: "stores", component: StoresComponent },
            { path: "addStore", component: AddStoreComponent },
            { path: "updateStore/:id", component: UpdateStoreComponent },
            { path: "showStore/:id", component: ShowStoreComponent },

            { path: "products", component: ProductsComponent },
            { path: "addProduct", component: AddProductComponent },
            { path: "updateProduct/:id", component: UpdateProductComponent },
            { path: "showProduct/:id", component: ShowProductComponent },

            { path: "productUnit", component: ProductUnitComponent },
            { path: "addProductUnit", component: AddProductUnitComponent },
            { path: "updateProductUnit/:id", component: UpdateProductUnitComponent },

            { path: "banks", component: BanksComponent },
            { path: "addBank", component: AddBankComponent },
            { path: "updateBank/:id", component: UpdateBankComponent },

            { path: "bankBranch", component: BankBranchComponent },
            { path: "addBankBranch", component: AddBankBranchComponent },
            { path: "updateBankBranch/:id", component: UpdateBankBranchComponent },
            { path: "showBankBranch/:id", component: ShowBankBranchComponent },

            { path: "bankAccounts", component: BankAccountsComponent },
            { path: "addBankAccount", component: AddBankAccountsComponent },
            { path: "updateBankAccount/:id", component: UpdateBankAccountsComponent },

            { path: "productBranch", component: ProductBranchComponent },
            { path: "addProductBranch", component: AddProductBranchComponent },
            { path: "updateProductBranch/:id", component: UpdateProductBranchComponent },
            { path: "showProductBranch/:id", component: ViewProductBranchComponent },

            { path: "productDeterminants", component: ProductDeterminantsComponent },
            { path: "addProductDeterminant", component: AddProductDeterminantsComponent },
            { path: "update-determinant/:id", component: UpdateDeterminantComponent },



            { path: "priceCategory", component: PriceCategoryComponent },
            { path: "addPriceCategory", component: AddPriceCategoryComponent },
            { path: "updateCategory/:id", component: UpdatePriceCategoryComponent },

            { path: "updateOrder/:id", component: UpdateOrderComponent },

            { path: "sales/:status", component: SalesComponent },
            { path: "addSale", component: AddsalesComponent },
            { path: "updateSale/:id", component: UpdateSalesComponent },
            { path: "showSale/:id", component: ShowSalesComponent },

            { path: "return-sales/:status", component: ReturnSalesComponent },
            { path: "add-return-sale", component: AddReturnSalesComponent },
            { path: "update-return-sale/:id", component: UpdateReturnSalesComponent },
            { path: "show-return-sale/:id", component: ViewReturnSalesComponent },


            { path: "users", component: UserComponent },
            { path: "addUser", component: AddUserComponent },
            { path: "updateUser/:id", component: UpdateUserComponent },
            { path: "showUser/:id", component: ShowUserComponent },

            { path: "rolesAndPermissions", component: RolesSystemComponent },
            { path: "roles", component: RolesComponent },
            { path: "addRole", component: AddRolesComponent },

            { path: "employees", component: EmployeesComponent },
            { path: "add-employee", component: AddEmployeeComponent },
            { path: "update-employee/:id", component: UpdateEmployeesComponent },
            { path: "show-employee/:id", component: ShowEmployeeComponent },


            { path: "vecations", component: VecationsComponent },
            { path: "add-vecation", component: AddVecationComponent },
            { path: "update-vecation/:id", component: UpdateVecationComponent },
            { path: "show-vecation/:id", component: ShowVecationComponent },
            
            { path: "companyBranches", component: CompanyBranchesComponent },
            { path: "addCompanyBranch", component: AddCompanyBranchComponent },
            { path: "updateCompanyBranch/:id", component: UpdateCompanyBranchesComponent },
            { path: "showCompanyBranch/:id", component: ShowCompanyBranchesComponent },

            { path: "vecationRequests", component: VecationRequestsComponent },
            {path: "show-vecation-requests/:id", component: ShowVecationRequestsComponent},

            {path:"attendance-reports",component:AttendanceReportsComponent},
            {path:"show-attendance/:id",component:ShowAttendanceDetailsComponent},
            {path:"update-attendance/:id",component:UpdateAttendanceComponent},

            {path:"salaries-reports",component:SalariesReportsComponent},

        ], canActivate: [RoleGuard],
        data: { roles: ['admin','worker'] }
    },
    { path: "**", component: NotfoundComponent },
];
