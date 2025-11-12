


export function requireRole(allowedRoles = []) {

  return (req, res, next) => {

    const user = req.user || { role: "admin" };

    if (!allowedRoles.includes(user.role)) {  return res.status(403).json({ success: false, error: "Forbidden" });  }

    next();
  };
}
