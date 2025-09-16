import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import Dashboard from "./Pages/Dashboard";
import PrivateRoute from "./Components/PrivateRoute";
import GuestRoute from "./Components/GuestRoute";
import PatientRequest from "./PatientRequest";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient-request"
            element={
              <PrivateRoute allowedTypes={["doctor"]}>
                <PatientRequest />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
