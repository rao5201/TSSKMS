import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/admin/auth/login', values);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminInfo', JSON.stringify({ username: data.username, role: data.role }));
      message.success('登录成功，欢迎回来！');
      navigate('/');
    } catch (e) {
      message.error(e.response?.data?.error || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F0F1A 0%, #1A2A0F 100%)'
    }}>
      <Card style={{ width: 400, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} bodyStyle={{ padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56 }}>🦐🍵🪞</div>
          <h2 style={{ fontSize: 22, color: '#6B8E23', fontWeight: 'bold', marginTop: 8 }}>茶海虾王·镜心</h2>
          <p style={{ color: '#999', fontSize: 13 }}>管理后台</p>
        </div>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="管理员用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: '#6B8E23', borderColor: '#6B8E23', borderRadius: 8 }}>
            登录
          </Button>
        </Form>
        <p style={{ textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: 20 }}>
          © 2024–2026 海南茶海虾王管理有限责任公司
        </p>
      </Card>
    </div>
  );
}
