exports.requireRole = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Hanya admi dan guru yang boleh melakukan aksi ini' });
  }
  next();
};

exports.EditStudent = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowed.includes(req.user.role)) {
        return res.status(403).json({ message: 'Hanya admin dan Walimurid yang boleh melakukan aksi ini' });
    }
    next();
};