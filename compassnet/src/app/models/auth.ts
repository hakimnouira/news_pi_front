// src/app/models/auth.ts
// Interfaces based on your FastAPI schemas

export interface UserRegister {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
}

export interface UserOut {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  // roles: Role[]? (assuming array of role objects; adjust if needed)
  roles?: any[];  // Placeholder; define Role interface if using
}

export interface UserUpdate {
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;  // Or File/URL as needed
}