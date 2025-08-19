const express = require('express');
const path = require('path');
const mime = require('mime-types');

module.exports = function(app) {
  // Налаштування для статичних файлів зображень
  app.use('/images', (req, res, next) => {
    const filePath = path.join(__dirname, '../public/images', req.path);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    
    // Встановлюємо правильний content-type
    res.set('Content-Type', mimeType);
    
    // Встановлюємо заголовки для відключення кешування
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('ETag', false);
    
    // Логування вимкнено для чистого терміналу
    
    next();
  }, express.static(path.join(__dirname, '../public/images'), {
    etag: false,
    lastModified: false,
    cacheControl: false,
    maxAge: 0
  }));
  
  // console.log вимкнено для чистого терміналу
};