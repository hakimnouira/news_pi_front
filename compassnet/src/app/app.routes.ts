import { Routes } from '@angular/router';
import { Main } from './components/main/main';
import { Signup } from './components/signup/signup';
import { Signin } from './components/signin/signin';
import { Antiprop } from './components/antiprop/antiprop';
import { Home } from './components/home/home';

export const routes: Routes = [
    {
    path: '',  // Top-level: main screen
    component: Main,
    children: [
      { path: '', component: Home },
      { path: 'isitpropaganda', component: Antiprop }
    ],
  },
  { path: 'signup', component: Signup },  // Top-level: /signup
  { path: 'signin', component: Signin },  // Top-level: /signin
  { path: '**', redirectTo: '' },  // Wildcard redirect to home
];
