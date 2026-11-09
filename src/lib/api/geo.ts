/**
 * Places the checkout's selects offer: Nigeria's states, by their names. The
 * store ships Nigeria-first (overview section 2), so that is the only country
 * listed until Goondu says otherwise.
 */

export type Place = { code: string; name: string };

const NIGERIA_STATES: readonly Place[] = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory",
].map((name) => ({ code: name.toLowerCase().replace(/\s+/g, "-"), name }));

export async function getCountries(): Promise<readonly Place[]> {
  return [{ code: "ng", name: "Nigeria" }];
}

export async function getStates(countryCode: string): Promise<readonly Place[]> {
  return countryCode === "ng" ? NIGERIA_STATES : [];
}
