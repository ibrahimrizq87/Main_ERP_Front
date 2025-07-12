import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../shared/services/employee.service';
import { SalaryService } from '../../shared/services/salary.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { CurrencyService } from '../../shared/services/currency.service';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../shared/services/account.service';

@Component({
  selector: 'app-salaries-reports',
  standalone: true,
  imports: [TranslateModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './salaries-reports.component.html',
  styleUrl: './salaries-reports.component.css'
})
export class SalariesReportsComponent implements OnInit {
  employees: any[] = [];
  selectedEmployeeId: string = '';
  selectedMonth: string = this.getCurrentMonth();
  salariesData: any = null;
  isLoading: boolean = false;
  actionType = 'not_paid';


  savedSalariesData: any;
  constructor(
    private _SalaryService: SalaryService,
    private toastr: ToastrService,
    private _Router: Router,
    private _EmployeeService: EmployeeService,
    private _CurrencyService: CurrencyService,
    private _AccountService: AccountService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadSalariesData();
    this.loadAccounts();
    this.loadDefaultCurrency();
  }

  changeStatus(type: string) {
    this.actionType = type;
    if (type == 'paid' || type == 'paid_historey') {
      this.selectedEmployeeId = 'all';
    }
    this.loadSalariesData();
  }
  getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  loadEmployees(): void {
    this._EmployeeService.getAllEmployees().subscribe({
      next: (response) => {
        if (response) {
          this.employees = response.data.employees;
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load employees');
      }
    });
  }

  onEmployeeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue == 'all') {
      console.log('all');
    }
    this.loadSalariesData();
  }

  onMonthChange(): void {
    this.loadSalariesData();
  }


  floor(value: number): number {
    return Math.floor(value);
  }



  paySalary(salary: any) {
    const formData = new FormData();


    if (!this.selectedAccount) {
      alert('select account first');
    }
    formData.append('account_id', this.selectedAccount.id);
    if (this.needCurrencyPrice) {
      formData.append('currency_price_value', this.currnceyPrice.toString());
    }
    let completeData = true;
    if (salary.need_currency_value && !salary.currnceyPrice) {
      alert('make sure to provide all data');
      completeData = false;
    }

    //  'account_id' => 'required|exists:accounts,id',
    //     'currency_price' => 'nullable|numeric|min:0',

    //     'salaries' => 'required|array',
    //     'salaries.*.salary_id' => 'required|exists:salaries,id',
    //     'salaries.*.currency_price' =>  'nullable|numeric|min:0',
    formData.append('salaries[0][salary_id]', salary.id);
    if (salary.need_currency_value) {
      formData.append('salaries[0][currency_price_value]', salary.currnceyPrice);
      console.log(salary.currnceyPrice)
    }





    if (completeData) {
      this._SalaryService.paySalaty(formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.loadSalariesData();
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Failed to load salary data');
            this.isLoading = false;
          }
        });
    }


  }

  onSearchChange() {




  }

  save(item: any) {
    const selectedMonth = this.selectedMonth;
    const firstDay = new Date(`${selectedMonth}-01`);
    const formattedFirstDay = firstDay.toISOString().split('T')[0];
    const formData = new FormData();
    formData.append('salaries[0][date]', formattedFirstDay);
    const total_salary = item.salary.base_salary + (item.bonus | 0) + (item.salary.bonus | 0) - (item.salary.deduction | 0) - (item.deduction | 0);
    formData.append('salaries[0][employee_id]', item.employee.id);
    formData.append('salaries[0][base_salary]', item.salary.base_salary);
    formData.append('salaries[0][net_salary]', total_salary.toString() || '0');
    formData.append('salaries[0][date]', formattedFirstDay);

    if (item.reason) {
      formData.append('salaries[0][note]', item.reason);
    }
    if (item.bonus) {
      formData.append('salaries[0][additional_bonus]', item.bonus);
    }
    if (item.deduction) {
      formData.append('salaries[0][additional_deduction]', item.deduction);
    }
    if (item.salary.deduction) {
      formData.append('salaries[0][deduction]', item.salary.deduction);
    }

    if (item.salary.bonus) {
      formData.append('salaries[0][bonus]', item.salary.bonus);
    }

    this._SalaryService.saveSalary(formData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.loadSalariesData();


        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load salary data');
          this.isLoading = false;
        }
      });
  }
  loadSalariesData(): void {

    if (!this.selectedMonth) {
      this.toastr.warning('Please select a month');
      return;
    }

    this.isLoading = true;
    this.salariesData = null;



    if (this.actionType == 'paid' || this.actionType == 'paid_historey') {

      let status = 'paid';
      if (this.actionType == 'paid') {
        status = 'not_paid';
      }


      this._SalaryService.getSavedSalaries(this.selectedMonth, status)
        .subscribe({
          next: (response) => {
            this.savedSalariesData = response.data || null;
            console.log('saved Salaries data:', response);
            this.isLoading = false;

            if (!this.savedSalariesData) {
              this.toastr.info('No salary data found for the selected criteria');
            }
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Failed to load salary data');
            this.isLoading = false;
          }
        });
    } else {
      if (this.selectedEmployeeId != 'all') {
        this._SalaryService.getSalariesReports(this.selectedMonth, this.selectedEmployeeId)
          .subscribe({
            next: (response) => {
              this.salariesData = response.data || null;
              console.log('Salaries data:', this.salariesData);
              this.isLoading = false;

              if (!this.salariesData) {
                this.toastr.info('No salary data found for the selected criteria');
              }
            },
            error: (err) => {
              console.error(err);
              this.toastr.error('Failed to load salary data');
              this.isLoading = false;
            }
          });
      } else {

        this._SalaryService.getSalariesReports(this.selectedMonth,)
          .subscribe({
            next: (response) => {
              this.salariesData = response.data || null;
              console.log('Salaries data:', this.salariesData);
              this.isLoading = false;

              if (!this.salariesData) {
                this.toastr.info('No salary data found for the selected criteria');
              }
            },
            error: (err) => {
              console.error(err);
              this.toastr.error('Failed to load salary data');
              this.isLoading = false;
            }
          });


      }
    }



  }


  saveAll() {

    let counter = 0;

    const formData = new FormData();

    this.salariesData.forEach((item: any) => {

      if (!item.salary.is_salary && !item.salary.has_future_days) {

        const selectedMonth = this.selectedMonth;
        const firstDay = new Date(`${selectedMonth}-01`);
        const formattedFirstDay = firstDay.toISOString().split('T')[0];

        formData.append('salaries[' + counter.toString() + '][date]', formattedFirstDay);
        const total_salary = item.salary.base_salary + (item.bonus | 0) + (item.salary.bonus | 0) - (item.salary.deduction | 0) - (item.deduction | 0);
        formData.append('salaries[' + counter.toString() + '][employee_id]', item.employee.id);
        formData.append('salaries[' + counter.toString() + '][base_salary]', item.salary.base_salary);
        formData.append('salaries[' + counter.toString() + '][net_salary]', total_salary.toString() || '0');
        formData.append('salaries[' + counter.toString() + '][date]', formattedFirstDay);

        if (item.reason) {
          formData.append('salaries[' + counter.toString() + '][note]', item.reason);
        }
        if (item.bonus) {
          formData.append('salaries[' + counter.toString() + '][additional_bonus]', item.bonus);
        }
        if (item.deduction) {
          formData.append('salaries[' + counter.toString() + '][additional_deduction]', item.deduction);
        }
        if (item.salary.deduction) {
          formData.append('salaries[' + counter.toString() + '][deduction]', item.salary.deduction);
        }

        if (item.salary.bonus) {
          formData.append('salaries[' + counter.toString() + '][bonus]', item.salary.bonus);
        }
        counter++;
      }
      console.log(counter)
    });



    if (counter > 0) {

      this._SalaryService.saveSalary(formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.loadSalariesData();


          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Failed to load salary data');
            this.isLoading = false;
          }
        });
    }

  }

  showDetails(item: any) {
    this.selectedEmployeeId = item.employee.id;
    this.loadSalariesData();

  }

  getSelectedEmployeeName(): string {
    if (!this.selectedEmployeeId) return '';
    const employee = this.employees.find(e => e.id === this.selectedEmployeeId);
    return employee?.account?.name || '';
  }


  loadDefaultCurrency() {
    this._CurrencyService.getDefultCurrency().subscribe({
      next: (response) => {
        if (response) {
          this.currency = response.data;
        }
      },
      error: (err) => {
        if (err.status == 404) {
          this.toastr.error('يجب اختيار عملة اساسية قبل القيام بأى عملية شراء او بيع');
          this._Router.navigate(['/dashboard/currency']);
        }
        console.log(err);
      }
    });
  }


  filteredAccounts: any;
  currency: any;
  needCurrencyPrice = false;
  currnceyPrice = 1;
  selectAccount(account: any) {
    if (account.currency.id != this.currency.id) {
      this.needCurrencyPrice = true;
    } else {
      this.needCurrencyPrice = false;
    }

    this.selectedAccount = account;

    this.closeModal('accountModal');
  }







  loadAccounts() {
    this._AccountService.getChildrenByParentIds([111, 112, 113]).subscribe({
      next: (response) => {
        if (response) {
          this.filteredAccounts = response.data;
        }
      },
      error: (err) => {
        if (err.status == 404) {

        }
        console.log(err);
      }
    });
  }
  searchQuery: string = '';
  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  selectedAccount: any;

  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

}


