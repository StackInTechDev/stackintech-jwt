export interface IJwtToken {
  secret: string;
  time: number;
}

export interface IJwt {
  access: IJwtToken;
  confirmation: IJwtToken;
  resetPassword: IJwtToken;
  refresh: IJwtToken;
}
