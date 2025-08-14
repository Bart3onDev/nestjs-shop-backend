import { Injectable, UnauthorizedException } from '@nestjs/common';
import ms from 'ms';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const expires = new Date();

    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(this.configService.get<string>('JWT_EXPIRATION')),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      secure: true, //Makes sure the cookie will be transmitted only to secure encrypted connections running on HTTPS protocol
      httpOnly: true, //Makes javascript unable to access the cookie it is accessable only from coming Request which are only available on the server
      expires: expires,
    });

    return { tokenPayload };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user: User = await this.usersService.getUser({ email });

      if (!user) throw new Error();

      const authenticated = await bcrypt.compare(password, user.password);

      if (!authenticated) throw new UnauthorizedException();

      return user;
    } catch {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  verifyToken(jwt: string) {
    this.jwtService.verify(jwt);
  }
}
