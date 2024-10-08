import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelResultsComponent } from './model-results.component';

describe('ModelResultsComponent', () => {
  let component: ModelResultsComponent;
  let fixture: ComponentFixture<ModelResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
