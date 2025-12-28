import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginEmailSenhaService } from 'src/infra/auth/services/login-email-senha.service';
import { LoginEmailSenhaDto } from './login-email-senha.dto';
import { Public } from 'src/infra/auth/decorators/public.decorator';
import * as express from 'express';
import { CustomError } from 'src/utils/custom-error';

@Controller({ path: 'v1/login-email-senha' })
export class LoginEmailSenhaController {
  constructor(
    private readonly _loginEmailSenhaService: LoginEmailSenhaService,
  ) {}

  @Public()
  @Post()
  login(@Body() login: LoginEmailSenhaDto, @Res() res: express.Response) {
    this._loginEmailSenhaService
      .validar({
        email: login.email,
        senha: login.senha,
      })
      .subscribe({
        error: (err: CustomError) =>
          res.status(err.code).send({ error: err.message }),
        next: (token) => res.status(200).send({ token }),
      });
  }
}
