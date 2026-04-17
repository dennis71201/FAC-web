import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import routes from './config/routes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/equipment" replace />} />
        {routes.map((r) => (
          <Route key={r.path} path={r.path} element={<r.component />} />
        ))}
      </Route>
    </Routes>
  );
}

export default App;
