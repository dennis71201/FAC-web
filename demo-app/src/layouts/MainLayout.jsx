import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Tag, Space, Typography, Breadcrumb, Button } from 'antd';
import {
  UserOutlined,
  AppstoreOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { buildMenuItems, breadcrumbMap } from '../config/routes';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = buildMenuItems();

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentPath = location.pathname;
  const openKeys = currentPath === '/employees' ? ['system'] : [];

  const roleLabel = user?.role === 'Administrator' ? '管理者' : '一般使用者';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{ background: '#1e293b' }}
        theme="dark"
      >
        <div className={`sider-logo ${collapsed ? 'collapsed' : ''}`}>
          <AppstoreOutlined className="logo-icon" />
          {!collapsed && <span className="logo-text">廠務管理平台</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#1e293b', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Breadcrumb
            items={[
              { title: '首頁' },
              { title: breadcrumbMap[currentPath] || '' },
            ]}
          />
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#64748B' }} />
            <Text strong>{user?.name || '未登入使用者'}</Text>
            <Tag color={user?.role === 'Administrator' ? 'blue' : 'default'}>{roleLabel}</Tag>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              aria-label="登出"
            >
              登出
            </Button>
          </Space>
        </Header>
        <Content className="content-area">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
