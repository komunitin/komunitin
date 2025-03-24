import { TransferController } from "./transfer-controller";
import { Context } from "../utils/context";
import { CreditCommonsTrunkwardNode } from "@prisma/client";
// FIXME: stopgap
export class CreditCommonsController extends TransferController {
  async createCreditCommonsTrunkwardNode(ctx: Context, ccNodeName: string, lastHash: string): Promise<CreditCommonsTrunkwardNode> {
    return {
      ccNodeName,
      lastHash
    } as CreditCommonsTrunkwardNode;
  }
}