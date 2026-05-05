// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Receipts from "./pages/Receipts";

// Additional pages for the full finance system (optional - can be added later)
// import Farmers from "./pages/Farmers";
// import Buyers from "./pages/Buyers";
// import Transactions from "./pages/Transactions";
// import StockManagement from "./pages/StockManagement";
// import Orders from "./pages/Orders";
// import Deliveries from "./pages/Deliveries";
// import Payments from "./pages/Payments";
// import Reports from "./pages/Reports";
import Login from "./auth/Login";

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!token || isLoggedIn !== "true") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No authentication needed */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/"
          element={
           <PrivateRoute>
              <Layout />
           </PrivateRoute>
              
          
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="account" element={<Account />} />
          <Route path="receipts" element={<Receipts />} />
          
          {/* Additional routes for full finance system (uncomment when needed) */}
          {/* <Route path="farmers" element={<Farmers />} />
          <Route path="buyers" element={<Buyers />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="orders" element={<Orders />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} /> */}
        </Route>

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;