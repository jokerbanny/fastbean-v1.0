export interface User {
  id: string;
  fName?: string | null;
  lName?: string | null;
  username: string;
  email: string;
  phone?: string | null;
  password: string;
  gender?: "male" | "female" | "other";
  age?: number;
  photo?: string | null;
  verified?: boolean;
  imagesURL?: string | null;
  roles: "admin" | "helper" | "seller" | "buyer";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Setting {
  userId: string;
  theme: "white" | "black";
  language: "lo" | "en";
}

export interface GetUserResponse {
  user: User;
  setting: Setting | null;
}

export interface Address {
  id?: string;
  district?: string;
  village: string;
  city: string;
  province: string;
  homeNo?: number;
  userId: string;
}

export interface DecodedToken {
  id: string;
}
