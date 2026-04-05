import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Select, message, Popconfirm, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

export default function ContentPage() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/content/moments', { params: { status } });
      setMoments(data.list);
    } catch (e) { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContent(); }, [status]);

  const handleAction = async (id, newStatus) => {
    try {
      await axios.put(`/admin/content/moments/${id}/status`, { status: newStatus });
      message.success('操作成功');
      fetchContent();
    } catch (e) { message.error('操作失败'); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '用户', dataIndex: 'username', render: (v, r) => `${r.nickname || v}` },
    { title: '内容', dataIndex: 'content', render: v => <span style={{ maxWidth: 300, display: 'inline-block' }}>{v}</span> },
    { title: '情绪', dataIndex: 'emotion', render: v => v || '-' },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '正常' : '已下线'}</Tag> },
    { title: '发布时间', dataIndex: 'created_at', render: v => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    {
      title: '操作', render: (_, r) => (
        <Space>
          {r.status === 'active'
            ? <Button size="small" danger onClick={() => handleAction(r.id, 'hidden')}>下线</Button>
            : <Button size="small" type="primary" onClick={() => handleAction(r.id, 'active')}>上线</Button>}
          <Popconfirm title="确认删除此内容？" onConfirm={() => handleAction(r.id, 'deleted')}>
            <Button size="small" type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>📋 内容审核</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select value={status} onChange={v => setStatus(v)} style={{ width: 140 }}>
          <Select.Option value="">全部内容</Select.Option>
          <Select.Option value="active">正常</Select.Option>
          <Select.Option value="hidden">已下线</Select.Option>
        </Select>
      </Space>
      <Table dataSource={moments} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
    </div>
  );
}
