import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Result, Spin } from 'antd';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ feature, children }) {
  const location = useLocation();
  const { authLoading, isAuthenticated, hasPermission } = useAuth();

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (feature && !hasPermission(feature)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="你目前沒有此功能的存取權限，請聯絡管理員。"
      />
    );
  }

  return children || <Outlet />;
}
