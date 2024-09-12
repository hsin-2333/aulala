import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { FirebaseAppProvider } from "reactfire";
// import firebaseConfig from "../firebaseConfig";

import HomePage from "./pages/Home";
import Account from "./pages/Account";
import LoginComponent from "./pages/Login";
const queryClient = new QueryClient();

function App() {
  return (
    // <FirebaseAppProvider firebaseConfig={firebaseConfig}>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:audioID" element={<HomePage />} />
            <Route path="/:scriptID" element={<HomePage />} />
            <Route
              element={
                <PrivateRoute>
                  <Routes>
                    <Route path="/account" element={<Account />} />
                    <Route
                      path="/:account/notifications"
                      element={<Account />}
                    />
                    <Route path="/:account/scripts" element={<Account />} />
                    <Route path="/:account/audios" element={<Account />} />
                    <Route path="/:account/setting" element={<Account />} />
                  </Routes>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<LoginComponent />} />
          </Routes>
        </AuthContextProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>

    // </FirebaseAppProvider>
  );
}

export default App;
