import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Button, message, Space, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/reports', { params: { status } });
      setReports(data.list);
    } catch (e) { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [status]);

  const handleProcess = async (id, newStatus) => {
    try {
      await axios.put(`/admin/reports/${id}`, { status: newStatus });
      message.success('已处理');
      fetchReports();
    } catch (e) { message.error('操作失败'); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '举报人', dataIndex: 'reporter_name' },
    { title: '举报对象', dataIndex: 'target_id', render: (v, r) => `${r.target_type} #${v}` },
    { title: '原因', dataIndex: 'reason' },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={v === 'pending' ? 'orange' : v === 'resolved' ? 'green' : 'default'}>{v === 'pending' ? '待处理' : v === 'resolved' ? '已处理' : '已忽略'}</Tag> },
    { title: '时间', dataIndex: 'created_at', render: v => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    {
      title: '操作', render: (_, r) => r.status === 'pending' ? (
        <Space>
          <Button size="small" type="primary" onClick={() => handleProcess(r.id, 'resolved')}>通过</Button>
          <Button size="small" onClick={() => handleProcess(r.id, 'ignored')}>忽略</Button>
        </Space>
      ) : null
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>🚩 举报处理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select value={status} onChange={setStatus} style={{ width: 130 }}>
          <Select.Option value="pending">待处理</Select.Option>
          <Select.Option value="resolved">已处理</Select.Option>
          <Select.Option value="ignored">已忽略</Select.Option>
          <Select.Option value="">全部</Select.Option>
        </Select>
      </Space>
      <Table dataSource={reports} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
    </div>
  );
}
