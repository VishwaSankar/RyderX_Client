import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import AgentRoute from "./AgentRoute"; // ✅
import { AuthProvider } from "../context/AuthContext";
import Vehicles from "../pages/Vehicles";
import Profile from "../pages/Profile";
import BookingPage from "../pages/BookingPage";
import ManageBookings from "../pages/ManageBookings";
import AdminDashboard from "../pages/AdminDashboard";
import AgentDashboard from "../pages/AgentDashboard";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentCancel from "../pages/PaymentCancel";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";

const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/manage" element={<ManageBookings />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />




          {/*Admin only */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/*Agent only */}
          <Route
            path="/agent-dashboard"
            element={
              <AgentRoute>
                <AgentDashboard />
              </AgentRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;
