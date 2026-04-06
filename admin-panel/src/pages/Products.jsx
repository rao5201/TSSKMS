import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Input, Select, Tag, Space, Modal, Form,
  message, Statistic, Row, Col, Tooltip, Badge, Alert
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  AppstoreOutlined, WarningOutlined, DollarOutlined, ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

export default function ProductsPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form] = Form.useForm();
  const role = JSON.parse(localStorage.getItem('adminInfo') || '{}').role;

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/products', { params: { page, pageSize: 20, keyword, category } });
      setList(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch { message.error('加载失败'); }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/admin/products/dashboard/stats');
      setStats(res.data);
    } catch {}
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('/admin/suppliers', { params: { pageSize: 200, status: 'active' } });
      setSuppliers(res.data.list || []);
    } catch {}
  };

  useEffect(() => { fetchList(); fetchStats(); fetchSuppliers(); }, [page, keyword, category]);

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editRow) {
        await axios.put(`/admin/products/${editRow.id}`, values);
        message.success('更新成功');
      } else {
        await axios.post('/admin/products', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchList(); fetchStats();
    } catch (e) { message.error(e.response?.data?.error || '操作失败'); }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除该产品？',
      onOk: async () => { await axios.delete(`/admin/products/${id}`); message.success('已删除'); fetchList(); }
    });
  };

  const openEdit = (row) => {
    setEditRow(row);
    form.setFieldsValue(row || {});
    setModalVisible(true);
  };

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120, render: v => <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>{v || '-'}</code> },
    { title: '产品名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: v => v ? <Tag color="blue">{v}</Tag> : '-' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 70 },
    { title: '成本价', dataIndex: 'cost_price', key: 'cost_price', width: 90, render: v => <span style={{ color: '#ff4d4f' }}>¥{Number(v || 0).toFixed(2)}</span> },
    { title: '销售价', dataIndex: 'selling_price', key: 'selling_price', width: 90, render: v => <span style={{ color: '#52c41a', fontWeight: 600 }}>¥{Number(v || 0).toFixed(2)}</span> },
    { title: '库存', dataIndex: 'stock', key: 'stock', width: 90, render: (v, r) => <span style={{ color: v <= r.min_stock ? '#ff4d4f' : 'inherit' }}>{v <= r.min_stock && <WarningOutlined />} {v}</span> },
    { title: '供应商', dataIndex: 'supplier_name', key: 'supplier_name', width: 120, render: v => v || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: v => <Badge status={v === 'active' ? 'success' : 'default'} text={v === 'active' ? '上架' : '下架'} /> },
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
      {stats.low_stock_alert?.length > 0 && (
        <Alert
          type="warning" showIcon
          message={`库存预警：${stats.low_stock_alert?.length} 个产品库存不足`}
          description={stats.low_stock_alert?.map(p => `${p.name}(剩余${p.stock})`).join('、')}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { title: '产品总数', value: stats.summary?.total || 0, icon: <AppstoreOutlined />, color: '#6B8E23' },
          { title: '上架产品', value: stats.summary?.active_count || 0, icon: <AppstoreOutlined />, color: '#1890ff' },
          { title: '库存预警', value: stats.summary?.low_stock || 0, icon: <WarningOutlined />, color: '#ff4d4f' },
          { title: '库存成本', value: `¥${Number(stats.summary?.total_stock_cost || 0).toFixed(0)}`, icon: <DollarOutlined />, color: '#faad14', isStr: true },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic title={s.title} value={s.isStr ? undefined : s.value} formatter={s.isStr ? () => s.value : undefined}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>} />
              {s.isStr && <div style={{ fontSize: 24, fontWeight: 600 }}>{s.value}</div>}
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<><AppstoreOutlined style={{ color: '#6B8E23', marginRight: 8 }} />产品数据库</>}
        extra={
          <Space>
            <Input placeholder="搜索产品名/SKU" prefix={<SearchOutlined />} value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} style={{ width: 200 }} allowClear />
            <Select placeholder="分类" value={category || undefined} onChange={v => { setCategory(v || ''); setPage(1); }} style={{ width: 110 }} allowClear>
              {['原材料', '成品', '包装', '耗材', '其他'].map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); setCategory(''); setPage(1); }} />
            {['admin', 'editor'].includes(role) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRow(null); form.resetFields(); setModalVisible(true); }}>新增产品</Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns} dataSource={list} rowKey="id" loading={loading} scroll={{ x: 1200 }}
          pagination={{ current: page, pageSize: 20, total, onChange: setPage, showTotal: t => `共 ${t} 条` }}
        />
      </Card>

      <Modal title={editRow ? '编辑产品' : '新增产品'} open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={720} okText="保存">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="产品名称" name="name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="SKU编号" name="sku"><Input placeholder="可自动生成" /></Form.Item></Col>
            <Col span={12}><Form.Item label="分类" name="category"><Select allowClear placeholder="选择分类">{['原材料', '成品', '包装', '耗材', '其他'].map(c => <Option key={c} value={c}>{c}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="子分类" name="sub_category"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="计量单位" name="unit" initialValue="件"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="供应商" name="supplier_id"><Select allowClear placeholder="选择供应商">{suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item></Col>
            <Col span={8}><Form.Item label="成本价(¥)" name="cost_price" initialValue={0}><Input type="number" min={0} step={0.01} /></Form.Item></Col>
            <Col span={8}><Form.Item label="销售价(¥)" name="selling_price" initialValue={0}><Input type="number" min={0} step={0.01} /></Form.Item></Col>
            <Col span={8}><Form.Item label="最低价(¥)" name="min_price" initialValue={0}><Input type="number" min={0} step={0.01} /></Form.Item></Col>
            <Col span={12}><Form.Item label="当前库存" name="stock" initialValue={0}><Input type="number" min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item label="预警库存" name="min_stock" initialValue={10}><Input type="number" min={0} /></Form.Item></Col>
            <Col span={24}><Form.Item label="产品描述" name="description"><Input.TextArea rows={2} /></Form.Item></Col>
            {editRow && <Col span={12}><Form.Item label="状态" name="status"><Select><Option value="active">上架</Option><Option value="inactive">下架</Option></Select></Form.Item></Col>}
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
