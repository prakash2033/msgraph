import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonProdUsersComponent } from './non-prod-users.component';

describe('NonProdUsersComponent', () => {
  let component: NonProdUsersComponent;
  let fixture: ComponentFixture<NonProdUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonProdUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NonProdUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
