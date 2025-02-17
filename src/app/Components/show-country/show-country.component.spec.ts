import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCountryComponent } from './show-country.component';

describe('ShowCountryComponent', () => {
  let component: ShowCountryComponent;
  let fixture: ComponentFixture<ShowCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCountryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
