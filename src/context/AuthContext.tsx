// AuthContext.jsx
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { createContext, useCallback, useEffect, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import dbApi from "../utils/firebaseService";
import { AuthContextType, User, AuthUser } from "../types";

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  isLogin: false,
  loading: false,
  user: null,
  authUser: null,
  Login: () => {},
  LoginWithEmail: () => {},
  Logout: () => {},
  userExists: undefined,
});

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        console.log("User logged in:", authUser.uid);
        const dbUser = await dbApi.getUser(authUser.uid);
        console.log("Database user:", dbUser);
        if (!dbUser) {
          // setAuthUser(authUser as AuthUser); // Set authUser if user is not in the database
          setAuthUser(authUser as AuthUser);
          setUser(null);
          // setUser("authUser"); //如果使用者不在資料庫中，則先設定為字串，再userInfo中等待使用者填入資料再創建為user
        } else {
          setUser(dbUser as User);
          setAuthUser(authUser);
          console.log("User state after setting:", dbUser);
        }
      } else {
        setUser(null);
        setAuthUser(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const { data: userExists } = useQuery({
    queryKey: ["userExists", (user as User)?.uid],
    queryFn: () => {
      if (!user) {
        return Promise.resolve(false);
      }
      return dbApi.checkUserExists((user as User)?.uid as string);
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
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error during Google login:", errorCode, errorMessage);
        navigate("/error", { state: { errorMessage } });
      });
  }, [navigate, queryClient]);

  const LoginWithEmail = useCallback(
    (email: string, password: string) => {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["auth"] });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error("Error during email login:", errorCode, errorMessage);
          navigate("/error", { state: { errorMessage } });
        });
    },
    [navigate, queryClient]
  );

  return (
    //@ts-expect-error(123)
    <AuthContext.Provider value={{ isLogin, loading, user, authUser, userExists, Login, LoginWithEmail, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};
