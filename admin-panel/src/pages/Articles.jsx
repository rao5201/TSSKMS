import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Input, Select, Tag, Space, Modal, Form,
  message, Statistic, Row, Col, Tabs, Badge, Tooltip
} from 'antd';
import {
  SearchOutlined, CheckOutlined, CloseOutlined, EditOutlined,
  FileTextOutlined, PlusOutlined, EyeOutlined, ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const STATUS_CONFIG = {
  draft:     { color: 'default', text: '草稿' },
  pending:   { color: 'orange', text: '待审核' },
  published: { color: 'green',  text: '已发布' },
  rejected:  { color: 'red',    text: '已拒绝' },
};

const COLUMNS_DICT = [
  { value: 'news',    label: '新闻动态' },
  { value: 'notice',  label: '公告通知' },
  { value: 'activity',label: '活动专区' },
  { value: 'product', label: '产品介绍' },
  { value: 'other',   label: '其他' },
];

export default function ArticlesPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [column, setColumn] = useState('');
  const [keyword, setKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const role = JSON.parse(localStorage.getItem('adminInfo') || '{}').role;

  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/admin/articles', { params: { page, pageSize: 20, status, column, keyword } });
      setList(r.data.list || []);
      setTotal(r.data.total || 0);
    } catch { message.error('加载失败'); }
    setLoading(false);
  };

  const fetchPending = async () => {
    if (!['admin'].includes(role)) return;
    try {
      const r = await axios.get('/admin/articles/pending/list');
      setPending(r.data || []);
    } catch {}
  };

  useEffect(() => { fetchList(); fetchPending(); }, [page, status, column, keyword]);

  const handleSave = async () => {
    const v = await form.validateFields();
    try {
      if (currentArticle?.id) {
        await axios.put(`/admin/articles/${currentArticle.id}`, v);
        message.success('更新成功');
      } else {
        await axios.post('/admin/articles', v);
        message.success(role === 'admin' ? '已发布' : '已提交，等待审核');
      }
      setModalVisible(false);
      form.resetFields();
      fetchList(); fetchPending();
    } catch (e) { message.error(e.response?.data?.error || '操作失败'); }
  };

  const handleReview = async (articleId, action) => {
    const { comment } = await reviewForm.validateFields().catch(() => ({}));
    try {
      await axios.post(`/admin/articles/${articleId}/review`, { action, comment });
      message.success(action === 'approve' ? '已审核通过并发布' : '已拒绝');
      setReviewModal(false);
      fetchList(); fetchPending();
    } catch (e) { message.error(e.response?.data?.error || '操作失败'); }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除该文章？',
      onOk: async () => { await axios.delete(`/admin/articles/${id}`); message.success('已删除'); fetchList(); }
    });
  };

  const openEdit = async (id) => {
    const r = await axios.get(`/admin/articles/${id}`);
    setCurrentArticle(r.data);
    form.setFieldsValue({ ...r.data, tags: Array.isArray(r.data.tags) ? r.data.tags : JSON.parse(r.data.tags || '[]') });
    setModalVisible(true);
  };

  const openView = async (id) => {
    const r = await axios.get(`/admin/articles/${id}`);
    setCurrentArticle(r.data);
    setViewModal(true);
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 220 },
    { title: '栏目', dataIndex: 'column', key: 'column', width: 100, render: v => <Tag>{COLUMNS_DICT.find(c => c.value === v)?.label || v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: v => <Tag color={STATUS_CONFIG[v]?.color}>{STATUS_CONFIG[v]?.text}</Tag> },
    { title: '作者', dataIndex: 'author_name', key: 'author_name', width: 90 },
    { title: '浏览量', dataIndex: 'views_count', key: 'views_count', width: 80 },
    { title: '发布时间', dataIndex: 'published_at', key: 'published_at', width: 150, render: v => v?.slice(0, 16) || '-' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 150, render: v => v?.slice(0, 16) },
    {
      title: '操作', key: 'action', width: 150, fixed: 'right',
      render: (_, r) => (
        <Space>
          <Tooltip title="查看"><Button size="small" icon={<EyeOutlined />} onClick={() => openView(r.id)} /></Tooltip>
          {['admin', 'editor'].includes(role) && <Tooltip title="编辑"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r.id)} /></Tooltip>}
          {role === 'admin' && r.status === 'pending' && (
            <>
              <Tooltip title="通过"><Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => { setCurrentArticle(r); setReviewModal(true); }} /></Tooltip>
            </>
          )}
          {role === 'admin' && <Tooltip title="删除"><Button size="small" danger icon={<CloseOutlined />} onClick={() => handleDelete(r.id)} /></Tooltip>}
        </Space>
      )
    },
  ];

  const pendingCols = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '栏目', dataIndex: 'column', key: 'column', width: 100, render: v => <Tag>{COLUMNS_DICT.find(c => c.value === v)?.label || v}</Tag> },
    { title: '作者', dataIndex: 'author_name', key: 'author_name', width: 80 },
    { title: '提交时间', dataIndex: 'created_at', key: 'created_at', width: 150, render: v => v?.slice(0, 16) },
    {
      title: '操作', key: 'action', width: 160,
      render: (_, r) => (
        <Space>
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={async () => { await axios.post(`/admin/articles/${r.id}/review`, { action: 'approve' }); message.success('已发布'); fetchList(); fetchPending(); }}>通过</Button>
          <Button size="small" danger icon={<CloseOutlined />} onClick={async () => { await axios.post(`/admin/articles/${r.id}/review`, { action: 'reject' }); message.success('已拒绝'); fetchList(); fetchPending(); }}>拒绝</Button>
        </Space>
      )
    },
  ];

  const tabItems = [
    {
      key: 'all', label: '全部文章',
      children: (
        <Table columns={columns} dataSource={list} rowKey="id" loading={loading} scroll={{ x: 1100 }}
          pagination={{ current: page, pageSize: 20, total, onChange: setPage, showTotal: t => `共 ${t} 条` }} />
      )
    },
  ];
  if (role === 'admin') {
    tabItems.push({
      key: 'pending',
      label: <Badge count={pending.length} offset={[6, 0]}>待审核</Badge>,
      children: <Table columns={pendingCols} dataSource={pending} rowKey="id" />
    });
  }

  return (
    <div>
      <Card
        title={<><FileTextOutlined style={{ color: '#6B8E23', marginRight: 8 }} />文章管理</>}
        extra={
          <Space>
            <Input placeholder="搜索标题" prefix={<SearchOutlined />} value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} style={{ width: 200 }} allowClear />
            <Select placeholder="栏目" value={column || undefined} onChange={v => { setColumn(v || ''); setPage(1); }} style={{ width: 110 }} allowClear>
              {COLUMNS_DICT.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
            </Select>
            <Select placeholder="状态" value={status || undefined} onChange={v => { setStatus(v || ''); setPage(1); }} style={{ width: 100 }} allowClear>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <Option key={k} value={k}>{v.text}</Option>)}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); setStatus(''); setColumn(''); setPage(1); }} />
            {['admin', 'editor'].includes(role) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCurrentArticle(null); form.resetFields(); setModalVisible(true); }}>写文章</Button>
            )}
          </Space>
        }
      >
        <Tabs items={tabItems} />
      </Card>

      {/* 编辑弹窗 */}
      <Modal title={currentArticle?.id ? '编辑文章' : '新建文章'} open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} width={800} okText="保存">
        <Form form={form} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="栏目" name="column" initialValue="news" rules={[{ required: true }]}><Select>{COLUMNS_DICT.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}</Select></Form.Item></Col>
            <Col span={8}><Form.Item label="分类" name="category" initialValue="news"><Select><Option value="news">新闻</Option><Option value="notice">通知</Option><Option value="activity">活动</Option><Option value="product">产品</Option></Select></Form.Item></Col>
            <Col span={8}><Form.Item label="是否置顶" name="is_top" initialValue={0}><Select><Option value={0}>否</Option><Option value={1}>是</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item label="摘要" name="summary"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="正文内容" name="content" rules={[{ required: true }]}><Input.TextArea rows={8} /></Form.Item>
          <Form.Item label="封面图片URL" name="cover_image"><Input placeholder="https://..." /></Form.Item>
        </Form>
        {role !== 'admin' && <div style={{ color: '#faad14', marginTop: 8 }}>注：提交后需管理员审核后才会公开</div>}
      </Modal>

      {/* 查看弹窗 */}
      <Modal title={currentArticle?.title} open={viewModal} onCancel={() => setViewModal(false)} footer={null} width={700}>
        <div style={{ padding: 12 }}>
          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col><Tag>{COLUMNS_DICT.find(c => c.value === currentArticle?.column)?.label}</Tag></Col>
            <Col><Tag color={STATUS_CONFIG[currentArticle?.status]?.color}>{STATUS_CONFIG[currentArticle?.status]?.text}</Tag></Col>
            <Col><span style={{ color: '#888', fontSize: 12 }}>作者：{currentArticle?.author_name}</span></Col>
          </Row>
          {currentArticle?.summary && <p style={{ color: '#666', fontStyle: 'italic', borderLeft: '3px solid #6B8E23', paddingLeft: 12 }}>{currentArticle.summary}</p>}
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, marginTop: 12 }}>{currentArticle?.content}</div>
          {currentArticle?.review_comment && <div style={{ marginTop: 12, padding: 12, background: '#fff7e6', borderRadius: 8 }}><b>审核意见：</b>{currentArticle.review_comment}</div>}
        </div>
      </Modal>
    </div>
  );
}
