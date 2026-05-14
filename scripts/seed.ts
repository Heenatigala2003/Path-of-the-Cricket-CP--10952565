import { readDistricts, writeDistricts } from '../lib/dataStore';
import { District } from '../lib/types';

const BOYS_DISTRICTS: Omit<District, 'gender'>[] = [ /* ... */ ];
const GIRLS_DISTRICTS: Omit<District, 'gender'>[] = [ /* ... */ ];

async function seed() {
  const boysWithGender: District[] = BOYS_DISTRICTS.map(d => ({ ...d, gender: 'boys' }));
  const girlsWithGender: District[] = GIRLS_DISTRICTS.map(d => ({ ...d, gender: 'girls' }));
  await writeDistricts([...boysWithGender, ...girlsWithGender]);
  console.log('Data seeded');
}

seed();