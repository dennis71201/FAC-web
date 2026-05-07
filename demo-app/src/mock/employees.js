export const sectionsData = {
  Building: ['CR', 'EXH', 'HVAC', 'PROCESS', 'EI', 'I&C', 'LSS'],
  Process: ['SHIFT', 'WTS', 'GC'],
  Project: ['TI', 'PROJECT', 'GENERAL AFFAIRS'],
};

export const departmentOptions = Object.keys(sectionsData);

export const roleOptions = [
  { label: '一般使用者', value: 'user' },
  { label: '管理者', value: 'admin' },
];

export const employees = [
  { key: '1',  employeeId: 'FAC-001', name: '王小明', section: 'Building', system: 'EI',             role: 'admin', isActive: true,  createdAt: '2024-06-01' },
  { key: '2',  employeeId: 'FAC-002', name: '李大華', section: 'Process',  system: 'WTS',            role: 'user',  isActive: true,  createdAt: '2024-06-01' },
  { key: '3',  employeeId: 'FAC-003', name: '陳志偉', section: 'Building', system: 'HVAC',           role: 'user',  isActive: true,  createdAt: '2024-06-15' },
  { key: '4',  employeeId: 'FAC-004', name: '林美玲', section: 'Building', system: 'EI',             role: 'admin', isActive: true,  createdAt: '2024-07-01' },
  { key: '5',  employeeId: 'FAC-005', name: '張建國', section: 'Process',  system: 'GC',             role: 'user',  isActive: true,  createdAt: '2024-07-10' },
  { key: '6',  employeeId: 'FAC-006', name: '黃俊傑', section: 'Project',  system: 'PROJECT',        role: 'user',  isActive: true,  createdAt: '2024-08-01' },
  { key: '7',  employeeId: 'FAC-007', name: '吳淑芬', section: 'Process',  system: 'WTS',            role: 'user',  isActive: true,  createdAt: '2024-08-15' },
  { key: '8',  employeeId: 'FAC-008', name: '趙文龍', section: 'Building', system: 'EXH',            role: 'user',  isActive: true,  createdAt: '2024-09-01' },
  { key: '9',  employeeId: 'FAC-009', name: '周雅琪', section: 'Building', system: 'I&C',            role: 'user',  isActive: true,  createdAt: '2024-09-10' },
  { key: '10', employeeId: 'FAC-010', name: '鄭國輝', section: 'Process',  system: 'GC',             role: 'user',  isActive: false, createdAt: '2024-06-01' },
  { key: '11', employeeId: 'FAC-011', name: '許家豪', section: 'Process',  system: 'SHIFT',          role: 'user',  isActive: true,  createdAt: '2024-10-01' },
  { key: '12', employeeId: 'FAC-012', name: '蔡怡君', section: 'Process',  system: 'WTS',            role: 'admin', isActive: true,  createdAt: '2024-10-15' },
  { key: '13', employeeId: 'FAC-013', name: '楊世昌', section: 'Building', system: 'HVAC',           role: 'user',  isActive: true,  createdAt: '2024-11-01' },
  { key: '14', employeeId: 'FAC-014', name: '劉佩琪', section: 'Building', system: 'EI',             role: 'user',  isActive: false, createdAt: '2024-07-01' },
  { key: '15', employeeId: 'FAC-015', name: '洪振宇', section: 'Project',  system: 'TI',             role: 'user',  isActive: true,  createdAt: '2024-12-01' },
];
