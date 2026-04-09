import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      isBlocked: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role?: Role;
    isBlocked?: boolean;
    lastLoginAt?: Date | null;
  }
}
