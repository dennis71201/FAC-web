import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import './styles/global.css';

dayjs.locale('zh-tw');

// Development-only console noise filter:
// This handler is NOT project business logic. It only suppresses a known
// browser-extension message-channel rejection that can appear during navigation.
// Keep this outside feature modules and do not rely on it for app error handling.
if (import.meta.env.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonMessage = String(event.reason?.message || event.reason || '');
    if (reasonMessage.includes('A listener indicated an asynchronous response by returning true')) {
      // Ignore extension-level async channel errors to keep dev console readable.
      event.preventDefault();
    }
  });
}

const theme = {
  token: {
    colorPrimary: '#64748B',
    colorInfo: '#64748B',
    colorSuccess: '#22c55e',
    colorWarning: '#F97316',
    colorError: '#ef4444',
    colorBgLayout: '#F8FAFC',
    colorText: '#334155',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme} locale={zhTW}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
