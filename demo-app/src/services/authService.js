import apiClient from './apiClient';

export async function identify(employeeNumber) {
  const response = await apiClient.post('/api/auth/identify', { employeeNumber });
  return response.data;
}

export async function register(payload) {
  const response = await apiClient.post('/api/auth/register', payload);
  return response.data;
}

export async function getEmployeeSections() {
  const response = await apiClient.get('/api/employee-sections');
  return (response.data?.data || []).map((item) => ({
    id: item.EmployeeSectionId,
    sectionName: item.SectionName,
    systemName: item.SystemName,
    label: `${item.SectionName} / ${item.SystemName}`,
  }));
}
