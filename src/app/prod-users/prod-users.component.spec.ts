import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdUsersComponent } from './prod-users.component';

describe('ProdUsersComponent', () => {
  let component: ProdUsersComponent;
  let fixture: ComponentFixture<ProdUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProdUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
