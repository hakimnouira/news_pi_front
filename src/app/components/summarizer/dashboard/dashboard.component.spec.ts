import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading()).toBe(true);
    expect(component.triggeringBot()).toBe(false);
    expect(component.message()).toBeNull();
  });

  it('should return correct status class for active bot', () => {
    component.botStats.set({
      total_runs: 10,
      successful_articles: 8,
      failed_articles: 2,
      status: 'active'
    });
    
    const statusClass = component.getBotStatusClass();
    expect(statusClass).toBe('bg-green-600 text-white');
  });

  it('should return correct status class for inactive bot', () => {
    component.botStats.set({
      total_runs: 10,
      successful_articles: 8,
      failed_articles: 2,
      status: 'inactive'
    });
    
    const statusClass = component.getBotStatusClass();
    expect(statusClass).toBe('bg-red-600 text-white');
  });

  it('should return correct status text for active bot', () => {
    component.botStats.set({
      total_runs: 10,
      successful_articles: 8,
      failed_articles: 2,
      status: 'active'
    });
    
    const statusText = component.getBotStatusText();
    expect(statusText).toBe('ACTIVE');
  });

  it('should return correct status text for inactive bot', () => {
    component.botStats.set({
      total_runs: 10,
      successful_articles: 8,
      failed_articles: 2,
      status: 'inactive'
    });
    
    const statusText = component.getBotStatusText();
    expect(statusText).toBe('INACTIVE');
  });

  it('should show message correctly', (done) => {
    component.showMessage('Test message', 'success');
    
    expect(component.message()).toEqual({
      text: 'Test message',
      type: 'success'
    });

    // Verify message is cleared after 5 seconds
    setTimeout(() => {
      expect(component.message()).toBeNull();
      done();
    }, 5100);
  });
});