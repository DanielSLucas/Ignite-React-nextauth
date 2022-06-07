import type { NextPage } from "next";
import { useContext, useEffect } from "react";
import { Can } from "../components/Can";

import { AuthContext } from "../context/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

const DashBoard: NextPage = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get('/me')
      .then(response => console.log(response.data))
      .catch(err => console.log(err));
  },[])

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      
      <Can  permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

export default DashBoard;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me')    
  
  console.log(response);
  
  return {
    props: {}
  }
})