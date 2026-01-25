import { Role } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}
