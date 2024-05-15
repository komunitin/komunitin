import { hkdf, generateKey, KeyObject, createSecretKey, createCipheriv, randomBytes, createDecipheriv } from "node:crypto";
/**
 * Derive a 32 byte key from a password and a salt
 * @param password 
 * @param salt 
 */
export const deriveKey = async (password: string, salt: string) => {
  return new Promise<KeyObject>((resolve, reject) => {
    hkdf("sha512", Buffer.from(password), Buffer.from(salt), Buffer.from("komunitin.org"), 32, (err, key) => {
      if (err) {
        reject(err)
      } else {
        resolve(createSecretKey(new Uint8Array(key)))
      }
    })  
  })
}

/**
 * Generate a random 32 byte key
 */
export const randomKey = async () => {
  return new Promise<KeyObject>((resolve, reject) => {
    generateKey('aes', {length: 64}, (err, key) => {
      if (err) {
        reject(err)
      } else {
        resolve(key)
      }
    })
  })
}

/**
 * Symmetrically encrypt a secret
 */
export const encrypt = async (secret: string, key: KeyObject) => {
  return new Promise<string>((resolve, reject) => {
    randomBytes(12, (err, iv) => {
      if (err) {
        reject(err)
      }
      try {
        const cipher = createCipheriv("aes-256-gcm", key, iv)
        const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()])
        const tag = cipher.getAuthTag()
        resolve(Buffer.concat([iv, tag, encrypted]).toString("hex"))
      } catch (e) {
        reject(e)
      }
    })
  })
}

/**
 * Symmetrically decrypt a secret
 * 
 * The function is async for consistency with the encrypt function, but resolves synchronously.
 */
export const decrypt = async (encrypted: string, key: KeyObject) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const buffer = Buffer.from(encrypted, "hex")
      const iv = buffer.subarray(0, 12)
      const tag = buffer.subarray(12, 28)
      const encryptedData = buffer.subarray(28)
      const decipher = createDecipheriv("aes-256-gcm", key, iv)
      decipher.setAuthTag(tag)
      const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])
      resolve(decrypted.toString("utf8"))
    } catch (e) {
      reject(e)
    }
  })
}

export const exportKey = (key: KeyObject) => {
  return key.export().toString("hex")
}

export const importKey = (key: String) => {
  return createSecretKey(Buffer.from(key, "hex"))
}
