// src/auth/responses/auth.response.ts
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    profileCompleteness: number;
    pawPoints?: number;
  };
  accessToken: string;
  message: string;
}

export interface MessageResponse {
  message: string;
}