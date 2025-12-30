export type JwtToken = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresIn: Date;
  expiresIn: Date;
  roles: string[];
  name: string;
  email: string;
};
