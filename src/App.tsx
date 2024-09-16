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
import StoryContent from "./pages/UserContent/Story";
import Layout from "./components/Layout";
import UploadSection from "./pages/Account/Upload";
import MyContent from "./pages/Account/MyContent";

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
            <Route
              path="/story/:id"
              element={
                <Layout>
                  <StoryContent />
                </Layout>
              }
            />
            <Route
              path="/script/:scriptID"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/user/:userName"
              element={
                <Layout>
                  <Account />
                </Layout>
              }
            />
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
              path="/:account/stories"
              element={
                <PrivateRoute>
                  <Layout>
                    {" "}
                    <Account />
                  </Layout>
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
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <Layout>
                    {" "}
                    <UploadSection />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/account/:userName/contents"
              element={
                <PrivateRoute>
                  <Layout>
                    {" "}
                    <MyContent />
                  </Layout>
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
