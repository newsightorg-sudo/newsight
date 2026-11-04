import { seedDatabase } from './seed';

async function main() {
  await seedDatabase();
  console.log('Seed executed successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
