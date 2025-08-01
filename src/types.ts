export interface Cartype {
  id: number;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  price: number;
  transmission: string;
  images: { id: number; url: string; carId: number }[];
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

export type StatusType = "PENDING" | "APPROVED" | "REJECTED";

export type BookingAdminType = BookingType & {
  createdAt: string;
};

export type BookingType = {
  id: number;
  date: Date;
  status: StatusType;
  car: Cartype;
  user: Usertype;
};
