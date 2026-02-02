import crypto from "crypto";

function encryptMessage(message, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);

  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    salt: salt.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
  };
}

function decryptMessage(data, password) {
  const key = crypto.pbkdf2Sync(
    password,
    Buffer.from(data.salt, "hex"),
    100000,
    32,
    "sha256"
  );

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(data.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(data.authTag, "hex"));

  let decrypted = decipher.update(data.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

function safeDecrypt(data, password) {
  try {
    return JSON.parse(decryptMessage(data, password));
  } catch {
    return null;
  }
}

export default { encryptMessage, safeDecrypt };

