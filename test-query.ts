process.loadEnvFile(".env.local");

async function main() {
  const { db } = await import("./lib/db");
  const paths = await db.query.learningPaths.findMany();
  console.log("Found Paths:", paths);
  process.exit(0);
}

main().catch(console.error);

main().catch(console.error);
