/* eslint-disable camelcase */
exports.up = (pgm) => {
  // users
  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    uuid: { type: 'uuid', notNull: true, unique: true },
    name: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(20)', notNull: true },
    email_verified_at: { type: 'timestamp' },
    status: { type: 'varchar(20)', notNull: true, default: 'active' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  // products
  pgm.createTable('products', {
    id: { type: 'serial', primaryKey: true },
    uuid: { type: 'uuid', notNull: true, unique: true },
    title: { type: 'varchar(255)', notNull: true },
    slug: { type: 'varchar(255)', notNull: true, unique: true },
    description: { type: 'text' },
    type: { type: 'varchar(30)', notNull: true },
    price: { type: 'decimal(10,2)', notNull: true },
    currency: { type: 'varchar(3)', notNull: true, default: 'USD' },
    billing_cycle: { type: 'varchar(20)' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  // product_files
  pgm.createTable('product_files', {
    id: { type: 'serial', primaryKey: true },
    product_id: { type: 'integer', notNull: true },
    file_path: { type: 'varchar(512)', notNull: true },
    file_type: { type: 'varchar(20)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('product_files', 'fk_product_files_product', 'FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE');

  // orders
  pgm.createTable('orders', {
    id: { type: 'serial', primaryKey: true },
    uuid: { type: 'uuid', notNull: true, unique: true },
    user_id: { type: 'integer', notNull: true },
    total_amount: { type: 'decimal(10,2)', notNull: true },
    currency: { type: 'varchar(3)', notNull: true },
    payment_status: { type: 'varchar(20)', notNull: true },
    payment_provider: { type: 'varchar(50)', notNull: true },
    provider_payment_id: { type: 'varchar(100)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('orders', 'fk_orders_user', 'FOREIGN KEY(user_id) REFERENCES users(id)');

  // order_items
  pgm.createTable('order_items', {
    id: { type: 'serial', primaryKey: true },
    order_id: { type: 'integer', notNull: true },
    product_id: { type: 'integer', notNull: true },
    price: { type: 'decimal(10,2)', notNull: true },
    quantity: { type: 'integer', notNull: true, default: 1 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('order_items', 'fk_order_items_order', 'FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE');
  pgm.addConstraint('order_items', 'fk_order_items_product', 'FOREIGN KEY(product_id) REFERENCES products(id)');

  // subscriptions
  pgm.createTable('subscriptions', {
    id: { type: 'serial', primaryKey: true },
    uuid: { type: 'uuid', notNull: true, unique: true },
    user_id: { type: 'integer', notNull: true },
    product_id: { type: 'integer', notNull: true },
    provider_subscription_id: { type: 'varchar(100)' },
    status: { type: 'varchar(20)', notNull: true },
    billing_cycle: { type: 'varchar(20)', notNull: true },
    started_at: { type: 'timestamp', notNull: true },
    ends_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('subscriptions', 'fk_subscriptions_user', 'FOREIGN KEY(user_id) REFERENCES users(id)');
  pgm.addConstraint('subscriptions', 'fk_subscriptions_product', 'FOREIGN KEY(product_id) REFERENCES products(id)');

  // access_permissions
  pgm.createTable('access_permissions', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', notNull: true },
    product_id: { type: 'integer', notNull: true },
    order_id: { type: 'integer', notNull: true },
    granted_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    expires_at: { type: 'timestamp' },
  });
  pgm.addConstraint('access_permissions', 'fk_access_user', 'FOREIGN KEY(user_id) REFERENCES users(id)');
  pgm.addConstraint('access_permissions', 'fk_access_product', 'FOREIGN KEY(product_id) REFERENCES products(id)');
  pgm.addConstraint('access_permissions', 'fk_access_order', 'FOREIGN KEY(order_id) REFERENCES orders(id)');

  // coaching_sessions
  pgm.createTable('coaching_sessions', {
    id: { type: 'serial', primaryKey: true },
    uuid: { type: 'uuid', notNull: true, unique: true },
    product_id: { type: 'integer', notNull: true },
    user_id: { type: 'integer', notNull: true },
    scheduled_at: { type: 'timestamp', notNull: true },
    duration_minutes: { type: 'integer', notNull: true },
    meeting_link: { type: 'varchar(512)' },
    status: { type: 'varchar(20)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('coaching_sessions', 'fk_coaching_product', 'FOREIGN KEY(product_id) REFERENCES products(id)');
  pgm.addConstraint('coaching_sessions', 'fk_coaching_user', 'FOREIGN KEY(user_id) REFERENCES users(id)');

  // payments
  pgm.createTable('payments', {
    id: { type: 'serial', primaryKey: true },
    order_id: { type: 'integer', notNull: true },
    provider: { type: 'varchar(50)', notNull: true },
    provider_transaction_id: { type: 'varchar(100)' },
    amount: { type: 'decimal(10,2)', notNull: true },
    currency: { type: 'varchar(3)', notNull: true },
    status: { type: 'varchar(20)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('payments', 'fk_payments_order', 'FOREIGN KEY(order_id) REFERENCES orders(id)');

  // email_logs
  pgm.createTable('email_logs', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', notNull: true },
    email_type: { type: 'varchar(50)', notNull: true },
    sent_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    status: { type: 'varchar(20)' },
  });
  pgm.addConstraint('email_logs', 'fk_email_user', 'FOREIGN KEY(user_id) REFERENCES users(id)');

  // audit_logs
  pgm.createTable('audit_logs', {
    id: { type: 'serial', primaryKey: true },
    admin_id: { type: 'integer', notNull: true },
    action: { type: 'varchar(255)', notNull: true },
    entity_type: { type: 'varchar(50)', notNull: true },
    entity_id: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('audit_logs', 'fk_audit_admin', 'FOREIGN KEY(admin_id) REFERENCES users(id)');

  // webhook_events
  pgm.createTable('webhook_events', {
    id: { type: 'serial', primaryKey: true },
    event_id: { type: 'varchar(100)', notNull: true, unique: true },
    type: { type: 'varchar(100)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  // refresh_tokens
  pgm.createTable('refresh_tokens', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', notNull: true },
    token_hash: { type: 'varchar(255)', notNull: true, unique: true },
    revoked: { type: 'boolean', notNull: true, default: false },
    expires_at: { type: 'timestamp', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('refresh_tokens', 'fk_refresh_user', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');

  // Indexes
  pgm.createIndex('users', 'email', { name: 'idx_users_email' });
  pgm.createIndex('products', 'slug', { name: 'idx_products_slug' });
  pgm.createIndex('orders', 'provider_payment_id', { name: 'idx_orders_provider_payment_id' });
  pgm.createIndex('subscriptions', 'provider_subscription_id', { name: 'idx_subscriptions_provider_subscription_id' });
  pgm.createIndex('access_permissions', ['user_id', 'product_id'], { name: 'idx_access_permissions_user_product' });
};

exports.down = (pgm) => {
  pgm.dropIndex('access_permissions', 'idx_access_permissions_user_product');
  pgm.dropIndex('subscriptions', 'idx_subscriptions_provider_subscription_id');
  pgm.dropIndex('orders', 'idx_orders_provider_payment_id');
  pgm.dropIndex('products', 'idx_products_slug');
  pgm.dropIndex('users', 'idx_users_email');

  pgm.dropTable('refresh_tokens');
  pgm.dropTable('webhook_events');
  pgm.dropTable('audit_logs');
  pgm.dropTable('email_logs');
  pgm.dropTable('payments');
  pgm.dropTable('coaching_sessions');
  pgm.dropTable('access_permissions');
  pgm.dropTable('subscriptions');
  pgm.dropTable('order_items');
  pgm.dropTable('orders');
  pgm.dropTable('product_files');
  pgm.dropTable('products');
  pgm.dropTable('users');
};
