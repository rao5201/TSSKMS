import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, message, Typography, Popconfirm } from 'antd';
import axios from 'axios';

const { Title } = Typography;

export default function ConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({});

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/config');
      setConfigs(data);
    } catch (e) { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleSave = async (key, value) => {
    try {
      await axios.put(`/admin/config/${key}`, { value });
      message.success('保存成功');
      setEditing(e => ({ ...e, [key]: undefined }));
      fetchConfigs();
    } catch (e) { message.error('保存失败'); }
  };

  const columns = [
    { title: '配置键', dataIndex: 'key', width: 200, render: v => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{v}</code> },
    { title: '描述', dataIndex: 'description', width: 180 },
    {
      title: '当前值', dataIndex: 'value', render: (v, r) => editing[r.key] !== undefined
        ? <Input size="small" value={editing[r.key]} onChange={e => setEditing(ed => ({ ...ed, [r.key]: e.target.value }))} style={{ width: 160 }} />
        : <span style={{ color: '#6B8E23', fontWeight: 600 }}>{v}</span>
    },
    { title: '更新时间', dataIndex: 'updated_at', render: v => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    {
      title: '操作', render: (_, r) => editing[r.key] !== undefined
        ? <Space><Button size="small" type="primary" onClick={() => handleSave(r.key, editing[r.key])}>保存</Button><Button size="small" onClick={() => setEditing(e => ({ ...e, [r.key]: undefined }))}>取消</Button></Space>
        : <Button size="small" onClick={() => setEditing(e => ({ ...e, [r.key]: r.value }))}>编辑</Button>
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>⚙️ 系统配置</Title>
      <Table dataSource={configs} columns={columns} rowKey="key" loading={loading} pagination={false} />
    </div>
  );
}
