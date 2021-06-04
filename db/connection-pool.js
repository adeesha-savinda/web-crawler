import mysql from 'mysql2';
import config from 'config';

export default mysql.createPool({
    connectionLimit : 20,
    host            : config.database.host,
    database        : config.database.name,
    user            : config.database.user,
    password        : config.database.password,
}); 