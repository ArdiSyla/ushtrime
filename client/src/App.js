import React from 'react';
import Login from './views/Login';
import Register from './views/Register';
import AddEditExpense from './views/AddEditExpense';
import Dashboard from './views/Dashboard';
import AddEditIncome from './views/AddEditIncome';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import IncomeDashboard from './views/IncomeDashboard';
import BudgetDashboard from './views/BudgetDashboard';
import BudgetTrackerPage from './views/BudgetTrackerPage';




function App() {
  return (
   <Router>
    <div>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="expense/add" element={<AddEditExpense />} />
          <Route path="/expense/edit/:id" element={<AddEditExpense />} />
          <Route path="/income" element={<IncomeDashboard />} />
          <Route path="/income/add" element={<AddEditIncome />} />
          <Route path="/income/edit/:id" element={<AddEditIncome />} />
          <Route path="/budget" element={<BudgetDashboard />} />
          <Route path="/budget-tracker" element={<BudgetTrackerPage />} />

      </Routes>
    </div>
   </Router>
  );
}

export default App;
