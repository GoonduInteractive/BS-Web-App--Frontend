/**
 * The account a bank transfer is meant to reach.
 *
 * ⚠ THESE DETAILS ARE TRANSCRIBED FROM A FIGMA MOCK AND ARE NOT VERIFIED. ⚠
 *
 * This is the one file in the build where being wrong costs a visitor money. A
 * screen that shows an account number beside the words "Transfer exact amount to
 * avoid failure" is an instruction to send real funds somewhere. If this number
 * is a placeholder, a stand-in, or simply mistyped in the design file, someone
 * following it loses their money and Goondu never receives it.
 *
 * So: nothing here may go to a public build until Goondu confirms the account in
 * writing. It lives behind an adapter rather than in a component so there is
 * exactly one place to correct, and so a real payment provider can replace it
 * without touching the screen.
 *
 * There is no payment integration in this phase. Nothing is charged, no amount
 * is reserved, and no reference is generated against a real ledger.
 */

export type TransferAccount = {
  accountNumber: string;
  bankName: string;
  beneficiary: string;
};

export async function getTransferAccount(): Promise<TransferAccount> {
  return {
    accountNumber: "4878502274",
    bankName: "MONIEPOINT",
    beneficiary: "GOONDU GAMES/BEYOND SERVICE",
  };
}
