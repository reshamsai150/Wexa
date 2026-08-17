import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Skills from './pages/Skills';
import Profile from './pages/Profile';
import GraphExplorer from './pages/GraphExplorer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="skills" element={<Skills />} />
          <Route path="profile" element={<Profile />} />
          <Route path="explore" element={<GraphExplorer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
