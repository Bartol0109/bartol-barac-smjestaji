const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Authorization header missing',
        code: 'NO_AUTH_HEADER'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: 'Token missing from Authorization header',
        code: 'NO_TOKEN'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyToken, isAdmin }; 