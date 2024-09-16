// AuthContext.jsx
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { createContext, useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import dbApi from "../utils/firebaseService";
import { AuthContextType, User } from "../types";

export const AuthContext = createContext<AuthContextType>({
  isLogin: false,
  loading: false,
  user: null,
  // userName: null,
  Login: () => {},
  Logout: () => {},
  userExists: undefined,
});

export const AuthContextProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // const [userName, setUserName] = useState<string | null>(null);
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ["auth"],
    queryFn: () =>
      new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          resolve(user as User | null);
        });
        return () => unsubscribe();
      }),
    initialData: null,
  });

  // useEffect(() => {
  //   if (user) {
  //     dbApi.getUserName(user.uid).then(setUserName);
  //   }
  // }, [user]);

  const { data: userExists } = useQuery({
    queryKey: ["userExists", user?.uid],
    queryFn: () => {
      if (!user) {
        return Promise.resolve(false);
      }
      return dbApi.checkUserExists(user.uid);
    },
    enabled: !!user,
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
    <AuthContext.Provider value={{ isLogin, loading, user, userExists, Login, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};
