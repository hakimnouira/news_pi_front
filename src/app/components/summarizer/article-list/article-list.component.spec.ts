import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleListComponent } from './article-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('ArticleListComponent', () => {
  let component: ArticleListComponent;
  let fixture: ComponentFixture<ArticleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArticleListComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentMethod()).toBe('hybrid');
    expect(component.searchQuery()).toBe('');
    expect(component.loading()).toBe(false);
  });

  it('should truncate text correctly', () => {
    const longText = 'This is a very long text that needs to be truncated';
    const truncated = component.truncateText(longText, 20);
    expect(truncated).toBe('This is a very long ...');
  });

  it('should not truncate short text', () => {
    const shortText = 'Short text';
    const result = component.truncateText(shortText, 20);
    expect(result).toBe('Short text');
  });
});