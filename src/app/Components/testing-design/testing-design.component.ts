import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  
@Component({
  selector: 'app-testing-design',
  standalone: true,
  imports: [ 
    FormsModule ,CommonModule],
  templateUrl: './testing-design.component.html',
  styleUrl: './testing-design.component.css'
})
export class TestingDesignComponent {

  rowData = [
    { id: 1, product: 'Laptop', quantity: 10, price: 1000 },
    { id: 2, product: 'Mouse', quantity: 50, price: 25 },
    { id: 3, product: 'Keyboard', quantity: 30, price: 50 }
  ];

  addRow() {
    this.rowData.push({ id: this.rowData.length + 1, product: '', quantity: 0, price: 0 });
  }

  removeRow(index: number) {
    this.rowData.splice(index, 1);
  }

  saveData() {
    console.log('Saved Data:', this.rowData);
  }
}
