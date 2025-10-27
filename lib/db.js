import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Por defecto XAMPP no tiene contraseña
  database: 'directorio_servicios',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;