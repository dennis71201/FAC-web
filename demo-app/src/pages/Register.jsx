import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Select, Space, Typography } from 'antd';
import { MailOutlined, UserOutlined, IdcardOutlined, FormOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { getDepartmentSections } from '../services/authService';
import '../styles/auth.css';

const { Title, Paragraph, Text } = Typography;

function mapRegisterError(error) {
  if (error.status === 409) {
    return '此員工編號已存在，請直接登入或改用其他編號。';
  }

  if (error.status === 429) {
    return '嘗試次數過多，請稍後再試。';
  }

  if (error.status === 400) {
    return '註冊資料格式錯誤，請檢查欄位後重試。';
  }

  return error.message || '註冊失敗，請稍後再試。';
}

export default function Register() {
  const navigate = useNavigate();
  const { registerAccount } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionError, setOptionError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [departmentSections, setDepartmentSections] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      setOptionError('');
      try {
        const options = await getDepartmentSections();
        setDepartmentSections(options);
      } catch (error) {
        setOptionError(error.message || '無法載入部門課別資料，請稍後重試。');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const sectionOptions = useMemo(
    () => departmentSections.map((item) => ({ label: item.label, value: item.id })),
    [departmentSections]
  );

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError('');

    try {
      await registerAccount({
        employeeNumber: values.employeeNumber.trim(),
        employeeName: values.employeeName.trim(),
        employeeEmail: values.employeeEmail.trim(),
        departmentAndSectionId: values.departmentAndSectionId,
      });
      navigate('/attendance', { replace: true });
    } catch (error) {
      setSubmitError(mapRegisterError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" variant="outlined">
        <Space orientation="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Title level={3} className="auth-title">首次註冊</Title>
            <Paragraph className="auth-subtitle">
              請填寫員工資料，系統將依部門課別代碼自動建立權限。
            </Paragraph>
          </div>

          {optionError && <Alert type="error" showIcon title={optionError} />}
          {submitError && <Alert type="error" showIcon title={submitError} />}

          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              label="員工編號"
              name="employeeNumber"
              rules={[{ required: true, message: '請輸入員工編號' }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="例如 FAC-016" size="large" />
            </Form.Item>

            <Form.Item
              label="姓名"
              name="employeeName"
              rules={[{ required: true, message: '請輸入姓名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="請輸入姓名" size="large" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="employeeEmail"
              rules={[
                { required: true, message: '請輸入 Email' },
                { type: 'email', message: 'Email 格式不正確' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="例如 FAC-016@company.com" size="large" />
            </Form.Item>

            <Form.Item
              label="部門 / 課別"
              name="departmentAndSectionId"
              rules={[{ required: true, message: '請選擇部門課別' }]}
            >
              <Select
                placeholder="請選擇部門與課別"
                options={sectionOptions}
                loading={loadingOptions}
                size="large"
              />
            </Form.Item>

            <Button
              className="auth-submit-btn"
              type="primary"
              htmlType="submit"
              icon={<FormOutlined />}
              loading={submitting}
              disabled={loadingOptions || submitting || Boolean(optionError)}
              block
              size="large"
            >
              送出註冊
            </Button>
          </Form>

          <Text type="secondary">
            已有帳號？
            {' '}
            <Link className="auth-link" to="/">返回登入</Link>
          </Text>
        </Space>
      </Card>
    </div>
  );
}
