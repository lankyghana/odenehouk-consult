
import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import ProductCard from './components/ProductCard';

function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-gray-500">
      <a href="#" className="hover:text-gray-700 underline">Privacy Policy</a>
    </footer>
  );
}

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="lg:grid lg:grid-cols-[320px,1fr] lg:gap-8">
        <aside className="w-full">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center space-y-4 border border-gray-100">
            <img
              src="/odenehouk-logo.svg"
              alt="Creator avatar"
              className="w-28 h-28 rounded-full mx-auto object-cover bg-white p-2 shadow-sm"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 font-serif">OdenehoUK Consultancy</h1>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">Helping you succeed with digital products, coaching, and more.</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-gray-600">
              <a href="#" aria-label="Instagram" className="hover:text-gray-800" title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0Z"/><circle cx="17" cy="7" r="1" /></svg>
              </a>
              <a href="#" aria-label="TikTok" className="hover:text-gray-800" title="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 4c.3 1.7 1.5 3.1 3.1 3.6v3.1a6.5 6.5 0 0 1-3.1-.9v4.5a6.5 6.5 0 1 1-6.5-6.5h.4v3a3.5 3.5 0 1 0 3 3.4V4h3.1Z"/></svg>
              </a>
              <a href="mailto:info@odenehouk.com" aria-label="Email" className="hover:text-gray-800" title="Email">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="m5 7 7 5 7-5"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-gray-800" title="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.4 2.4 0 0 0-1.7-1.7C18.1 5 12 5 12 5s-6.1 0-7.9.5a2.4 2.4 0 0 0-1.7 1.7C2 9 2 12 2 12s0 3 .4 4.8c.2.8.9 1.4 1.7 1.7 1.8.5 7.9.5 7.9.5s6.1 0 7.9-.5c.8-.3 1.5-.9 1.7-1.7.4-1.8.4-4.8.4-4.8s0-3-.4-4.8ZM10 15V9l5 3-5 3Z"/></svg>
              </a>
            </div>
          </div>
        </aside>

        <section className="flex-1 mt-8 lg:mt-0">
          {loading && <div className="text-center text-gray-500 py-12">Loading products...</div>}
          {error && <div className="text-center text-red-500 py-12">{error}</div>}
          {!loading && !error && products.length === 0 && (
            <div className="text-center text-gray-500 py-12">No products available.</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} ctaLabel="Learn More & Buy" />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </Layout>
  );
}

export { TrustSection, Footer };
