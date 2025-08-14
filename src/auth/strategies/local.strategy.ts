import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  //Everything what we return here will be added to the request object so we have in each requerst then a user data
  async validate(email: string, password: string): Promise<User> {
    return await this.authService.verifyUser(email, password);
  }
}
