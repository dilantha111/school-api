const sqlite3 = require('sqlite3').verbose();
const fsPromises = require('fs').promises;
const { DB_URL, INITIAL_JSON_DATA } = require('./config');

async function dbSetup() {
    /**
     * Delete if db already exists
     */
    try {
        await fsPromises.stat(DB_URL);
        await fsPromises.unlink(DB_URL);
    } catch (error) {
        if (!error.message.includes('no such file or directory')) {
            console.error("Failed to clear the existing data !!!");
        }
    }

    let setupData;
    let filehandle;

    try {
        filehandle = await fsPromises.open(INITIAL_JSON_DATA, 'r');
        const data = await filehandle.readFile();
        setupData = JSON.parse(data);
    } catch (error) {
        console.error(error);
        throw error("Failed to setup data !!!");
    } finally {
        if (filehandle !== undefined)
            await filehandle.close();
    }

    const db = new sqlite3.Database(DB_URL);

    db.serialize(() => {
        db.run("CREATE TABLE school (id INTEGER PRIMARY KEY, schoolName TEXT, numberOfStudents NUMERIC, street TEXT, suburb TEXT, postCode NUMERIC, state TEXT)");

        const stmt = db.prepare("INSERT INTO school VALUES (?, ?, ?, ?, ?, ?, ?)");
        setupData.forEach(({ id, schoolName, numberOfStudents, street, suburb, postCode, state }) => stmt.run(null, schoolName, numberOfStudents, street, suburb, postCode, state));
        stmt.finalize();

        console.log('Initial data added to the db !!!');
    });

    db.close();
}

dbSetup();

