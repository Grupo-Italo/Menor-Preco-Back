const pool = require('../db');

exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM usuarios');
    return result.rows;
};

// exports.create = async (nome, email) => {
//     const result = await pool.query(
//         'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
//         [nome, email]
//     );
//     return result.rows[0];
// };

// exports.update = async (id, nome, email) => {
//     await pool.query(
//         'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3',
//         [nome, email, id]
//     );
// };

// exports.delete = async (id) => {
//     await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
// };
