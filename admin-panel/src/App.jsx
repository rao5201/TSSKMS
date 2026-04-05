import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Avatar, Dropdown, theme, App as AntApp } from 'antd';
import {
  DashboardOutlined, UserOutlined, FileTextOutlined, VideoCameraOutlined,
  GiftOutlined, FlagOutlined, SettingOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import axios from 'axios';

import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Users';
import ContentPage from './pages/Content';
import ReportsPage from './pages/Reports';
import ConfigPage from './pages/Config';

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

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">数据总览</Link> },
  { key: '/users', icon: <UserOutlined />, label: <Link to="/users">用户管理</Link> },
  { key: '/content', icon: <FileTextOutlined />, label: <Link to="/content">内容审核</Link> },
  { key: '/reports', icon: <FlagOutlined />, label: <Link to="/reports">举报处理</Link> },
  { key: '/config', icon: <SettingOutlined />, label: <Link to="/config">系统配置</Link> },
];

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark"
        style={{ background: '#0F0F1A', borderRight: '1px solid rgba(107,142,35,0.3)' }}>
        <div style={{ padding: collapsed ? '16px 8px' : '16px 20px', borderBottom: '1px solid rgba(107,142,35,0.2)', marginBottom: 8 }}>
          {collapsed ? <span style={{ fontSize: 24 }}>🦐</span> : (
            <div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#6B8E23' }}>🦐 茶海虾王</div>
              <div style={{ fontSize: 11, color: '#FFD93D', marginTop: 2 }}>管理后台 v1.0.4</div>
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
            items: [
              { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }
            ]
          }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#6B8E23' }} icon={<UserOutlined />} />
              <span>{adminInfo.username || '管理员'}</span>
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

function PrivateRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? <AdminLayout>{children}</AdminLayout> : <Navigate to="/login" replace />;
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
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
          <Route path="/content" element={<PrivateRoute><ContentPage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
          <Route path="/config" element={<PrivateRoute><ConfigPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
}
