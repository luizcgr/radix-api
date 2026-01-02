import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  accessToken: string;
  @IsNotEmpty()
  refreshToken: string;
}
