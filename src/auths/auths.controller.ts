import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { SignInDto } from './dto/singIn.dto';
import { Public } from 'src/decorators/public.decorators';

@Controller('auth')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  create(@Body() signInDto: SignInDto) {
    return this.authsService.signIn(signInDto);
  }
}
