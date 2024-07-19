import { hkdf, generateKey, KeyObject, createSecretKey, createCipheriv, randomBytes, createDecipheriv, createPrivateKey, createPublicKey } from "node:crypto";
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
    generateKey('aes', {length: 256}, (err, key) => {
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

export const importEd25519RawPrivateKey = async (key: Buffer) => {
  // Node does not provide a way to import raw Ed25519 keys, so we need to create a DER encoded key

  // The DER encoding of an Ed25519 key is a binary sequence containing a fixed header identifying 
  // the key type and the key itself. The key is a 32 byte sequence.
  const header = Buffer.from([
    0x30, 0x2e, 0x02, 0x01, 
    0x00, 0x30, 0x05, 0x06, 
    0x03, 0x2b, 0x65, 0x70, 
    0x04, 0x22, 0x04, 0x20
  ])
  const der = Buffer.concat([header, key])
 
  // Create a byte sequence containing the OID and key
  const keyObj = createPrivateKey({
    key: der,
    format: "der",
    type: "pkcs8",
  })

  return keyObj
}

export const importEd25519RawPublicKey = async (key: Buffer) => {
  // The DER encoding of an Ed25519 key is a binary sequence containing a fixed header identifying 
  // the key type and the key itself. The key is a 32 byte sequence.
  const header = Buffer.from([
    0x30, 0x2a, 0x30, 0x05,
    0x06, 0x03, 0x2b, 0x65,
    0x70, 0x03, 0x21, 0x00
  ])
  const der = Buffer.concat([header, key])
 
  // Create a byte sequence containing the OID and key
  const keyObj = createPublicKey({
    key: der,
    format: "der",
    type: "spki",
  })

  return keyObj
}


