import { generateKeyPairSync } from "node:crypto"
import { SignJWT, JSONWebKeySet } from "jose"
import { config } from "../../src/config"
import { Scope } from "src/server/auth"

const keys = generateKeyPairSync("rsa", {
  modulusLength: 2048,
})

export async function token(user: string, scopes?: Scope[]) {
  const payload = {} as Record<string, string>
  if (scopes) {
    payload.scope = scopes.join(" ")
  }
  const token = await new SignJWT(payload)
    .setAudience(config.AUTH_JWT_AUDIENCE)
    .setIssuer(config.AUTH_JWT_ISSUER)
    .setSubject(user)
    .setIssuedAt()
    .setExpirationTime("1h")
    .setProtectedHeader({alg: "RS256"})
    .sign(keys.privateKey)
  return token
}

export function jwks(): JSONWebKeySet {
  return {
    keys: [keys.publicKey.export({
      format: "jwk"
    })]
  }
}