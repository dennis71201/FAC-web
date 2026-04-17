import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Tag, Space, Typography, Breadcrumb } from 'antd';
import {
  UserOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { buildMenuItems, breadcrumbMap } from '../config/routes';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = buildMenuItems();

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const openKeys = currentPath === '/employees' ? ['system'] : [];

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
            <Text strong>王小明</Text>
            <Tag color="blue">管理者</Tag>
          </Space>
        </Header>
        <Content className="content-area">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
