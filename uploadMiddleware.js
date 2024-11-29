const multer = require("multer");

const upload = multer({
  limits: {
    fieldSize: 50000 * 1024 * 1024, // 50000 MB max for field size
    fileSize: 5000 * 1024 * 1024, // 5000 MB max for file size
  },
}).any();

module.exports = upload;
