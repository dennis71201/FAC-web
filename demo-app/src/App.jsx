import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import routes from './config/routes';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {routes.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <ProtectedRoute feature={r.label === 'Attendance Record' ? 'Attendance Record' : undefined}>
                  <r.component />
                </ProtectedRoute>
              }
            />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
