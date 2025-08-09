import axiosInstance from "./axiosInstance";

// login
export const loginForm = async (form: { email: string; password: string }) => { 
    const res = await axiosInstance.post("/login", form)
    return res.data
}
// register
export const registerUser = async (form: {
  name: string
  surname: string
  email: string
  password: string
  phone: string
}) => {
 
    const res = await axiosInstance.post("/register", form)
    return res.data

}