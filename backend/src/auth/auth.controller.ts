import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, AuthResponseDto, TokenResponseDto, UserResponseDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDto): Promise<TokenResponseDto> {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @CurrentUser('id') userId: string,
  ): Promise<UserResponseDto> {
    return this.authService.getProfile(userId);
  }
}
