import { ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import loadingGif from "../../assets/loadingGif.gif";
import { AuthContext } from "../../context/AuthContext";
import { UserHomeLayout } from "./Layout";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isLogin, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <UserHomeLayout>
        <div className="flex h-fit items-center justify-center">
          <img src={loadingGif} width="400px" alt="Loading..." />
        </div>
      </UserHomeLayout>
    );
  }
  return isLogin ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
