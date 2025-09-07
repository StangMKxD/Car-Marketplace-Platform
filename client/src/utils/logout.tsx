import { toast } from "react-toastify";

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("userId");
  toast.info("คุณได้ออกจากระบบแล้ว");
  window.location.href = "/login"
};
