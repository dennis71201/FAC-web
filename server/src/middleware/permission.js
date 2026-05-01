export function requirePermission(featureName) {
  return (req, res, next) => {
    const permissions = req.user?.permissions || {};
    if (!permissions[featureName]) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Missing permission: ${featureName}`,
        },
      });
    }

    return next();
  };
}
