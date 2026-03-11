import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { IntlProvider } from 'react-intl';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocaleProvider, useLocale } from './contexts/LocaleContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

import frMessages from './locales/fr.json';
import enMessages from './locales/en.json';
import itMessages from './locales/it.json';

const messages = {
  fr: frMessages,
  en: enMessages,
  it: itMessages,
};

function AppContent() {
  const { locale } = useLocale();

  return (
    <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="en²">
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: '8px' },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    </IntlProvider>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  );
}
