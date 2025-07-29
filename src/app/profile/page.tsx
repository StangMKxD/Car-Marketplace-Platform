"use client"

import { profileUser } from "@/api/car"
import ProfileList from "@/components/ProfileList"
import { Usertype } from "@/types"
import { useEffect, useState } from "react"

const Page = () => {

  const [user, setUser] = useState<Usertype | null>(null) 
  
  const loadData = async () => {
    try {
      const res = await profileUser()
      setUser(res.user)  // สมมติ API ตอบ { user: Usertype[] }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <>
    <div>
    {user ? (
      <ProfileList item={user} loadData={loadData} />
    ) : (
      <p className="text-center mt-10 text-xl">กำลังโหลดข้อมูล...</p>
    )}
  </div>
    </>
  )
}

export default Page
