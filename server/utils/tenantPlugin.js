/**
 * Tenant isolation plugin: ensures all find queries are scoped by tenantId.
 * Attach to any schema that has tenantId.
 */
module.exports = function tenantPlugin(schema) {
  // 1. Add tenantId field if not present (safety check)
  if (!schema.path('tenantId')) {
    schema.add({ tenantId: { type: String, required: true, index: true } });
  }

  // 2. Pre-find hook: Automatically filter by tenantId from Context or Query
  schema.pre(/^find/, function (next) {
    // If tenantId is explicitly provided in the query, use it.
    // Otherwise, we expect the controller to have injected it via options.
    if (!this.getQuery().tenantId && this.options.tenantId) {
      this.where({ tenantId: this.options.tenantId });
    }
    next();
  });
};
