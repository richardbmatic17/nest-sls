import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthsService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn({ username, password }): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(username);

    if (user?.password !== password) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user._id, username: user.name };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
