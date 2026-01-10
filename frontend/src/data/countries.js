import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const countries = getCountries().map((countryCode) => {
  try {
    return {
      name: regionNames.of(countryCode),
      code: countryCode,
      dial_code: `+${getCountryCallingCode(countryCode)}`,
    };
  } catch (error) {
    return null;
  }
})
.filter(Boolean) 
.sort((a, b) => a.name.localeCompare(b.name)); 
