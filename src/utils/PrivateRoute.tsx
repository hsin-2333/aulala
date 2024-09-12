import { ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isLogin, loading } = useContext(AuthContext);

  if (loading) {
    return <div> Loading</div>;
  }
  return isLogin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
