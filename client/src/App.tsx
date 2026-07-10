import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MemberShell } from "./components/MemberShell";
import { AdminShell } from "./components/AdminShell";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ActivitySelect } from "./pages/ActivitySelect";
import { ActivityCalendar } from "./pages/ActivityCalendar";
import { MyBookings } from "./pages/MyBookings";
import { Kiosk } from "./pages/Kiosk";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminSchedules } from "./pages/admin/AdminSchedules";
import { AdminMembers } from "./pages/admin/AdminMembers";
import { AdminAttendance } from "./pages/admin/AdminAttendance";
import { AdminAnnouncements } from "./pages/admin/AdminAnnouncements";
import { AdminAdmins } from "./pages/admin/AdminAdmins";

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin" : "/reservar"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/kiosco" element={<Kiosk />} />

      <Route
        element={
          <ProtectedRoute role="SOCIO">
            <MemberShell />
          </ProtectedRoute>
        }
      >
        <Route path="/reservar" element={<ActivitySelect />} />
        <Route path="/reservar/:activityId" element={<ActivityCalendar />} />
        <Route path="/mis-reservas" element={<MyBookings />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="horarios" element={<AdminSchedules />} />
        <Route path="socios" element={<AdminMembers />} />
        <Route path="asistencia" element={<AdminAttendance />} />
        <Route path="novedades" element={<AdminAnnouncements />} />
        <Route path="administradores" element={<AdminAdmins />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
