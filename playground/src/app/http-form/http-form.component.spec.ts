import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HttpFormComponent } from './http-form.component';

describe('HttpFormComponent', () => {
  let component: HttpFormComponent;
  let fixture: ComponentFixture<HttpFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HttpFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
