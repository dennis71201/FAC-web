import apiClient from './apiClient';

function mapType(item) {
  return {
    id: Number(item.AttendanceTypeId),
    name: item.AttendanceTypeName,
    color: item.AttendanceTypeColor || '#64748B',
  };
}

function mapRecord(item) {
  return {
    id: Number(item.AttendanceRecordId),
    employeeId: Number(item.EmployeeId),
    employeeName: item.EmployeeName,
    employeeDepartment: item.EmployeeDepartment,
    employeeSection: item.EmployeeSection,
    attendanceTypeId: Number(item.AttendanceTypeId),
    attendanceTypeName: item.AttendanceTypeName,
    attendanceTypeColor: item.AttendanceTypeColor || '#64748B',
    startTime: item.StartTime,
    endTime: item.EndTime,
    note: item.Note || '',
    isAllDay: Boolean(item.IsAllDay),
    isAlive: Boolean(item.IsAlive),
  };
}

export async function getAttendanceTypes() {
  const response = await apiClient.get('/api/attendance/types');
  return (response.data?.data || []).map(mapType);
}

export async function getAttendanceRecords({ year, month, employeeId }) {
  const params = { year, month };
  if (employeeId) {
    params.employeeId = employeeId;
  }

  const response = await apiClient.get('/api/attendance/records', { params });
  return (response.data?.data || []).map(mapRecord);
}

export async function createAttendanceRecord(payload) {
  const response = await apiClient.post('/api/attendance/records', payload);
  return Number(response.data?.data?.attendanceRecordId);
}

export async function deleteAttendanceRecord(recordId) {
  const response = await apiClient.delete(`/api/attendance/records/${recordId}`);
  return response.data?.data || null;
}
