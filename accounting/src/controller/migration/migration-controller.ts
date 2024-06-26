import { badRequest } from "src/utils/error"
import { migrateFromIntegralces } from "./integralces"
import { CreateMigration, Migration } from "./migration"
import { SharedController } from ".."
import { Context } from "src/utils/context"

export class MigrationController {
  constructor(private readonly controller: SharedController) {}

  async createMigration(ctx: Context, migration: CreateMigration): Promise<Migration> {
    // TODO: store migrations in DB.
    if (migration.source.platform === "integralces") {
      return await migrateFromIntegralces(ctx, this.controller, migration)
    } else {
      throw badRequest(`Unsupported platform ${migration.source.platform}`) 
    }
  }

}