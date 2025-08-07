export interface RegisterUserData {
  institutionName: string;
  email: string;
  password: string;
  address: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    institutionName: string;
  };
}
