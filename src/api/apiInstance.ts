
export const getAuthHeader = () => {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No token found")
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  }
}

