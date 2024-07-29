const crypto = require("crypto");

function generateEncryptionKey() {
  return crypto.randomBytes(32).toString("hex");
}

const encryptionKey = generateEncryptionKey();
console.log("Your new encryption key:", encryptionKey);
