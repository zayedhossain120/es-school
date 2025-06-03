import { Role } from 'generated/prisma';

export interface UserPayload {
  sub?: string;
  id?: string;
  email: string;
  full_name: string;
  role: Role;
}
