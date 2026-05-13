import apiClient from './apiClient';

function mapEmployee(item) {
  return {
    id: Number(item.EmployeeId),
    employeeId: Number(item.EmployeeId),
    employeeNumber: item.EmployeeNumber || '',
    name: item.EmployeeName || '',
    section: item.EmployeeSection || '',
    system: item.EmployeeSystem || '',
    isActive: true,
  };
}

export async function getEmployees() {
  const response = await apiClient.get('/api/employees');
  return (response.data?.data || []).map(mapEmployee);
}
