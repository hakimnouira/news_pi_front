import { Routes } from '@angular/router';
import { Main } from './components/main/main';
import { Signup } from './components/signup/signup';
import { Signin } from './components/signin/signin';
import { Antiprop } from './components/antiprop/antiprop';
import { GeoRagGame } from './components/geo-rag-game/geo-rag-game';
import { Home } from './components/home/home';
import { TranslationComponent } from './components/translation/translation';
import { PostListComponent } from './components/posts/post-list/post-list';
import { PostFormComponent } from './components/posts/post-form/post-form';
import { PostDetailComponent } from './components/posts/post-detail/post-detail';
import { NewsCheck } from './components/news-check/news-check';

export const routes: Routes = [
    {
    path: '',
    component: Main,
    children: [
      { path: '', component: Home },
      { path: 'isitpropaganda', component: Antiprop },
      { path: 'geo-rag-game', component: GeoRagGame },
      { path: 'posts', component: PostListComponent },
      { path: 'posts/new', component: PostFormComponent },
      { path: 'posts/:id', component: PostDetailComponent },
      { path: 'posts/:id/edit', component: PostFormComponent },
      { path: 'news-check', component: NewsCheck },
    ],
  },
  { path: 'signup', component: Signup },
  { path: 'signin', component: Signin },
  { path: 'articles', component: TranslationComponent },
  { path: '**', redirectTo: '' },
];
