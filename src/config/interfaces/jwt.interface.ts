export interface IJwtToken {
  secret: string;
  time: number;
}

export interface IJwt {
  access: IJwtToken;
  emailConfirmation: IJwtToken;
  resetPassword: IJwtToken;
  refresh: IJwtToken;
}
