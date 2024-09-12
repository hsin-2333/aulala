// AuthContext.jsx
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { createContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isLogin: boolean;
  loading: boolean;
  user: any;
  Login: () => void;
  Logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLogin: false,
  loading: false,
  user: {},
  Login: () => {},
  Logout: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: ["auth"],
    queryFn: () =>
      new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          resolve(user);
        });
        return () => unsubscribe();
      }),
    initialData: null,
  });

  const isLogin = !!user;

  const Logout = useCallback(() => {
    signOut(auth)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        console.log("Logout successful");
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        const errorMessage = error.message || "Something went wrong";
        navigate("/error", { state: { errorMessage } });
      });
  }, [navigate, queryClient]);

  const Login = useCallback(() => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error during Google login:", errorCode, errorMessage);
        navigate("/error", { state: { errorMessage } });
      });
  }, [navigate, queryClient]);

  return (
    <AuthContext.Provider value={{ isLogin, loading, user, Login, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};
