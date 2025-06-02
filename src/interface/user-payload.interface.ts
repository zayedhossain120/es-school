import { RoleGuard } from 'src/auth/guards/role.guard';

export interface UserPayload {
  id: string;
  email: string;
  full_name: string;
  role: RoleGuard;
}
