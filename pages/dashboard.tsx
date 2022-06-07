import type { NextPage } from "next";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const DashBoard: NextPage = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <h1>Dashboard: {user?.email}</h1>
  )
}

export default DashBoard;