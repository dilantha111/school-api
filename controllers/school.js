const sqlite3 = require('sqlite3').verbose();
const yup = require('yup');
const { DB_URL } = require('../config');

class School {
    _openDBConnection() {
        this.db = new sqlite3.Database(DB_URL);
    }

    _closeDBConnection() {
        this.db.close();
    }

    getSchools(req, res) {
        this._openDBConnection();
        const schools = [];

        this.db.each("SELECT * FROM school", (err, row) => {
            if (err) throw Error(err);
            schools.push(row);
        }, (err, numberOfRows) => {
            this._closeDBConnection();
            if (err) {
                console.error(err);
                res.json({ error: err });
            } else {
                res.json({ schools });
            }
        });
    }

    async addNewSchool(req, res) {
        try {
            const schema = yup.object().shape({
                schoolName: yup.string().required(),
                numberOfStudents: yup.number().required(),
                street: yup.string().required(),
                suburb: yup.string().required(),
                postcode: yup.number().required(),
                state: yup.string().required(),
            });

            const newSchool = schema.cast(req.body);
            const { schoolName, numberOfStudents, street, suburb, postCode, state } = newSchool;

            this._openDBConnection();

            const stmt = this.db.prepare("INSERT INTO school VALUES (?, ?, ?, ?, ?, ?, ?)");
            stmt.run(null, schoolName, numberOfStudents, street, suburb, postCode, state);
            stmt.finalize();

            this._closeDBConnection();

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.json({ error });
        }
    }
}

module.exports = School;