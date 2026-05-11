import apiClient from './apiClient';

export async function getHomePageLayout() {
  const response = await apiClient.get('/api/homepage');
  return response.data?.data;
}

export async function saveHomePageLayout(layout) {
  const response = await apiClient.put('/api/homepage', { layout });
  return response.data?.data;
}
