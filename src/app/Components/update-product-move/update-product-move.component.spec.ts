import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProductMoveComponent } from './update-product-move.component';

describe('UpdateProductMoveComponent', () => {
  let component: UpdateProductMoveComponent;
  let fixture: ComponentFixture<UpdateProductMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateProductMoveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateProductMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
