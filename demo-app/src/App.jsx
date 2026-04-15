import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import EquipmentTracking from './pages/EquipmentTracking';
import AlarmMonitor from './pages/AlarmMonitor';
import AttendanceSheet from './pages/AttendanceSheet';
import Passdown from './pages/Passdown';
import EmployeeManagement from './pages/EmployeeManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/equipment" replace />} />
        <Route path="equipment" element={<EquipmentTracking />} />
        <Route path="alarm" element={<AlarmMonitor />} />
        <Route path="attendance" element={<AttendanceSheet />} />
        <Route path="passdown" element={<Passdown />} />
        <Route path="employees" element={<EmployeeManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
