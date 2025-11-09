import { Routes } from '@angular/router';
import { Main } from './components/main/main';
import { Signup } from './components/signup/signup';
import { Signin } from './components/signin/signin';
import { Antiprop } from './components/antiprop/antiprop';
import { GeoRagGame } from './components/geo-rag-game/geo-rag-game';
import { Home } from './components/home/home';
import { NewsCheck } from './components/news-check/news-check';

export const routes: Routes = [
    {
    path: '',  // Top-level: main screen
    component: Main,
    children: [
      { path: '', component: Home },
      { path: 'isitpropaganda', component: Antiprop },
      { path: 'geo-rag-game', component: GeoRagGame },
      { path: 'news-check', component: NewsCheck },
    ],
  },
  { path: 'signup', component: Signup },  // Top-level: /signup
  { path: 'signin', component: Signin },  // Top-level: /signin
  { path: '**', redirectTo: '' },  // Wildcard redirect to home
];
