import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Avatar, Dropdown, theme, App as AntApp, Tag, Tooltip } from 'antd';
import {
  DashboardOutlined, UserOutlined, FileTextOutlined,
  FlagOutlined, SettingOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
  ShopOutlined, AppstoreOutlined, DollarOutlined,
  TeamOutlined, EditOutlined, SafetyOutlined
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import axios from 'axios';

import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users';
import ContentPage from './pages/Content';
import ReportsPage from './pages/Reports';
import ConfigPage from './pages/Config';
import SuppliersPage from './pages/Suppliers';
import ProductsPage from './pages/Products';
import FinancePage from './pages/Finance';
import ArticlesPage from './pages/Articles';
import UserDashboardPage from './pages/UserDashboard';

const { Header, Sider, Content } = Layout;

axios.defaults.baseURL = '/api';
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
axios.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { localStorage.removeItem('adminToken'); window.location.href = '/login'; }
  return Promise.reject(err);
});

// 角色标签配置
const ROLE_CONFIG = {
  admin:   { label: '超级管理员', color: '#f50' },
  finance: { label: '财务审计',   color: '#2db7f5' },
  editor:  { label: '内容编辑',   color: '#87d068' },
  service: { label: '客服专员',   color: '#108ee9' },
};

// 菜单配置（含角色可见权限）
const ALL_MENUS = [
  { key: '/',            icon: <DashboardOutlined />, label: '数据总览',    roles: ['admin','finance','editor','service'] },
  { key: '/userdash',    icon: <TeamOutlined />,      label: '用户注册库',  roles: ['admin','service'] },
  { key: '/users',       icon: <UserOutlined />,      label: '用户管理',    roles: ['admin','service'] },
  { key: '/suppliers',   icon: <ShopOutlined />,      label: '供应商管理',  roles: ['admin','finance','editor'] },
  { key: '/products',    icon: <AppstoreOutlined />,  label: '产品数据库',  roles: ['admin','finance','editor'] },
  { key: '/finance',     icon: <DollarOutlined />,    label: '财务管理',    roles: ['admin','finance'] },
  { key: '/articles',    icon: <EditOutlined />,      label: '文章管理',    roles: ['admin','editor','service'] },
  { key: '/content',     icon: <FileTextOutlined />,  label: '内容审核',    roles: ['admin','service'] },
  { key: '/reports',     icon: <FlagOutlined />,      label: '举报处理',    roles: ['admin','service'] },
  { key: '/config',      icon: <SettingOutlined />,   label: '系统配置',    roles: ['admin'] },
];

function getMenuItems(role) {
  return ALL_MENUS
    .filter(m => m.roles.includes(role))
    .map(m => ({
      key: m.key,
      icon: m.icon,
      label: <Link to={m.key}>{m.label}</Link>,
    }));
}

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
  const role = adminInfo.role || 'service';
  const roleConf = ROLE_CONFIG[role] || {};
  const menuItems = getMenuItems(role);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" width={200}
        style={{ background: '#0F0F1A', borderRight: '1px solid rgba(107,142,35,0.3)' }}>
        <div style={{ padding: collapsed ? '16px 8px' : '16px 16px', borderBottom: '1px solid rgba(107,142,35,0.2)', marginBottom: 8 }}>
          {collapsed ? <span style={{ fontSize: 22 }}>🦐</span> : (
            <div>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#6B8E23' }}>🦐 茶海虾王</div>
              <div style={{ fontSize: 10, color: '#FFD93D', marginTop: 2 }}>管理后台 v2.0</div>
            </div>
          )}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ background: 'transparent', borderRight: 'none' }} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <span style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Dropdown menu={{
            items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }]
          }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#6B8E23' }} icon={<UserOutlined />} />
              <span>{adminInfo.username || '管理员'}</span>
              <Tag color={roleConf.color} style={{ margin: 0 }}>{roleConf.label}</Tag>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, background: '#f5f5f5', borderRadius: 12, padding: 24, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

// 权限路由守卫：检查角色是否有该路由权限
function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('adminToken');
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(adminInfo.role)) {
    return <Navigate to="/" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{
      token: { colorPrimary: '#6B8E23', borderRadius: 8 },
      algorithm: theme.defaultAlgorithm,
    }}>
      <AntApp>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* 所有角色可访问 */}
          <Route path="/" element={<PrivateRoute allowedRoles={['admin','finance','editor','service']}><DashboardPage /></PrivateRoute>} />
          {/* 用户注册库：admin + service */}
          <Route path="/userdash" element={<PrivateRoute allowedRoles={['admin','service']}><UserDashboardPage /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute allowedRoles={['admin','service']}><UsersPage /></PrivateRoute>} />
          {/* 供应商：admin + finance + editor */}
          <Route path="/suppliers" element={<PrivateRoute allowedRoles={['admin','finance','editor']}><SuppliersPage /></PrivateRoute>} />
          {/* 产品：admin + finance + editor */}
          <Route path="/products" element={<PrivateRoute allowedRoles={['admin','finance','editor']}><ProductsPage /></PrivateRoute>} />
          {/* 财务：admin + finance */}
          <Route path="/finance" element={<PrivateRoute allowedRoles={['admin','finance']}><FinancePage /></PrivateRoute>} />
          {/* 文章：admin + editor + service(只读) */}
          <Route path="/articles" element={<PrivateRoute allowedRoles={['admin','editor','service']}><ArticlesPage /></PrivateRoute>} />
          {/* 内容审核：admin + service */}
          <Route path="/content" element={<PrivateRoute allowedRoles={['admin','service']}><ContentPage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute allowedRoles={['admin','service']}><ReportsPage /></PrivateRoute>} />
          {/* 系统配置：仅admin */}
          <Route path="/config" element={<PrivateRoute allowedRoles={['admin']}><ConfigPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
}
