import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBankComponent } from './manage-bank.component';

describe('ManageBankComponent', () => {
  let component: ManageBankComponent;
  let fixture: ComponentFixture<ManageBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
