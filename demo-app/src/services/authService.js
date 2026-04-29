import apiClient from './apiClient';

export async function identify(employeeNumber) {
  const response = await apiClient.post('/api/auth/identify', { employeeNumber });
  return response.data;
}

export async function register(payload) {
  const response = await apiClient.post('/api/auth/register', payload);
  return response.data;
}

export async function getDepartmentSections() {
  const response = await apiClient.get('/api/departments-sections');
  return (response.data?.data || []).map((item) => ({
    id: item.DepartmentAndSectionId,
    departmentName: item.DepartmentName,
    sectionName: item.SectionName,
    label: `${item.DepartmentName} / ${item.SectionName}`,
  }));
}
