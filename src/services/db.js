const sqlite3 = require('sqlite3').verbose();

// Create a database connection
const db = new sqlite3.Database('orbital_pod.db', err => {
	if (err) {
		console.error('Failed to connect to the database:', err.message);
	} else {
		console.log('Connected to the SQLite database.');
	}
});

// Initialize tables if necessary
db.serialize(() => {
	db.run(`
		CREATE TABLE IF NOT EXISTS portals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			url TEXT NOT NULL
		)
	`);
});

module.exports = db;
