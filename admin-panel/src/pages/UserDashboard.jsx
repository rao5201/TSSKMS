import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Input, Select, Tag, Space, Row, Col,
  Statistic, Tabs, Badge, Tooltip, Modal, message
} from 'antd';
import {
  UserOutlined, SearchOutlined, StopOutlined, CheckCircleOutlined,
  RiseOutlined, TeamOutlined, EnvironmentOutlined, ManOutlined, WomanOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

export default function UserDashboardPage() {
  const [dashboard, setDashboard] = useState({});
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState({});
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [gender, setGender] = useState('');
  const role = JSON.parse(localStorage.getItem('adminInfo') || '{}').role;

  const fetchDash = async () => {
    try { const r = await axios.get('/admin/userdash/dashboard'); setDashboard(r.data); } catch {}
  };
  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/admin/userdash', { params: { page, pageSize: 20, keyword, status, gender } });
      setList(r.data.list || []); setTotal(r.data.total || 0);
    } catch { message.error('加载失败'); }
    setLoading(false);
  };
  const fetchAnalysis = async () => {
    try { const r = await axios.get('/admin/userdash/analysis/active'); setAnalysis(r.data); } catch {}
  };

  useEffect(() => { fetchDash(); fetchList(); fetchAnalysis(); }, [page, keyword, status, gender]);

  const handleBan = (id, action) => {
    const tip = action === 'ban' ? '确认封禁该用户？' : '确认解封该用户？';
    Modal.confirm({
      title: tip, onOk: async () => {
        await axios.post(`/admin/userdash/${id}/ban`, { action });
        message.success(action === 'ban' ? '已封禁' : '已解封');
        fetchList();
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '用户', key: 'user', width: 180,
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6B8E23', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0 }}>
            {r.nickname?.[0] || r.username?.[0] || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.nickname || r.username}</div>
            <div style={{ fontSize: 11, color: '#888' }}>@{r.username}</div>
          </div>
        </div>
      )
    },
    { title: '性别', dataIndex: 'gender', key: 'gender', width: 70, render: v => v === 'male' ? <Tag icon={<ManOutlined />} color="blue">男</Tag> : v === 'female' ? <Tag icon={<WomanOutlined />} color="pink">女</Tag> : <Tag>未知</Tag> },
    { title: '手机', dataIndex: 'phone', key: 'phone', width: 120, render: v => v || '-' },
    { title: '地区', dataIndex: 'location', key: 'location', width: 100, render: v => v ? <><EnvironmentOutlined /> {v}</> : '-' },
    { title: '金币', dataIndex: 'coins', key: 'coins', width: 80, render: v => <span style={{ color: '#faad14' }}>🪙{v || 0}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: v => <Badge status={v === 'active' ? 'success' : 'error'} text={v === 'active' ? '正常' : '封禁'} /> },
    { title: '最后登录', dataIndex: 'last_login', key: 'last_login', width: 150, render: v => v?.slice(0, 16) || '从未登录' },
    { title: '注册时间', dataIndex: 'created_at', key: 'created_at', width: 150, render: v => v?.slice(0, 16) },
    {
      title: '操作', key: 'action', width: 100, fixed: 'right',
      render: (_, r) => role === 'admin' ? (
        r.status === 'active'
          ? <Tooltip title="封禁"><Button size="small" danger icon={<StopOutlined />} onClick={() => handleBan(r.id, 'ban')} /></Tooltip>
          : <Tooltip title="解封"><Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleBan(r.id, 'unban')} /></Tooltip>
      ) : <span style={{ color: '#aaa' }}>仅查看</span>
    },
  ];

  // 简单柱状图
  const TrendBar = ({ data, field, color }) => {
    if (!data?.length) return <div style={{ color: '#aaa', textAlign: 'center', padding: 24 }}>暂无数据</div>;
    const max = Math.max(...data.map(d => d[field]));
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, padding: '0 4px', overflowX: 'auto' }}>
        {data.map((d, i) => {
          const h = max > 0 ? Math.round((d[field] / max) * 80) : 0;
          return (
            <div key={i} style={{ flex: '0 0 auto', minWidth: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>{d[field]}</div>
              <div style={{ width: 20, height: h || 2, background: color || '#6B8E23', borderRadius: '3px 3px 0 0', minHeight: 2 }} />
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 3, writingMode: 'horizontal-tb' }}>{String(d.day || d.month || '').slice(-5)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const genderPie = dashboard.gender_dist || [];
  const totalUsers = dashboard.total || 1;

  return (
    <div>
      {/* 顶部统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { title: '注册用户总数', value: dashboard.total || 0, icon: <TeamOutlined />, color: '#6B8E23' },
          { title: '今日新增', value: dashboard.today || 0, icon: <RiseOutlined />, color: '#1890ff' },
          { title: '本周新增', value: dashboard.week || 0, icon: <RiseOutlined />, color: '#52c41a' },
          { title: '本月新增', value: dashboard.month || 0, icon: <UserOutlined />, color: '#faad14' },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic title={s.title} value={s.value} prefix={<span style={{ color: s.color }}>{s.icon}</span>} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表行 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="近30天注册趋势" bordered={false} style={{ borderRadius: 10 }}>
            <TrendBar data={dashboard.register_trend} field="count" color="#6B8E23" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="性别分布" bordered={false} style={{ borderRadius: 10 }}>
            {genderPie.map(g => (
              <div key={g.gender} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{g.gender === 'male' ? '👨 男' : g.gender === 'female' ? '👩 女' : '❓ 未知'}</span>
                  <span style={{ color: '#888' }}>{g.count}人（{Math.round(g.count / totalUsers * 100)}%）</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: 8, height: 10 }}>
                  <div style={{ width: `${Math.round(g.count / totalUsers * 100)}%`, height: '100%', background: g.gender === 'male' ? '#1890ff' : g.gender === 'female' ? '#ff85c2' : '#aaa', borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 热门地区 */}
      {dashboard.top_locations?.length > 0 && (
        <Card title="用户地区 TOP10" style={{ marginBottom: 16 }} bordered={false}>
          <Row gutter={12}>
            {dashboard.top_locations.slice(0, 10).map((l, i) => (
              <Col span={4} key={i} style={{ marginBottom: 8 }}>
                <Card bordered={false} style={{ background: '#f9f9f9', borderRadius: 8, textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 11, color: '#888' }}>{l.location}</div>
                  <div style={{ fontWeight: 700, color: '#6B8E23' }}>{l.count}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 用户列表 */}
      <Card
        title={<><TeamOutlined style={{ color: '#6B8E23', marginRight: 8 }} />用户注册信息库</>}
        extra={
          <Space>
            <Input placeholder="搜索用户名/昵称/手机" prefix={<SearchOutlined />} value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} style={{ width: 220 }} allowClear />
            <Select placeholder="性别" value={gender || undefined} onChange={v => { setGender(v || ''); setPage(1); }} style={{ width: 90 }} allowClear>
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="unknown">未知</Option>
            </Select>
            <Select placeholder="状态" value={status || undefined} onChange={v => { setStatus(v || ''); setPage(1); }} style={{ width: 90 }} allowClear>
              <Option value="active">正常</Option>
              <Option value="banned">封禁</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns} dataSource={list} rowKey="id" loading={loading} scroll={{ x: 1200 }}
          pagination={{ current: page, pageSize: 20, total, onChange: setPage, showTotal: t => `共 ${t} 条` }}
        />
      </Card>
    </div>
  );
}
