import { Role } from 'generated/prisma';

export interface UserPayload {
  id?: string;
  email: string;
  full_name: string;
  role: Role;
}
