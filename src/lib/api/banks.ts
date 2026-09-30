/**
 * Banks a player can be paid into, for Payout Settings.
 *
 * Mock, like every other adapter here, and deliberately real: Nigerian banks
 * and the fintechs players actually use, by their own names. Live, this comes
 * from Paystack's bank list (`GET /bank?country=nigeria`), which also gives
 * each bank the code account verification needs; `code` here is a slug until
 * then.
 */

export type Bank = { code: string; name: string };

const BANKS: readonly Bank[] = [
  "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank", "First Bank of Nigeria",
  "First City Monument Bank", "Globus Bank", "Guaranty Trust Bank", "Jaiz Bank", "Keystone Bank",
  "Kuda Microfinance Bank", "Lotus Bank", "Moniepoint Microfinance Bank", "OPay", "PalmPay",
  "Parallex Bank", "Polaris Bank", "Premium Trust Bank", "Providus Bank", "Stanbic IBTC Bank",
  "Standard Chartered Bank", "Sterling Bank", "SunTrust Bank", "TAJBank", "Titan Trust Bank",
  "Union Bank of Nigeria", "United Bank for Africa", "Unity Bank", "Wema Bank", "Zenith Bank",
].map((name) => ({ code: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name }));

export async function getBanks(): Promise<readonly Bank[]> {
  return BANKS;
}
