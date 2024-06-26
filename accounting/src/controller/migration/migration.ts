import { AtLeast } from "src/utils/types"

export interface Migration {
  id: string,
  type: "migrations",
  code: string,
  status: "started" | "completed" | "failed",
  source: {
    platform: "integralces",
    url: string, // https://integralces.net
    access_token: string
  },
  created: string,
  updated: string
}

export type CreateMigration = AtLeast<Migration, "code" | "source">