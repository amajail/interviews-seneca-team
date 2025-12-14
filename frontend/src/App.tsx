/**
 * App Component
 * Main application component with routing configuration
 * Follows clean architecture and SRP
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Dashboard, CandidateList, CandidateDetail, AddCandidate } from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="candidates" element={<CandidateList />} />
          <Route path="candidates/new" element={<AddCandidate />} />
          <Route path="candidates/:id" element={<CandidateDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
