import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography } from 'antd';
import { UserOutlined, FileTextOutlined, VideoCameraOutlined, RiseOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  const [dailyUsers, setDailyUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/admin/stats/overview').then(r => setStats(r.data)),
      axios.get('/admin/stats/daily-users').then(r => setDailyUsers(r.data.slice(0, 7))),
    ]).finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '新增用户', dataIndex: 'count', key: 'count', render: v => <span style={{ color: '#6B8E23', fontWeight: 600 }}>{v}</span> },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>🦐 数据总览</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="注册用户" value={stats.users || 0} prefix={<UserOutlined style={{ color: '#6B8E23' }} />} valueStyle={{ color: '#6B8E23' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="朋友圈动态" value={stats.moments || 0} prefix={<FileTextOutlined style={{ color: '#1E88E5' }} />} valueStyle={{ color: '#1E88E5' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="视频数量" value={stats.videos || 0} prefix={<VideoCameraOutlined style={{ color: '#FF6B6B' }} />} valueStyle={{ color: '#FF6B6B' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="直播中" value={stats.live || 0} suffix="场" prefix={<RiseOutlined style={{ color: '#FFD700' }} />} valueStyle={{ color: '#FFD700' }} />
          </Card>
        </Col>
      </Row>
      <Card title="近7日新增用户" style={{ marginTop: 16 }} loading={loading}>
        <Table dataSource={dailyUsers} columns={columns} rowKey="date" pagination={false} size="small" />
      </Card>
    </div>
  );
}
