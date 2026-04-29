import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { UserOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const { Title, Paragraph, Text } = Typography;

function mapIdentifyError(error) {
  if (error.status === 401) {
    return {
      type: 'warning',
      message: '找不到此員工，是否前往註冊？',
      canRegister: true,
    };
  }

  if (error.status === 403) {
    return {
      type: 'error',
      message: '此帳號尚未啟用，請聯絡管理員。',
      canRegister: false,
    };
  }

  if (error.status === 429) {
    return {
      type: 'error',
      message: '嘗試次數過多，請稍後再試。',
      canRegister: false,
    };
  }

  return {
    type: 'error',
    message: error.message || '登入失敗，請稍後再試。',
    canRegister: false,
  };
}

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, tryOidcLogin, identifyLogin } = useAuth();
  const [checkingOidc, setCheckingOidc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const ranOidcRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/attendance', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (ranOidcRef.current) {
      return;
    }
    ranOidcRef.current = true;

    const runOidc = async () => {
      setCheckingOidc(true);
      try {
        const success = await tryOidcLogin();
        if (success) {
          navigate('/attendance', { replace: true });
          return;
        }
      } finally {
        setCheckingOidc(false);
      }
    };

    runOidc();
  }, [navigate, tryOidcLogin]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      await identifyLogin(values.employeeNumber.trim());
      navigate('/attendance', { replace: true });
    } catch (error) {
      setFeedback(mapIdentifyError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" variant="outlined">
        <Space orientation="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Title level={3} className="auth-title">廠務管理平台</Title>
            <Paragraph className="auth-subtitle">
              先嘗試 OIDC 驗證，若失敗可使用員工編號登入。
            </Paragraph>
          </div>

          {checkingOidc && (
            <Alert
              type="info"
              showIcon
              title="正在嘗試 OIDC 登入，若失敗將自動切換備援登入。"
            />
          )}

          {feedback && (
            <Alert
              type={feedback.type}
              showIcon
              title={feedback.message}
              action={
                feedback.canRegister ? (
                  <Button size="small" type="link" onClick={() => navigate('/register')}>
                    前往註冊
                  </Button>
                ) : null
              }
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              label="員工編號"
              name="employeeNumber"
              rules={[{ required: true, message: '請輸入員工編號' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="例如 FAC-001"
                autoComplete="username"
                size="large"
              />
            </Form.Item>

            <Button
              className="auth-submit-btn"
              type="primary"
              htmlType="submit"
              icon={<LoginOutlined />}
              loading={submitting}
              disabled={checkingOidc || submitting}
              block
              size="large"
            >
              員工編號登入
            </Button>
          </Form>

          <Text type="secondary">
            首次使用？
            {' '}
            <Link className="auth-link" to="/register">前往註冊</Link>
          </Text>
        </Space>
      </Card>
    </div>
  );
}
