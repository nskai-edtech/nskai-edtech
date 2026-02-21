import { db } from "./lib/db";
async function main() {
  const paths = await db.query.learningPaths.findMany();
  console.log("PATHS:", paths);
}
main();
