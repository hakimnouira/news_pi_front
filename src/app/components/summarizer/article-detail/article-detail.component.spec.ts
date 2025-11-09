import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleDetailComponent } from './article-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArticleDetailComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => 'test-article-id'
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading()).toBe(true);
    expect(component.error()).toBeNull();
    expect(component.generatingXAI()).toBe(false);
  });

  it('should calculate word count correctly', () => {
    const text = 'This is a test sentence with seven words';
    const count = component.getWordCount(text);
    expect(count).toBe(8);
  });

  it('should return empty array for objectKeys with null', () => {
    const keys = component.objectKeys(null);
    expect(keys).toEqual([]);
  });

  it('should return object keys correctly', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const keys = component.objectKeys(obj);
    expect(keys).toEqual(['key1', 'key2']);
  });

  it('should return object entries correctly', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const entries = component.objectEntries(obj);
    expect(entries).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' }
    ]);
  });
});