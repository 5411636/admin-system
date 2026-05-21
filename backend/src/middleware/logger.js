const { db } = require('../config');

// 记录操作日志
const logOperation = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const log = {
      id: db.nextId.log++,
      userId: req.user?.id || null,
      username: req.user?.username || 'anonymous',
      action: req.method + ' ' + req.path,
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      statusCode: res.statusCode,
      duration: duration,
      createdAt: new Date().toISOString()
    };

    db.logs.push(log);

    // 只保留最近1000条日志
    if (db.logs.length > 1000) {
      db.logs = db.logs.slice(-1000);
    }
  });

  next();
};

module.exports = { logOperation };