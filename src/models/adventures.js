const mysql = require('../utils/mysql_utils');

const ormDef = {
    label: 'Adventure',
    table: 'adventures',
    id_field: 'adventure_id',
    insert_fields: [
        {
            id: 'name',
            quoted: true
        },
        {
            id: 'session_id',
            quoted: false
        },
        {
            id: 'location_id',
            quoted: false
        },
        {
            id: 'character_count',
            quoted: false
        }
    ]
}

async function getView() {
    console.log('entering adventures.getView');
    const connection = await mysql.connection();
    try {
        const sql = `SELECT a.*, s.start_time, l.name AS location_name FROM ${ormDef.table} a, sessions s, locations l WHERE a.session_id = s.session_id AND a.location_id = l.location_id`
        console.log(`DEBUG: getView SQL: ${sql}`)
        let recordList = await connection.query(sql);
        return recordList;
    } catch(err) {
        throw err;
    } finally {
        await connection.release();
    }
}

async function getRecords() {
    console.log('entering getRecords');
    const connection = await mysql.connection();
    try {
        const sql = `SELECT * FROM ${ormDef.table}`
        console.log(`DEBUG: getRecords SQL: ${sql}`)
        let recordList = await connection.query(sql);
        return recordList;
    } catch(err) {
        throw err;
    } finally {
        await connection.release();
    }
}

async function addRecord(data) {
    console.log('addRecord data: ', data);
    const connection = await mysql.connection();
    try {
        let columns = []
        let values = []
        ormDef.insert_fields.forEach(field => {
            columns.push(field.id)
            if (field.quoted) {
                values.push(`'${data[field.id]}'`)
            } else {
                values.push(`${data[field.id]}`)
            }
        })
        const sql = `INSERT INTO ${ormDef.table} (${columns.join(', ')}) VALUES (${values.join(', ')})`;
        console.log(`DEBUG: addRecord SQL: ${sql}`)
        let response = await connection.query(sql);
        return `${ormDef.table} ${data.name} added to database.`;
    } catch (err) {
        throw err
    } finally {
        await connection.release();
    }
}

async function deleteRecord(data) {
    console.log('deleteRecord data: ', data);
    const connection = await mysql.connection();
    try {
        const sql = `DELETE FROM ${ormDef.table} WHERE ${ormDef.id_field} = ${data[ormDef.id_field]}`;
        console.log(`deleteRecord SQL: ${sql}`);
        let response = await connection.query(sql);
        if(response.affectedRows) {
            result = 'deleted from database'
        } else {
            result = 'was not found'
        }
        return `${ormDef.table} ${data[ormDef.id_field]} ${result}.`;
    } catch (err) {
        throw err
    } finally {
        await connection.release();
    }
}


async function updateRecord(record_id, data) {
    console.log(`updateRecord (${record_id}) data: `, data);
    const connection = await mysql.connection();
    try {
        let fieldUpdates = [];
        ormDef.insert_fields.forEach(field => {
            if (field.id in data) {
                if (field.quoted) {
                    fieldUpdates.push(`${field.id} = '${data[field.id]}'`)
                } else {
                    fieldUpdates.push(`${field.id} = ${data[field.id]}`)
                }
            }
        })
        if (fieldUpdates.length == 0) {
            return 'No data to update.';
        }
        const setSql = fieldUpdates.join(', ')
        const sql = `UPDATE ${ormDef.table} SET ${setSql} WHERE ${ormDef.id_field} = ${record_id}`;
        console.log(`entering updateRecord: sql=${sql}`);
        let response = await connection.query(sql);
        if(response.affectedRows) {
            result = 'was updated'
        } else {
            result = 'had no changes'
        }
        return `${ormDef.table} ${record_id} ${result}.`;
    } catch (err) {
        throw err
    } finally {
        await connection.release();
    }
}

const handler = {
    getView: getView,
    getRecords: getRecords,
    addRecord: addRecord,
    deleteRecord: deleteRecord,
    updateRecord: updateRecord
};
module.exports = handler;