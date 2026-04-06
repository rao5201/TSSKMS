import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tabs, Button, Input, Select, Space, Modal, Form,
  message, Statistic, Row, Col, DatePicker, Tag, Divider
} from 'antd';
import {
  PlusOutlined, SearchOutlined, DollarOutlined,
  RiseOutlined, FallOutlined, BarChartOutlined, ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function FinancePage() {
  const [dashboard, setDashboard] = useState({});
  const [salesList, setSalesList] = useState([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [expList, setExpList] = useState([]);
  const [expTotal, setExpTotal] = useState(0);
  const [recordList, setRecordList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saleModal, setSaleModal] = useState(false);
  const [expModal, setExpModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [year] = useState(new Date().getFullYear());
  const [salePage, setSalePage] = useState(1);
  const [expPage, setExpPage] = useState(1);
  const [saleForm] = Form.useForm();
  const [expForm] = Form.useForm();
  const role = JSON.parse(localStorage.getItem('adminInfo') || '{}').role;

  const fetchDash = async () => {
    try { const r = await axios.get('/admin/finance/dashboard', { params: { year } }); setDashboard(r.data); } catch {}
  };
  const fetchSales = async () => {
    setLoading(true);
    try { const r = await axios.get('/admin/finance/sales', { params: { page: salePage, pageSize: 20 } }); setSalesList(r.data.list || []); setSalesTotal(r.data.total || 0); } catch {}
    setLoading(false);
  };
  const fetchExp = async () => {
    try { const r = await axios.get('/admin/finance/expenses', { params: { page: expPage, pageSize: 20 } }); setExpList(r.data.list || []); setExpTotal(r.data.total || 0); } catch {}
  };
  const fetchRecords = async () => {
    try { const r = await axios.get('/admin/finance/records'); setRecordList(r.data.list || []); } catch {}
  };
  const fetchProducts = async () => {
    try { const r = await axios.get('/admin/products', { params: { pageSize: 200 } }); setProducts(r.data.list || []); } catch {}
  };
  const fetchSuppliers = async () => {
    try { const r = await axios.get('/admin/suppliers', { params: { pageSize: 200 } }); setSuppliers(r.data.list || []); } catch {}
  };

  useEffect(() => { fetchDash(); fetchSales(); fetchExp(); fetchRecords(); fetchProducts(); fetchSuppliers(); }, []);

  const saveSale = async () => {
    const v = await saleForm.validateFields();
    try {
      await axios.post('/admin/finance/sales', v);
      message.success('销售订单已创建'); setSaleModal(false); saleForm.resetFields(); fetchDash(); fetchSales();
    } catch (e) { message.error(e.response?.data?.error || '操作失败'); }
  };

  const saveExp = async () => {
    const v = await expForm.validateFields();
    try {
      await axios.post('/admin/finance/expenses', { ...v, expense_date: v.expense_date?.format('YYYY-MM-DD') });
      message.success('费用已记录'); setExpModal(false); expForm.resetFields(); fetchDash(); fetchExp();
    } catch (e) { message.error(e.response?.data?.error || '操作失败'); }
  };

  const fmt = n => `¥${Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const salesCols = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '客户', dataIndex: 'customer_name', key: 'customer_name', width: 100 },
    { title: '产品', dataIndex: 'product_name', key: 'product_name', width: 120 },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 70 },
    { title: '单价', dataIndex: 'unit_price', key: 'unit_price', width: 90, render: v => fmt(v) },
    { title: '实收', dataIndex: 'actual_amount', key: 'actual_amount', width: 100, render: v => <b style={{ color: '#52c41a' }}>{fmt(v)}</b> },
    { title: '毛利', dataIndex: 'gross_profit', key: 'gross_profit', width: 100, render: v => <span style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>{fmt(v)}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: v => <Tag color={v === 'paid' ? 'green' : v === 'cancelled' ? 'red' : 'orange'}>{v === 'paid' ? '已付款' : v === 'cancelled' ? '已取消' : '待付款'}</Tag> },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 160, render: v => v?.slice(0, 16) },
  ];

  const expCols = [
    { title: '费用名称', dataIndex: 'title', key: 'title', width: 160 },
    { title: '类别', dataIndex: 'category', key: 'category', width: 90, render: v => <Tag color="orange">{v}</Tag> },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 100, render: v => <b style={{ color: '#ff4d4f' }}>{fmt(v)}</b> },
    { title: '供应商', dataIndex: 'supplier_name', key: 'supplier_name', width: 120 },
    { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no', width: 120 },
    { title: '支付状态', dataIndex: 'payment_status', key: 'payment_status', width: 90, render: v => <Tag color={v === 'paid' ? 'green' : 'red'}>{v === 'paid' ? '已支付' : '未支付'}</Tag> },
    { title: '费用日期', dataIndex: 'expense_date', key: 'expense_date', width: 110 },
  ];

  const recordCols = [
    { title: '类型', dataIndex: 'record_type', key: 'record_type', width: 80, render: v => <Tag color={v === 'income' ? 'green' : 'red'} icon={v === 'income' ? <RiseOutlined /> : <FallOutlined />}>{v === 'income' ? '收入' : '支出'}</Tag> },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 110, render: (v, r) => <span style={{ color: r.record_type === 'income' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>{r.record_type === 'income' ? '+' : '-'}{fmt(v)}</span> },
    { title: '说明', dataIndex: 'description', key: 'description' },
    { title: '来源', dataIndex: 'source_type', key: 'source_type', width: 90, render: v => <Tag>{v}</Tag> },
    { title: '日期', dataIndex: 'created_at', key: 'created_at', width: 160, render: v => v?.slice(0, 16) },
  ];

  return (
    <div>
      {/* 财务总览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { title: `${year}年总收入`, value: fmt(dashboard.income), color: '#52c41a', icon: <RiseOutlined /> },
          { title: `${year}年总支出`, value: fmt(dashboard.expense), color: '#ff4d4f', icon: <FallOutlined /> },
          { title: '毛利润', value: fmt(dashboard.gross_profit), color: '#6B8E23', icon: <BarChartOutlined /> },
          { title: '净利润', value: fmt(dashboard.net_profit), color: dashboard.net_profit >= 0 ? '#1890ff' : '#ff4d4f', icon: <DollarOutlined /> },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{s.icon} {s.title}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 月度趋势 */}
      {dashboard.monthly_trend?.length > 0 && (
        <Card title={<><BarChartOutlined style={{ color: '#6B8E23', marginRight: 8 }} />{year}年月度收入趋势</>} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 8px' }}>
            {dashboard.monthly_trend.map(m => {
              const max = Math.max(...dashboard.monthly_trend.map(x => x.income));
              const h = max > 0 ? Math.round((m.income / max) * 100) : 0;
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 10, color: '#52c41a', marginBottom: 2 }}>{fmt(m.income).replace('¥', '')}</div>
                  <div style={{ width: '100%', height: h || 4, background: 'linear-gradient(180deg,#6B8E23,#8BC34A)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{m.month}月</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Tabs
        items={[
          {
            key: 'sales', label: '销售订单',
            children: (
              <Card extra={role === 'finance' || role === 'admin' ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { saleForm.resetFields(); setSaleModal(true); }}>新建订单</Button> : null}>
                <Table columns={salesCols} dataSource={salesList} rowKey="id" loading={loading} scroll={{ x: 1100 }}
                  pagination={{ current: salePage, pageSize: 20, total: salesTotal, onChange: setSalePage }} />
              </Card>
            )
          },
          {
            key: 'expenses', label: '费用管理',
            children: (
              <Card extra={role === 'finance' || role === 'admin' ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { expForm.resetFields(); setExpModal(true); }}>记录费用</Button> : null}>
                <Table columns={expCols} dataSource={expList} rowKey="id" scroll={{ x: 900 }}
                  pagination={{ current: expPage, pageSize: 20, total: expTotal, onChange: setExpPage }} />
              </Card>
            )
          },
          {
            key: 'records', label: '财务流水',
            children: (
              <Card>
                <Table columns={recordCols} dataSource={recordList} rowKey="id" scroll={{ x: 600 }} />
              </Card>
            )
          },
          {
            key: 'expense_cat', label: '费用分类分析',
            children: (
              <Card>
                <Row gutter={16}>
                  {(dashboard.expense_by_category || []).map((c, i) => (
                    <Col span={6} key={i} style={{ marginBottom: 12 }}>
                      <Card bordered={false} style={{ background: '#fafafa', borderRadius: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: '#888' }}>{c.category}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ff4d4f' }}>{fmt(c.total)}</div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )
          },
        ]}
      />

      {/* 销售订单弹窗 */}
      <Modal title="新建销售订单" open={saleModal} onOk={saveSale} onCancel={() => setSaleModal(false)} okText="确认">
        <Form form={saleForm} layout="vertical">
          <Form.Item label="客户姓名" name="customer_name"><Input /></Form.Item>
          <Form.Item label="客户电话" name="customer_phone"><Input /></Form.Item>
          <Form.Item label="产品" name="product_id" rules={[{ required: true }]}>
            <Select placeholder="选择产品">{products.map(p => <Option key={p.id} value={p.id}>{p.name} - ¥{p.selling_price}</Option>)}</Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="数量" name="quantity" initialValue={1} rules={[{ required: true }]}><Input type="number" min={1} /></Form.Item></Col>
            <Col span={12}><Form.Item label="折扣(¥)" name="discount" initialValue={0}><Input type="number" min={0} /></Form.Item></Col>
          </Row>
          <Form.Item label="支付方式" name="payment_method"><Select allowClear><Option value="cash">现金</Option><Option value="wechat">微信</Option><Option value="alipay">支付宝</Option><Option value="bank">银行转账</Option></Select></Form.Item>
          <Form.Item label="备注" name="notes"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* 费用弹窗 */}
      <Modal title="记录费用" open={expModal} onOk={saveExp} onCancel={() => setExpModal(false)} okText="确认">
        <Form form={expForm} layout="vertical">
          <Form.Item label="费用名称" name="title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="费用类别" name="category" rules={[{ required: true }]}>
            <Select>{['运营', '营销', '人工', '采购', '物流', '其他'].map(c => <Option key={c} value={c}>{c}</Option>)}</Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="金额(¥)" name="amount" rules={[{ required: true }]}><Input type="number" min={0} step={0.01} /></Form.Item></Col>
            <Col span={12}><Form.Item label="费用日期" name="expense_date" initialValue={dayjs()}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item label="关联供应商" name="supplier_id"><Select allowClear placeholder="选择供应商">{suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item>
          <Form.Item label="发票号" name="invoice_no"><Input /></Form.Item>
          <Form.Item label="支付状态" name="payment_status" initialValue="paid"><Select><Option value="paid">已支付</Option><Option value="unpaid">未支付</Option></Select></Form.Item>
          <Form.Item label="备注" name="notes"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
