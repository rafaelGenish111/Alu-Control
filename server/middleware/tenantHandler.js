const DEFAULT_TENANT_ID = 'default_glass_dynamics';

/**
 * Tenant handler middleware.
 * Run AFTER authMiddleware (protect). Expects req.user to exist.
 * Extracts tenantId from the authenticated user and attaches it to req.tenantId.
 * If user has no tenantId (pre-migration), falls back to DEFAULT_TENANT_ID.
 */
const setTenantFromUser = (req, res, next) => {
  try {
    if (!req.user) {
      console.log(`🔴 [setTenantFromUser] No user in request`);
      return res.status(401).json({ message: 'Not authorized, user required for tenant context' });
    }
    req.tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    console.log(`🟢 [setTenantFromUser] Tenant set: ${req.tenantId}`);
    next();
  } catch (error) {
    console.log(`🔴 [setTenantFromUser] Error: ${error.message}`);
    res.status(500).json({ message: error.message || 'Tenant resolution failed' });
  }
};

module.exports = { setTenantFromUser, DEFAULT_TENANT_ID };
