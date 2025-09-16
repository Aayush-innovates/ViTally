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
import DonorProfile from "./Pages/DonorProfile";
import DonorRespond from "./Pages/DonorRespond";
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
              <PrivateRoute allowedTypes={["doctor"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedTypes={["donor"]}>
                <DonorProfile />
              </PrivateRoute>
            }
          />
          <Route path="/donor/respond/:requestId" element={<DonorRespond />} />
           
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
