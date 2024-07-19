import { checkExact, matchedData, ValidationChain, validationResult } from "express-validator"
import { describe, it } from "node:test"
import assert from "node:assert"
import { Validators } from "src/server/validation"
import { validateInput } from "src/server/parse"

describe('Input validation', async () => {

  const testValidation = async (chain: ValidationChain[], input: any, output: any | false = input) => {
    const req = {
      query: {},
      body: input,
      params: {},
      param: (name: string) => undefined,
    }
    return new Promise((resolve) => {
      checkExact(chain)(req, {}, () => {
        let data
        let err
        try {
          data = validateInput(req as any)
          err = false
        } catch (e) {
          err = true
        }
        
        if (output === false && !err) {
          assert.fail("Expected validation error")
        } else if (output === false && err) {
          assert.ok(err)
        } else if (err) {
          assert.fail("Unexpected validation error")
        } else {
          assert.deepEqual(data, output)
        }
        resolve(void 0)
      })
    })
  }

  await it('account data', async () => {
    await testValidation(Validators.isCreateAccount(), {
      data: {}
    })
  })

  await it('update transfer', async () => {
    await testValidation(Validators.isUpdateTransfer(), {
      data: {
        attributes: {
          state: "committed"
        }
      }
    })
    
    await testValidation(Validators.isUpdateTransfer(), {
      data: {
        id: "error",
        attributes: {
          state: "committed"
        }
      }
    }, false)

    await testValidation(Validators.isUpdateTransfer(), {
      data: {
        attributes: {
          state: "committed",
          id: "error"
        }
      }
    }, false)

  })
})