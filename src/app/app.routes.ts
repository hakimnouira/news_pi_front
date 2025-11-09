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
import { UserProfileComponent } from './components/profile/user-profile/user-profile';
import { UsersAdminComponent } from './components/admin/users-admin/users-admin';


import { ArticleListComponent } from './components/summarizer/article-list/article-list.component';
import { ArticleDetailComponent } from './components/summarizer/article-detail/article-detail.component';
import { DashboardComponent } from './components/summarizer/dashboard/dashboard.component';

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
      { path: 'profile', component: UserProfileComponent },
      { path: 'admin/users', component: UsersAdminComponent },
      
  
      { path: 'summarizer', component: ArticleListComponent },
      { path: 'summarizer/article/:id', component: ArticleDetailComponent },
      { path: 'summarizer/dashboard', component: DashboardComponent },
    ],
  },
  { path: 'signup', component: Signup },
  { path: 'signin', component: Signin },
  { path: 'articles', component: TranslationComponent },
  { path: '**', redirectTo: '' },
];