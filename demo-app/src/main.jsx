import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import App from './App';
import './index.css';
import './styles/global.css';

dayjs.locale('zh-tw');

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
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
