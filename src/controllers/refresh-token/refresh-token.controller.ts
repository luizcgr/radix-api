import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RefreshTokenService } from 'src/infra/auth/services/refresh-token.service';
import { CustomError } from 'src/utils/custom-error';
import { RefreshTokenDto } from './refresh-token.dto';
import { Public } from 'src/infra/auth/decorators/public.decorator';

@Controller({ path: 'v1/refresh-token' })
export class RefreshTokenController {
  constructor(private readonly _refreshTokenService: RefreshTokenService) {}

  @Public()
  @Post()
  refreshToken(@Body() refresh: RefreshTokenDto, @Res() res: Response) {
    this._refreshTokenService
      .refresh({
        accessToken: refresh.accessToken,
        refreshToken: refresh.refreshToken,
      })
      .subscribe({
        next: (token) => res.status(200).json({ token }),
        error: (error: CustomError) =>
          res.status(error.code).json({ message: error.message }),
      });
  }
}
