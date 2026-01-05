import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import RequireAdmin from './components/auth/RequireAdmin';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CreateEventPage from './pages/admin/CreateEventPage';
import RoutesPage from './pages/RoutesPage';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Admin Routes */}
            <Route path="admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
            <Route path="admin/events/new" element={<RequireAdmin><CreateEventPage /></RequireAdmin>} />
            <Route path="admin/events/:id/edit" element={<RequireAdmin><CreateEventPage /></RequireAdmin>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
