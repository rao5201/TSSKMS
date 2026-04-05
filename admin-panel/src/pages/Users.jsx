import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Select, message, Popconfirm, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/users', { params: { page, pageSize: 20, keyword, status } });
      setUsers(data.list);
      setTotal(data.total);
    } catch (e) { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, keyword, status]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/admin/users/${id}/status`, { status: newStatus });
      message.success('操作成功');
      fetchUsers();
    } catch (e) { message.error('操作失败'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/admin/users/${id}`);
      message.success('已删除');
      fetchUsers();
    } catch (e) { message.error('删除失败'); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '用户名', dataIndex: 'username', render: (v, r) => <><strong>{v}</strong><br /><small style={{ color: '#999' }}>{r.nickname}</small></> },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '正常' : '禁用'}</Tag> },
    { title: '注册时间', dataIndex: 'created_at', render: v => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    { title: '最后登录', dataIndex: 'last_login', render: v => v ? new Date(v).toLocaleString('zh-CN') : '从未登录' },
    {
      title: '操作', render: (_, r) => (
        <Space>
          {r.status === 'active'
            ? <Button size="small" danger onClick={() => handleStatusChange(r.id, 'banned')}>禁用</Button>
            : <Button size="small" type="primary" onClick={() => handleStatusChange(r.id, 'active')}>启用</Button>}
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>👥 用户管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="搜索用户名/昵称" prefix={<SearchOutlined />} value={keyword}
          onChange={e => { setKeyword(e.target.value); setPage(1); }} style={{ width: 220 }} />
        <Select value={status} onChange={v => { setStatus(v); setPage(1); }} style={{ width: 120 }}>
          <Select.Option value="">全部状态</Select.Option>
          <Select.Option value="active">正常</Select.Option>
          <Select.Option value="banned">已禁用</Select.Option>
        </Select>
      </Space>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading}
        pagination={{ total, current: page, pageSize: 20, onChange: setPage, showTotal: t => `共 ${t} 位用户` }} />
    </div>
  );
}
