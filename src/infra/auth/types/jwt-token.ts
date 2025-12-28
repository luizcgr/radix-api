export type JwtToken = {
  accessToken: string;
  refreshToken: string;
  expiration: Date;
  validity: Date;
  roles: string[];
  name: string;
  email: string;
};
