import { Fragment, useState, useEffect } from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom";

import Menu from './pages/Menu';
import CurrentOrder from './pages/Order';
import AuthPanel from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import OrderHistory from './pages/OrderHistory';
import Waiters from './pages/Waiters';
import DataWatcher from './context/PollingProvider';
import Profile from './pages/Profile';
import PrinterSettings from './pages/PrinterSetting';
import DayReport from './pages/DayReport';
import ProductReport from './pages/ProductReport';
import NewTable from './pages/NewTable';
import NoInternet from './pages/NoInternet';
import { OrderProvider } from './context/OrderContext';
import Reservation from './pages/Reservation';
import Home from './newPages/Home';
import Order from './newPages/Order';

function App() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!online) return <NoInternet />;

  return (
    <Fragment>
      <OrderProvider>
        <DataWatcher>
          <Routes>
            <Route path="/" element={<PublicRoute><AuthPanel /></PublicRoute>} />
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><CurrentOrder /></ProtectedRoute>} />
            <Route path="/orderHistory" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/waiters" element={<ProtectedRoute><Waiters /></ProtectedRoute>} />
            <Route path="/printer" element={<ProtectedRoute><PrinterSettings /></ProtectedRoute>} />
            <Route path="/day_report" element={<ProtectedRoute><DayReport /></ProtectedRoute>} />
            <Route path="/product_report" element={<ProtectedRoute><ProductReport /></ProtectedRoute>} />
            {/* <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/new_order" element={<ProtectedRoute><OrderMenu /></ProtectedRoute>} />
            */}
            <Route path="/reservation" element={<ProtectedRoute><Reservation /></ProtectedRoute>} />
            <Route path="/table" element={<ProtectedRoute><NewTable /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />

          </Routes>
        </DataWatcher>
      </OrderProvider>
    </Fragment>
  );
}

export default App;
