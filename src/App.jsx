// src/App.jsx
import Explore from './pages/Explore';
import CreateRFQ from './pages/CreateRFQ';
import TopUp from './pages/TopUp';
import CreditBadge from './components/CreditBadge';

export default function App() {
  return (
    <>
      <CreditBadge />
      <Explore />
      {/* Router ekleyince sayfaları ayırırız */}
    </>
  );
}
