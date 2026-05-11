export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'Administrator') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Administrator role required',
      },
    });
  }
  return next();
}
