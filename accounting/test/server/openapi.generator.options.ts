import { HandleResponsesOptions, SPEC_OUTPUT_FILE_BEHAVIOR } from 'express-oas-generator'

export const expressOasGeneratorOptions: HandleResponsesOptions = {
  predefinedSpec: (spec: any) => {
    spec.info = {
      title: 'Komunitin accounting API',
      description: 'API for the Komunitin payments system. This documentation is automatically generated from the serivce test suite.',
      version: '0.0.1',
    }
    spec.servers = [
      {
        url: 'https://accounting.komunitin.org',
        description: 'Production server'
      },
      {
        url: 'https://accounting.demo.komunitin.org',
        description: 'Demo server'
      },
      {
        url: 'http://localhost:2025',
        description: 'Local development server'
      }
    ]
    return spec
  },
  specOutputPath: "openapi/openapi.json",
  specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.PRESERVE,
  swaggerDocumentOptions: {},
  tags: ['currencies', 'currency', 'accounts', 'transfers', 'trustlines', 'migrations'],
}