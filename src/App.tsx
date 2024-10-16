import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { RecentPlayProvider } from "./context/RecentPlayContext";
import PrivateRoute from "./utils/PrivateRoute";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import HomePage from "./pages/Home";
import Account from "./pages/Account";
import LoginComponent from "./pages/Login";
import StoryContent from "./pages/UserContent/Story";
import ScriptContent from "./pages/UserContent/Script";
import { Layout, OuterLayout, ScriptLayout, UserHomeLayout } from "./components/Layout";
import UploadScript from "./pages/Account/Upload/UploadScript";
import UploadStory from "./pages/Account/Upload/UploadStory";
import Notifications from "./pages/Account/Notification";
import StoryTable from "./pages/Account/UploadsContent/Uploads";
import TestUI from "./components/testUI";
import SearchResultsPage from "./pages/SearchResultsPage";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthContextProvider>
          <RecentPlayProvider>
            <Routes>
              <Route
                path="/testUI"
                element={
                  <>
                    <TestUI />
                  </>
                }
              />
              <Route
                path="/"
                element={
                  <OuterLayout>
                    <HomePage />
                  </OuterLayout>
                }
              />
              <Route
                path="/search"
                element={
                  <ScriptLayout>
                    <SearchResultsPage />
                  </ScriptLayout>
                }
              />
              <Route
                path="/story/:storyId"
                element={
                  <OuterLayout>
                    <StoryContent />
                  </OuterLayout>
                }
              />
              <Route
                path="/script/:scriptId"
                element={
                  <ScriptLayout>
                    <ScriptContent />
                  </ScriptLayout>
                }
              />
              <Route
                path="/user/:userName"
                element={
                  <UserHomeLayout>
                    <Account />
                  </UserHomeLayout>
                }
              />
              <Route
                path="/user/:userName/uploads"
                element={
                  <Layout>
                    <StoryTable />
                  </Layout>
                }
              />
              <Route path="/login" element={<LoginComponent />} />
              <Route
                path="/account/:userName"
                element={
                  <Layout>
                    <Account />
                  </Layout>
                }
              />
              <Route
                path="/account/:userName/notification"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Notifications />
                    </Layout>
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
                path="/upload/script"
                element={
                  <PrivateRoute>
                    <Layout>
                      <UploadScript />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/upload/story"
                element={
                  <PrivateRoute>
                    <Layout>
                      <UploadStory />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </RecentPlayProvider>
        </AuthContextProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
