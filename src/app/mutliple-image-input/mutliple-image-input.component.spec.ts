import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MutlipleImageInputComponent } from './mutliple-image-input.component';

describe('MutlipleImageInputComponent', () => {
  let component: MutlipleImageInputComponent;
  let fixture: ComponentFixture<MutlipleImageInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MutlipleImageInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MutlipleImageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
