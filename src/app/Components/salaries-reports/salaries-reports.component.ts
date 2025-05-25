import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../shared/services/employee.service';
import { SalaryService } from '../../shared/services/salary.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-salaries-reports',
  standalone: true,
  imports: [TranslateModule, CommonModule, FormsModule],
  templateUrl: './salaries-reports.component.html',
  styleUrl: './salaries-reports.component.css'
})
export class SalariesReportsComponent implements OnInit {
  employees: any[] = [];
  selectedEmployeeId: string = '';
  selectedMonth: string = this.getCurrentMonth();
  salariesData: any = null;
  isLoading: boolean = false;

  constructor(
    private _SalaryService: SalaryService,
    private toastr: ToastrService,
    private _EmployeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
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
          this.employees = response.data;
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load employees');
      }
    });
  }

  onEmployeeChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    if(selectedValue == 'all'){
    console.log('all');
    }
    this.loadSalariesData();
  }

  onMonthChange(): void {
    this.loadSalariesData();
  }



  save(item:any){

    


            //  'salaries' => 'required|array',
            //             'salaries.*.employee_id' => 'required|exists:employees,id',
            //             'salaries.*.base_salary' => 'required|numeric|min:0',
            //             'salaries.*.net_salary' => 'required|numeric|min:0',
            //             'salaries.*.deduction' => 'nullable|numeric|min:0',
            //             'salaries.*.additional_deduction' => 'nullable|numeric|min:0',
            //             'salaries.*.bonus' => 'nullable|numeric|min:0',
            //             'salaries.*.additional_bonus' => 'nullable|numeric|min:0',
            //             'salaries.*.note' => 'nullable|string|max:255',
            //             'salaries.*.date' => 'required|date',


 const selectedMonth = this.selectedMonth;
const firstDay = new Date(`${selectedMonth}-01`);
const formattedFirstDay = firstDay.toISOString().split('T')[0];

// console.log(formattedFirstDay);
 const formData = new FormData();
 formData.append('salaries[0][date]', formattedFirstDay);

             //             'salaries.*.employee_id' => 'required|exists:employees,id',
            //             'salaries.*.base_salary' => 'required|numeric|min:0',
            //             'salaries.*.net_salary' => 'required|numeric|min:0',

const total_salary = item.salary.base_salary + (item.bonus | 0) + (item.salary.bonus | 0) - (item.salary.deduction | 0) - (item.deduction |0);
 formData.append('salaries[0][employee_id]', item.employee.id);
 formData.append('salaries[0][base_salary]', item.salary.base_salary);
 formData.append('salaries[0][net_salary]', total_salary.toString() || '0');
 formData.append('salaries[0][date]', formattedFirstDay);

 if(item.reason){
 formData.append('salaries[0][note]', item.reason);
 }
  if(item.bonus){
 formData.append('salaries[0][additional_bonus]', item.bonus);
 }
  if(item.deduction){
 formData.append('salaries[0][additional_deduction]', item.deduction);
 }
  if(item.salary.deduction){
 formData.append('salaries[0][deduction]', item.salary.deduction);
 }

   if(item.salary.bonus){
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


    if(this.selectedEmployeeId != 'all'){
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
    }else{

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


  saveAll(){

let counter = 0;

 const formData = new FormData();

this.salariesData.forEach((item :any) => {

  if(!item.salary.is_salary &&  !item.salary.has_future_days){

 const selectedMonth = this.selectedMonth;
const firstDay = new Date(`${selectedMonth}-01`);
const formattedFirstDay = firstDay.toISOString().split('T')[0];

 formData.append('salaries['+counter.toString()+'][date]', formattedFirstDay);
const total_salary = item.salary.base_salary + (item.bonus | 0) + (item.salary.bonus | 0) - (item.salary.deduction | 0) - (item.deduction |0);
 formData.append('salaries['+counter.toString()+'][employee_id]', item.employee.id);
 formData.append('salaries['+counter.toString()+'][base_salary]', item.salary.base_salary);
 formData.append('salaries['+counter.toString()+'][net_salary]', total_salary.toString() || '0');
 formData.append('salaries['+counter.toString()+'][date]', formattedFirstDay);

 if(item.reason){
 formData.append('salaries['+counter.toString()+'][note]', item.reason);
 }
  if(item.bonus){
 formData.append('salaries['+counter.toString()+'][additional_bonus]', item.bonus);
 }
  if(item.deduction){
 formData.append('salaries['+counter.toString()+'][additional_deduction]', item.deduction);
 }
  if(item.salary.deduction){
 formData.append('salaries['+counter.toString()+'][deduction]', item.salary.deduction);
 }

   if(item.salary.bonus){
 formData.append('salaries['+counter.toString()+'][bonus]', item.salary.bonus);
 } 
 counter ++;
  }
  console.log(counter)
});



if(counter > 0){

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

  showDetails(item:any){
        this.selectedEmployeeId = item.employee.id;
        this.loadSalariesData();

  }

  getSelectedEmployeeName(): string {
    if (!this.selectedEmployeeId) return '';
    const employee = this.employees.find(e => e.id === this.selectedEmployeeId);
    return employee?.account?.name || '';
  }
}


