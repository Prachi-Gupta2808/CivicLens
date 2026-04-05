import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import CitizenDashboard from "./pages/CitizenDashboard";
import FixerDashboard from "./pages/FixerDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import Register from "./pages/Register";
import ReportIssue from "./pages/ReportIssue";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/report-issue"
              element={
                <ProtectedRoute>
                  <ReportIssue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen-dashboard"
              element={
                <ProtectedRoute>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fixer-dashboard"
              element={
                <ProtectedRoute>
                  <FixerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/map" element={<MapView />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
