import fs from 'fs/promises';
import path from 'path';
import { District } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DISTRICTS_FILE = path.join(DATA_DIR, 'districts.json');


async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readDistricts(): Promise<District[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(DISTRICTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    
    return [];
  }
}

export async function writeDistricts(districts: District[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DISTRICTS_FILE, JSON.stringify(districts, null, 2));
}

export async function getNextDistrictId(): Promise<number> {
  const districts = await readDistricts();
  return districts.length > 0 ? Math.max(...districts.map(d => d.id)) + 1 : 1;
}