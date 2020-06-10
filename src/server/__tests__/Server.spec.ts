import "../index";
import Axios from "axios";
import KOptions from "../../komunitin.json";

const urlSocial = KOptions.apis.social;
const urlAccounting = KOptions.apis.accounting;

describe("MirageJS Server", () => {
  it ("includes currency external resource", async () => {
    const response = await Axios.get(`${urlSocial}/GRP0?include=currency`);
    const currency = response.data.included.find((resource: any) => resource.type == "currencies");
    expect(currency.external).toBe(true);
    expect(currency.links.self).toBe(`${urlAccounting}/GRP0/currency`);
    expect(currency.attributes).toBeUndefined();
    expect(currency.relationships).toBeUndefined();
  });

  it("includes account external resource", async() => {
    const response = await Axios.get(`${urlSocial}/GRP0/members/JayceGloverDDS.Rolfson96?include=account`);
    const account = response.data.included.find((resource: any) => resource.type == "accounts");
    expect(account.external).toBe(true);
    expect(account.links.self).toBe(`${urlAccounting}/GRP0/accounts/GRP00000`);
    expect(account.attributes).toBeUndefined();
    expect(account.relationships).toBeUndefined();
  });
})