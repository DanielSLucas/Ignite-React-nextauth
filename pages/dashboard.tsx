import type { NextPage } from "next";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

const DashBoard: NextPage = () => {
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    api.get('/me').then(response => console.log(response.data))
  },[])

  return (
    <h1>Dashboard: {user?.email}</h1>
  )
}

export default DashBoard;