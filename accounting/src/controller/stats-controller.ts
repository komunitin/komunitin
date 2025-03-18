import { Context } from "src/utils/context";
import { AbstractCurrencyController } from "./abstract-currency-controller"
import { CollectionOptions, StatsOptions } from "src/server/request";
import { Stats, StatsInterval } from "src/model/stats";

export class StatsController extends AbstractCurrencyController {

  private async getVolumeSingleValue(from: Date|undefined, to: Date) {
    const value = await this.db().transfer.aggregate({
      _sum: {
        amount: true
      },
      where: {
        updated: {
          gte: from,
          lt: to
        }
      }
    })
    return Number(value._sum.amount) ?? 0
  }

  private async getVolumeValues(from: Date, to: Date, interval: StatsInterval): Promise<number[]> {
    const sqlInterval = this.getSqlInterval(interval)
    const sqlDatePart = this.getSqlDatePart(interval)

    const query = await this.db().$queryRaw`
      WITH "Intervals" AS (
        SELECT generate_series(
          date_trunc(${sqlDatePart}, ${from}::timestamp),
          ${to}::timestamp - '1 second'::interval,
          ${sqlInterval}::interval
        ) AS "interval" 
      )
      SELECT i."interval" AS "interval", COALESCE(SUM(t."amount"), 0) AS "amount"
      FROM "Intervals" i
      LEFT JOIN "Transfer" t ON t."updated" >= i."interval" AND t."updated" < LEAST(i."interval" + ${sqlInterval}::interval, ${to}::timestamp)
      GROUP BY i."interval"
      ORDER BY i."interval"
      ` as Array<{ interval: Date, amount: number }>;
    
    return query.map(r => r.amount)
  }

  private async getFirstDate() {
    const value = await this.db().transfer.aggregate({
      _min: {
        updated: true
      }
    })
    return value._min.updated ?? new Date()
  }

  private getSqlInterval(interval: StatsInterval) {
    switch (interval) {
      case 'PT1H':
        return "1 hour"
      case 'P1D':
        return "1 day"
      case 'P1W':
        return "1 week"
      case 'P1M':
        return "1 month"
      case 'P1Y':
        return "1 year"
    }
  }

  private getSqlDatePart(interval: StatsInterval) {
    switch (interval) {
      case 'PT1H':
        return "hour"
      case 'P1D':
        return "day"
      case 'P1W':
        return "week"
      case 'P1M':
        return "month"
      case 'P1Y':
        return "year"
    }
  }

  /**
   * Return the sum of all transaction amounts in one Currency on the period provided by
   * the "from" and "to" parameters and grouped by the parameter "interval".
   * @param ctx 
   * @param params 
   *   - "from": string (date in ISO format) or undefined (from the beginning)
   *   - "to": string (date in ISO format) or undefined (to  the end)
   *   - "interval": string (one of "PT1H", "P1D", "P1W", "P1M", "P1Y" or undefined for single value)
   * @returns 
   */
  public async getVolume(ctx: Context, params: StatsOptions): Promise<Stats> {
    const { from, to, interval } = params

    const toDate = to ?? new Date()

    // No interval, so return single value.
    if (interval === undefined) {
      const value = await this.getVolumeSingleValue(from, toDate)
      return {
        from: from,
        to: toDate,
        values: [value]
      }
    } else {
      // If interval is provided, we need to have an explicit "from" date.
      const fromDate = from ?? await this.getFirstDate()
      const values = await this.getVolumeValues(fromDate, toDate, interval)
      
      return ({
        from: fromDate,
        to: toDate,
        interval: interval,
        values
      })
    }
  }
}