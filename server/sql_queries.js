const pool = require('./database');

async function getUserTasks(user_id) {
    const result = await pool.query(`SELECT * FROM assignments WHERE user_id = $1`, [user_id]);
    return result.rows;

}


module.exports = { getUserTasks };