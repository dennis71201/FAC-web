import EquipmentTracking from '../pages/EquipmentTracking';
import AlarmMonitor from '../pages/AlarmMonitor';
import AttendanceRecord from '../pages/AttendanceRecord';
import Passdown from '../pages/Passdown';
import EmployeeManagement from '../pages/EmployeeManagement';

import {
  ToolOutlined,
  AlertOutlined,
  CalendarOutlined,
  SwapOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';

/**
 * Route configuration — single source of truth for routing + navigation.
 *
 * Adding a new feature:
 *   1. Create the page component in src/pages/
 *   2. Append one entry to this array
 *   3. Done — App.jsx and MainLayout.jsx pick it up automatically
 *
 * Fields:
 *   path       — URL path (without leading slash for React Router, with leading slash for menu keys)
 *   label      — Display name in sidebar menu and breadcrumb
 *   icon       — Ant Design icon component
 *   component  — Page component
 *   group      — (optional) Group key for submenu grouping
 *   groupLabel — (optional) Display name of the submenu group
 *   groupIcon  — (optional) Icon for the submenu group
 */
const routes = [
  {
    path: 'equipment',
    label: 'Equipment Tracking',
    icon: ToolOutlined,
    component: EquipmentTracking,
  },
  {
    path: 'alarm',
    label: 'Alarm',
    icon: AlertOutlined,
    component: AlarmMonitor,
  },
  {
    path: 'attendance',
    label: 'Attendance Record',
    icon: CalendarOutlined,
    component: AttendanceRecord,
  },
  {
    path: 'passdown',
    label: 'Passdown',
    icon: SwapOutlined,
    component: Passdown,
  },
  {
    path: 'employees',
    label: '員工表管理',
    icon: TeamOutlined,
    component: EmployeeManagement,
    group: 'system',
    groupLabel: '系統管理',
    groupIcon: SettingOutlined,
  },
];

/** Derive breadcrumb map: { '/equipment': 'Equipment Tracking', ... } */
export const breadcrumbMap = Object.fromEntries(
  routes.map((r) => [`/${r.path}`, r.label])
);

/** Derive Ant Design menu items from routes config */
export function buildMenuItems() {
  const topLevel = [];
  const groups = {};

  for (const route of routes) {
    const menuItem = {
      key: `/${route.path}`,
      icon: <route.icon />,
      label: route.label,
    };

    if (route.group) {
      if (!groups[route.group]) {
        groups[route.group] = {
          key: route.group,
          icon: <route.groupIcon />,
          label: route.groupLabel,
          children: [],
        };
        // Insert divider before the first group
        topLevel.push({ type: 'divider' });
        topLevel.push(groups[route.group]);
      }
      groups[route.group].children.push(menuItem);
    } else {
      topLevel.push(menuItem);
    }
  }

  return topLevel;
}

export default routes;
