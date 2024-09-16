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
import StoryContent from "./pages/Content/Story";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

function App() {
  return (
    // <FirebaseAppProvider firebaseConfig={firebaseConfig}>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthContextProvider>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route path="/story" element={<StoryContent />} />
            <Route path="/script/:scriptID" element={<HomePage />} />
            <Route path="/user/:userName" element={<Account />} />
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/:account/notifications"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route
              path="/:account/scripts"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route
              path="/:account/audios"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route
              path="/:account/setting"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthContextProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>

    // </FirebaseAppProvider>
  );
}

export default App;
