import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }       from '../context/AuthContext';
import Login             from '../pages/auth/Login';
import Register          from '../pages/auth/Register';
import Dashboard         from '../pages/dashboard/Dashboard';
import Attendance        from '../pages/attendance/Attendance';
import Reports           from '../pages/reports/Reports';
import ReportDetail      from '../pages/reports/ReportDetail';
import Loader            from '../components/Loader';

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (!['admin','superadmin'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/attendance" element={<Private><Attendance /></Private>} />
      <Route path="/reports"    element={<AdminOnly><Reports /></AdminOnly>} />
      <Route path="/reports/:userId" element={<AdminOnly><ReportDetail /></AdminOnly>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
