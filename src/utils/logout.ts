import { toast } from "react-toastify"

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("role")
  toast.info("คุณได้ออกจากระบบแล้ว")
  window.location.href = "/login"
}