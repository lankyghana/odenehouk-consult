import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './components/Layout';

export default function CustomerDashboard() {
  // Placeholder for customer dashboard (replace with backend integration)
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="mb-2">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
            ← Back to store
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Purchased Products</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Digital Product Example</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>1-on-1 Coaching Session</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Subscriptions</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Membership Subscription (Renews Feb 1, 2026)</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
