export interface IUser {
  _id: string;
  createdAt: string;
  role: string;
  status: string;
  emailVerified: boolean;
  email: string;
  fullName: string;
  image?: string;
  mobile: string;
  nationality: string;
  dob: string;
  gender: string;
  address: string;
}

export interface IProfileData {
  fullName?: string;
  email?: string;
  image?: string;
  mobile?: string;
  nationality?: string;
  dob?: string;
  gender?: string;
  address?: string;
}

export interface IGetAllUsersResponse {
  users: IUser[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface IGuestUser {
  fullName: string;
  email: string;
}
