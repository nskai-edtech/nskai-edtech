const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT id FROM learning_path", (err, res) => {
  console.log(err ? err : res.rows);
  pool.end();
});
