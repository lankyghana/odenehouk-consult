import React from 'react';
import { Link } from 'react-router-dom';

const fallbackThumbs = {
  'demo-1': 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=400&q=80',
  'demo-2': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=400&q=80',
};

export default function ProductCard({ product, ctaLabel = 'Buy Now' }) {
  const thumb = product.image || fallbackThumbs[product.id] || 'https://placehold.co/160x160?text=Product';

  return (
    <article className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3 h-full border border-gray-100">
      <div className="flex items-start gap-3">
        <img
          src={thumb}
          alt={product.title}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">{product.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">{product.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-gray-900">
        <span className="text-lg font-bold text-[#3b28d6]">${product.price}</span>
      </div>

      <Link
        to={`/product/${product.id}`}
        className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#3b28d6] text-white font-semibold rounded-full shadow-md hover:bg-[#2d1fb0] transition-colors"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
