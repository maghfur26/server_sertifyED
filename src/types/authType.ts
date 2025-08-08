export interface RegisterUserData {
  fullname: string;
  email: string;
  password: string;
  address: string;
}

export interface RegisterInstitutionData {
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
}
