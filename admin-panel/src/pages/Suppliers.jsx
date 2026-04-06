import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Input, Select, Tag, Space, Modal, Form,
  message, Statistic, Row, Col, Tooltip, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ShopOutlined, TeamOutlined, StarOutlined, ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const CREDIT_COLOR = { A: 'green', B: 'blue', C: 'orange', D: 'red' };

export default function SuppliersPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form] = Form.useForm();
  const role = JSON.parse(localStorage.getItem('adminInfo') || '{}').role;

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/suppliers', { params: { page, pageSize: 20, keyword, status, category } });
      setList(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch { message.error('加载失败'); }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/admin/suppliers/dashboard/stats');
      setStats(res.data);
    } catch {}
  };

  useEffect(() => { fetchList(); fetchStats(); }, [page, keyword, status, category]);

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editRow) {
        await axios.put(`/admin/suppliers/${editRow.id}`, values);
        message.success('更新成功');
      } else {
        await axios.post('/admin/suppliers', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchList(); fetchStats();
    } catch (e) { message.error(e.response?.data?.error || '操作失败'); }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除该供应商？',
      onOk: async () => {
        await axios.delete(`/admin/suppliers/${id}`);
        message.success('已删除'); fetchList();
      }
    });
  };

  const openEdit = (row) => {
    setEditRow(row);
    form.setFieldsValue(row || {});
    setModalVisible(true);
  };

  const columns = [
    { title: '供应商名称', dataIndex: 'name', key: 'name', width: 160, render: (v, r) => <><ShopOutlined style={{ color: '#6B8E23', marginRight: 6 }} /><b>{v}</b> {r.code && <span style={{ color: '#aaa', fontSize: 12 }}>#{r.code}</span>}</> },
    { title: '联系人', dataIndex: 'contact_person', key: 'contact_person', width: 100 },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: v => v ? <Tag>{v}</Tag> : '-' },
    { title: '信用等级', dataIndex: 'credit_level', key: 'credit_level', width: 90, render: v => <Tag color={CREDIT_COLOR[v] || 'default'}>{v || 'A'}</Tag> },
    { title: '账期(天)', dataIndex: 'payment_terms', key: 'payment_terms', width: 90 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: v => <Badge status={v === 'active' ? 'success' : 'default'} text={v === 'active' ? '正常' : '停用'} /> },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160, render: v => v?.slice(0, 16) },
    {
      title: '操作', key: 'action', width: 120, fixed: 'right',
      render: (_, r) => (
        <Space>
          {['admin', 'editor'].includes(role) && <Tooltip title="编辑"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>}
          {role === 'admin' && <Tooltip title="删除"><Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} /></Tooltip>}
        </Space>
      )
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { title: '供应商总数', value: stats.summary?.total || 0, icon: <ShopOutlined />, color: '#6B8E23' },
          { title: '活跃供应商', value: stats.summary?.active_count || 0, icon: <TeamOutlined />, color: '#1890ff' },
          { title: 'A级供应商', value: stats.summary?.grade_a || 0, icon: <StarOutlined />, color: '#52c41a' },
          { title: 'B级供应商', value: stats.summary?.grade_b || 0, icon: <StarOutlined />, color: '#faad14' },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic title={s.title} value={s.value} prefix={<span style={{ color: s.color }}>{s.icon}</span>} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<><ShopOutlined style={{ color: '#6B8E23', marginRight: 8 }} />供应商管理</>}
        extra={
          <Space>
            <Input placeholder="搜索供应商/联系人/电话" prefix={<SearchOutlined />} value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} style={{ width: 220 }} allowClear />
            <Select placeholder="分类" value={category || undefined} onChange={v => { setCategory(v || ''); setPage(1); }} style={{ width: 110 }} allowClear>
              {['原材料', '包装', '设备', '服务', '其他'].map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
            <Select placeholder="状态" value={status || undefined} onChange={v => { setStatus(v || ''); setPage(1); }} style={{ width: 90 }} allowClear>
              <Option value="active">正常</Option>
              <Option value="inactive">停用</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); setStatus(''); setCategory(''); setPage(1); }} />
            {['admin', 'editor'].includes(role) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRow(null); form.resetFields(); setModalVisible(true); }}>新增供应商</Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns} dataSource={list} rowKey="id" loading={loading} scroll={{ x: 1200 }}
          pagination={{ current: page, pageSize: 20, total, onChange: setPage, showTotal: t => `共 ${t} 条` }}
        />
      </Card>

      <Modal title={editRow ? '编辑供应商' : '新增供应商'} open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={700} okText="保存">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="供应商名称" name="name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="供应商编号" name="code"><Input placeholder="自动或手动填写" /></Form.Item></Col>
            <Col span={12}><Form.Item label="联系人" name="contact_person"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="联系电话" name="phone"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="邮箱" name="email"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="分类" name="category"><Select allowClear placeholder="选择分类">{['原材料', '包装', '设备', '服务', '其他'].map(c => <Option key={c} value={c}>{c}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="信用等级" name="credit_level" initialValue="A"><Select>{['A', 'B', 'C', 'D'].map(g => <Option key={g} value={g}><Tag color={CREDIT_COLOR[g]}>{g}</Tag></Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="账期(天)" name="payment_terms" initialValue={30}><Input type="number" /></Form.Item></Col>
            <Col span={24}><Form.Item label="地址" name="address"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="省份" name="province"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="城市" name="city"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="税号" name="tax_id"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="开户行" name="bank_name"><Input /></Form.Item></Col>
            <Col span={24}><Form.Item label="银行账号" name="bank_account"><Input /></Form.Item></Col>
            <Col span={24}><Form.Item label="备注" name="notes"><Input.TextArea rows={2} /></Form.Item></Col>
            {editRow && <Col span={12}><Form.Item label="状态" name="status"><Select><Option value="active">正常</Option><Option value="inactive">停用</Option></Select></Form.Item></Col>}
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
