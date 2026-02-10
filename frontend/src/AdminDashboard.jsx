import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './components/Layout';

export default function AdminDashboard() {
  // Placeholder for admin dashboard (replace with backend integration)
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="mb-2">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
            ← Back to store
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">$2,500</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-xl font-bold text-gray-900">120</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-500">Active Subscriptions</p>
            <p className="text-xl font-bold text-gray-900">35</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Orders</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-center justify-between">
              <span>Order #1234</span>
              <span className="font-semibold text-gray-900">$49</span>
              <span className="text-green-600">Paid</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Order #1233</span>
              <span className="font-semibold text-gray-900">$150</span>
              <span className="text-green-600">Paid</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
