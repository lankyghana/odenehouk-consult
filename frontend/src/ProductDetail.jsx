
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { apiPost } from './utils/api';
import Layout from './components/Layout';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleCheckout = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    setProcessing(true);
    try {
      const data = await apiPost('/api/checkout/create-session', {
        productId: product.id
      });
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert(e.message || 'Checkout failed');
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          ← Back to store
        </Link>

        {loading && <div className="text-center text-gray-500 py-12">Loading product...</div>}
        {error && <div className="text-center text-red-500 py-12">{error}</div>}

        {!loading && !error && product && (
          <div className="bg-white rounded-2xl shadow-md p-5 md:p-6">
            <img
              src={product.image || 'https://placehold.co/800x500?text=Product'}
              alt={product.title}
              className="w-full rounded-xl mb-5 object-cover"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}
            </h1>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{product.description}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-extrabold text-[#3b28d6]">${product.price}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-[#3b28d6] text-white font-semibold py-3 rounded-full hover:bg-[#2d1fb0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Buy Now'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">Secure checkout powered by Stripe</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
