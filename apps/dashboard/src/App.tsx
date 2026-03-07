import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"
import { ProjectsProvider } from "./context/ProjectsContext"
import Login from "./pages/Login"
import NewProject from "./pages/NewProject"
import ProjectFlags from "./pages/ProjectFlags"
import Projects from "./pages/Projects"
import ProjectSettings from "./pages/ProjectSettings"
import Signup from "./pages/Signup"
import Users from "./pages/Users"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProjectsProvider>
                  <Layout />
                </ProjectsProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Projects />} />
            <Route path="users" element={<Users />} />
            <Route path="projects/new" element={<NewProject />} />
            <Route path="projects/:projectId" element={<ProjectFlags />} />
            <Route path="projects/:projectId/settings" element={<ProjectSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
