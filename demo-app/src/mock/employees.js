export const sectionsData = {
  Building: ['EI', 'MECH', 'FIRE', 'I&C'],
  Process: ['WTS'],
  Project: ['GCS', 'Shift', 'Maint', 'TI'],
};

export const departmentOptions = Object.keys(sectionsData);

export const roleOptions = [
  { label: '一般使用者', value: 'user' },
  { label: '管理者', value: 'admin' },
];

export const employees = [
  { key: '1', employeeId: 'FAC-001', name: '王小明', department: 'Building', section: 'EI', role: 'admin', isActive: true, createdAt: '2024-06-01' },
  { key: '2', employeeId: 'FAC-002', name: '李大華', department: 'Process', section: 'WTS', role: 'user', isActive: true, createdAt: '2024-06-01' },
  { key: '3', employeeId: 'FAC-003', name: '陳志偉', department: 'Building', section: 'MECH', role: 'user', isActive: true, createdAt: '2024-06-15' },
  { key: '4', employeeId: 'FAC-004', name: '林美玲', department: 'Building', section: 'EI', role: 'admin', isActive: true, createdAt: '2024-07-01' },
  { key: '5', employeeId: 'FAC-005', name: '張建國', department: 'Project', section: 'GCS', role: 'user', isActive: true, createdAt: '2024-07-10' },
  { key: '6', employeeId: 'FAC-006', name: '黃俊傑', department: 'Project', section: 'Maint', role: 'user', isActive: true, createdAt: '2024-08-01' },
  { key: '7', employeeId: 'FAC-007', name: '吳淑芬', department: 'Process', section: 'WTS', role: 'user', isActive: true, createdAt: '2024-08-15' },
  { key: '8', employeeId: 'FAC-008', name: '趙文龍', department: 'Building', section: 'FIRE', role: 'user', isActive: true, createdAt: '2024-09-01' },
  { key: '9', employeeId: 'FAC-009', name: '周雅琪', department: 'Building', section: 'I&C', role: 'user', isActive: true, createdAt: '2024-09-10' },
  { key: '10', employeeId: 'FAC-010', name: '鄭國輝', department: 'Project', section: 'GCS', role: 'user', isActive: false, createdAt: '2024-06-01' },
  { key: '11', employeeId: 'FAC-011', name: '許家豪', department: 'Project', section: 'Shift', role: 'user', isActive: true, createdAt: '2024-10-01' },
  { key: '12', employeeId: 'FAC-012', name: '蔡怡君', department: 'Process', section: 'WTS', role: 'admin', isActive: true, createdAt: '2024-10-15' },
  { key: '13', employeeId: 'FAC-013', name: '楊世昌', department: 'Building', section: 'MECH', role: 'user', isActive: true, createdAt: '2024-11-01' },
  { key: '14', employeeId: 'FAC-014', name: '劉佩琪', department: 'Building', section: 'EI', role: 'user', isActive: false, createdAt: '2024-07-01' },
  { key: '15', employeeId: 'FAC-015', name: '洪振宇', department: 'Project', section: 'TI', role: 'user', isActive: true, createdAt: '2024-12-01' },
];
