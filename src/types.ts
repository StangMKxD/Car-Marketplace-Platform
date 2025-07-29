export interface Cartype {
  id: number;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  price: number;
  transmission: string;
  imageUrl: string;
  detail: string;
  type: string;
}

export type Usertype = {
  id: number
  name: string
  surname: string
  email: string
  password?: string
  phone: string
  role?: string
}

// export type UserProfileUpdate = {
//   name: string
//   surname: string
//   email: string
//   phone: string
//   password?: string
// }
