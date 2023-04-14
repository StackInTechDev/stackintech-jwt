import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  login() {
    return 'im loged in';
  }
  @Post('register')
  register() {
    return 'im regestred ';
  }
}
