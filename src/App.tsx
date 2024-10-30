import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import PrivateRoute from "./components/Common/PrivateRoute";
import { AuthContextProvider } from "./context/AuthContext";
import { RecentPlayProvider } from "./context/RecentPlayContext";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
  Layout,
  OuterLayout,
  ScriptLayout,
  UserHomeLayout,
} from "./components/Common/Layout";
import Account from "./pages/Account";
import HomePage from "./pages/Home";
import LoginComponent from "./pages/Login";
import Notifications from "./pages/Notification";
import ScriptContent from "./pages/Script/index";
import SearchResultsPage from "./pages/SearchResult/index";
import StoryContent from "./pages/Story/index";
import StoryTable from "./pages/UploadedContent/Uploads";
import UploadScript from "./pages/UploadScript/UploadScript";
import UploadStory from "./pages/UploadStory/UploadStory";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthContextProvider>
          <RecentPlayProvider>
            <Routes>
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
                path="/account/:userName/uploads"
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
