import db from '../db/connection-pool';

export default class Locations{
    static selectAll(){
        const sql = 'SELECT * FROM locations';
        return db.promise().execute(sql);
    }
};