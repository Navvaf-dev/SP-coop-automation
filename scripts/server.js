const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = 3000;

// PostgreSQL connection setup
const pool = new Pool({
    host: 'localhost',
    user: 'nawafbinbaz',
    password: '11223344',
    database: 'coop_auto'
});

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to handle database queries
async function handleQuery(query, params, res) {
    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

// ======= File Management =======

// Directory to store uploaded files
const uploadDirectory = path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// API Endpoint for file upload
app.post('/students/upload', upload.single('file'), async (req, res) => {
    const { reportType, studentId } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!reportType || !studentId) {
        return res.status(400).json({ error: 'Missing reportType or studentId in request.' });
    }

    const fileName = req.file.filename;

    // Determine the column to update based on reportType
    const columnMap = {
        "Early Report": "earlyreport",
        "Midway Report": "midwayreport",
        "Final Report": "finalreport"
    };

    const column = columnMap[reportType];
    if (!column) {
        return res.status(400).json({ error: 'Invalid reportType provided.' });
    }

    try {
        // Update the database
        const query = `
            UPDATE Student
            SET ${column} = $1
            WHERE id = $2
        `;
        await pool.query(query, [fileName, studentId]);

        res.status(200).json({
            message: 'File uploaded and student record updated successfully.',
            fileName
        });
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Failed to update student record.' });
    }
});

// Download endpoint
app.get('/students/download/:fileName', (req, res) => {
    const { fileName } = req.params; // Get the file name from the URL
    const filePath = path.join(__dirname, 'uploads', fileName); // Path to the file

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found.' });
    }

    // Set headers for the response
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Send the file
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).json({ error: 'Failed to download file.' });
        }
    });
});

// Remove file endpoint
app.delete('/students/remove-file', express.json(), async (req, res) => {
    const { studentId, reportType } = req.body;

    console.log("Delete Request Received:", { studentId, reportType });

    // Validate input
    if (!studentId || !reportType) {
        console.warn("Missing studentId or reportType:", { studentId, reportType });
        return res.status(400).json({ error: 'Student ID and report type are required.' });
    }

    // Map the report type to the database column
    const columnMap = {
        "Early Report": "earlyreport",
        "Midway Report": "midwayreport",
        "Final Report": "finalreport"
    };

    const column = columnMap[reportType];
    if (!column) {
        console.warn("Invalid reportType:", reportType);
        return res.status(400).json({ error: 'Invalid report type provided.' });
    }

    try {
        // Fetch the file name from the database
        const query = `SELECT ${column} AS fileName FROM Student WHERE ID = $1`;
        console.log("Executing Query:", query, "with StudentID:", studentId);

        const result = await pool.query(query, [studentId]);
        console.log("Query Result:", result.rows);

        if (result.rows.length === 0 || !result.rows[0].filename) {
            console.warn("File not found in database for:", { studentId, column });
            return res.status(404).json({ error: 'File not found for the given student and report type.' });
        }

        const fileName = result.rows[0].filename;
        const filePath = path.join(uploadDirectory, fileName);
        console.log("Resolved File Path:", filePath);

        // Check and delete the file from the file system
        if (fs.existsSync(filePath)) {
            console.log("Deleting file:", filePath);
            fs.unlinkSync(filePath);
        } else {
            console.warn("File not found on filesystem:", filePath);
        }

        // Update the database to remove the file reference
        const updateQuery = `UPDATE Student SET ${column} = NULL WHERE ID = $1`;
        console.log("Updating Database:", updateQuery, "with StudentID:", studentId);
        await pool.query(updateQuery, [studentId]);

        console.log("File successfully removed for studentId:", studentId, "and column:", column);
        res.status(200).json({ message: 'File removed successfully.' });
    } catch (error) {
        console.error('Error removing file:', error);
        res.status(500).json({ error: 'Failed to remove file.' });
    }
});

// ======= Student Endpoints =======

// Add a new student
app.post('/students', async (req, res) => {
    const { id, fullname, speciality, status, mobilephone, personalemail, universityemail, coopstartdate, coopenddate, advisorid } = req.body;
    const query = `
        INSERT INTO Student (ID, FullName, Speciality, Status, MobilePhone, PersonalEmail, UniversityEmail, CoOpStartDate, CoOpEndDate, AdvisorID) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    await handleQuery(query, [id, fullname, speciality, status, mobilephone, personalemail, universityemail, coopstartdate, coopenddate, advisorid], res);
    res.status(201).json({ message: 'Student added successfully' });
});

// Get all students
app.get('/students', async (req, res) => {
    const query = `
        SELECT Student.*, Advisor.FullName AS AdvisorName 
        FROM Student 
        LEFT JOIN Advisor ON Student.AdvisorID = Advisor.ID
    `;
    const students = await handleQuery(query, [], res);
    res.json(students);
    
});

// Handle select all students state
app.post('/api/select-all-students', (req, res) => {
    const { selectAll } = req.body;

    // Validate input
    if (typeof selectAll !== 'boolean') {
        return res.status(400).json({ error: 'Invalid selectAll value' });
    }

    // Perform any necessary logic (e.g., logging, updating database if needed)
    console.log(`Select all students state updated to: ${selectAll}`);

    // Respond with success
    res.json({ message: 'Selection state updated successfully' });
});

// Search students by advisor name
app.get('/students/searchadvp', async (req, res) => {
    const advisorName = req.query.query; // Extract query parameter from the URL

    if (!advisorName || advisorName.trim() === "") {
        return res.status(400).json({ error: "Advisor name is required for the search" });
    }

    try {
        // Query the database to find students linked to the advisor
        const sqlQuery = `
            SELECT Student.*
            FROM Student
            LEFT JOIN Advisor ON Student.AdvisorID = Advisor.ID
            WHERE Advisor.FullName ILIKE $1
        `;
        const params = [`%${advisorName}%`]; // Wildcard search for partial matches

        const result = await pool.query(sqlQuery, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No students found for the advisor" });
        }

        res.json(result.rows); // Return the found students
    } catch (error) {
        console.error("Error fetching students by advisor:", error);
        res.status(500).json({ error: "Failed to fetch students for the advisor" });
    }
});

// Search students
app.get('/students/search', async (req, res) => {
    const query = req.query.query;

    // Ensure the query parameter is provided
    if (!query || query.trim() === "") {
        console.error("Query parameter is missing or empty.");
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        console.log("Search query received:", query);

        // Check if the query is numeric or textual
        const isNumeric = /^\d+$/.test(query);

        let sqlQuery;
        let params;

        if (isNumeric) {
            // Query by numeric ID
            sqlQuery = `
                SELECT *
                FROM Student
                WHERE CAST(ID AS TEXT) ILIKE $1
            `;
            params = [`%${query}%`];
        } else {
            // Query by FullName
            sqlQuery = `
                SELECT *
                FROM Student
                WHERE FullName ILIKE $1
            `;
            params = [`%${query}%`];
        }

        console.log("Executing SQL query:", sqlQuery, "with parameters:", params);

        // Execute the query
        const result = await pool.query(sqlQuery, params);

        console.log("Query executed. Rows returned:", result.rows.length);

        if (result.rows.length === 0) {
            console.warn("No students found for query:", query);
            return res.status(404).json({ error: "No students found matching the query." });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Failed to fetch students. Please try again." });
    }
});



// Get a single student by ID
app.get('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT Student.*, Advisor.FullName AS AdvisorName, Advisor.Email AS advisor_email
             FROM Student 
             LEFT JOIN Advisor ON Student.AdvisorID = Advisor.ID 
             WHERE Student.ID = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).send('Error fetching student');
    }
});

// Update a student
app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { fullname, speciality, status, mobilephone, personalemail, universityemail, coopstartdate, coopenddate, advisorid } = req.body;

    console.log("Received payload:", req.body);

    const query = `
        UPDATE Student 
        SET FullName = $1, Speciality = $2, Status = $3, MobilePhone = $4, PersonalEmail = $5, UniversityEmail = $6, CoOpStartDate = $7, CoOpEndDate = $8, AdvisorID = $9 
        WHERE ID = $10
    `;
    try {
        await pool.query(query, [fullname, speciality, status, mobilephone, personalemail, universityemail, coopstartdate, coopenddate, advisorid, id]);
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(400).json({ error: "Failed to update student" });
    }
});

// Delete a student
app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Student WHERE ID = $1';
    await handleQuery(query, [id], res);
    res.json({ message: 'Student deleted successfully' });
});




// Get students without advisors
app.get('/api/students/without-advisor', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, fullname FROM Student WHERE AdvisorID IS NULL");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching students without advisors:", error);
        res.status(500).json({ error: "Failed to fetch students without advisors" });
    }
});

app.post('/students/emails', async (req, res) => {
    const { ids } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No student IDs provided." });
    }

    try {
        // Query to fetch student details based on IDs
        const result = await pool.query(
            `SELECT ID, FullName, UniversityEmail 
             FROM Student 
             WHERE ID = ANY($1::int[])`,
            [ids]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No students found for the provided IDs." });
        }

        res.json(result.rows); // Return the student data
    } catch (error) {
        console.error("Error fetching student emails:", error);
        res.status(500).json({ error: "Failed to fetch student emails." });
    }
});

// ======= Advisor Endpoints =======

// Add new advisor
app.post('/advisors', async (req, res) => {
    const { id, fullname, email } = req.body;
    const query = `
        INSERT INTO Advisor (ID, FullName, Email) 
        VALUES ($1, $2, $3)
    `;

    try {
        await pool.query(query, [id, fullname, email]);
        res.status(201).json({ message: 'Advisor added successfully' });
    } catch (err) {
        console.error('Error adding advisor:', err);

        // Handle specific database errors (e.g., unique constraint violation)
        if (err.code === '23505') {
            res.status(400).json({ message: 'Advisor ID already exists.' });
        } else {
            res.status(500).json({ message: 'Error adding advisor. Please try again.' });
        }
    }
});

// Get all advisors
app.get('/advisors', async (req, res) => {
    const query = 'SELECT * FROM Advisor';
    const advisors = await handleQuery(query, [], res);
    res.json(advisors);
});

// Search advisors
app.get('/advisors/search', async (req, res) => {
    const query = req.query.query;

    // Validate the query parameter
    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        // Query to search advisors by ID or FullName
        const result = await pool.query(
            `
            SELECT 
                ID AS id, 
                FullName AS fullname, 
                Email AS email
            FROM 
                Advisor
            WHERE 
                CAST(ID AS TEXT) ILIKE $1 OR FullName ILIKE $1
            `,
            [`%${query}%`]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No advisors found matching the query." });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching advisors:", error);
        res.status(500).json({ error: "Failed to fetch advisors" });
    }
});

// Edit advisor
app.get('/advisors/:id', async (req, res) => {
    const { id } = req.params; // Get advisor ID from the URL
    try {
        const query = `SELECT * FROM Advisor WHERE ID = $1`;
        const result = await pool.query(query, [id]); // Query database with advisor ID

        if (result.rows.length === 0) {
            // If no advisor is found, return 404
            return res.status(404).json({ message: `Advisor with ID ${id} not found.` });
        }

        // Send the advisor details
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching advisor with ID ${id}:`, error);
        res.status(500).json({ message: 'Error fetching advisor details.' });
    }
});

app.put('/advisors/:id', async (req, res) => {
    const { id } = req.params;
    const { fullname, email } = req.body;
    const query = `
        UPDATE Advisor 
        SET FullName = $1, Email = $2 
        WHERE ID = $3
    `;
    await handleQuery(query, [fullname, email, id], res);
    res.json({ message: 'Advisor updated successfully' });
});

// Delete an advisor
app.delete('/advisors/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Advisor WHERE ID = $1';
    await handleQuery(query, [id], res);
    res.json({ message: 'Advisor deleted successfully' });
});

// Assign advisor to students
app.post('/api/students/assign-advisor', async (req, res) => {
    const { advisorId, studentIds } = req.body;

    if (!advisorId || !studentIds || studentIds.length === 0) {
        return res.status(400).json({ error: "Advisor ID and student IDs are required" });
    }

    try {
        await pool.query(
            "UPDATE Student SET AdvisorID = $1 WHERE ID = ANY($2::int[])",
            [advisorId, studentIds]
        );
        res.json({ message: "Advisor assigned successfully" });
    } catch (error) {
        console.error("Error assigning advisor:", error);
        res.status(500).json({ error: "Failed to assign advisor" });
    }
});

// Unassign advisor from students
app.post('/api/students/unassign-advisor', async (req, res) => {
    const { studentIDs } = req.body;

    if (!studentIDs || studentIDs.length === 0) {
        return res.status(400).json({ message: "No students provided for unassignment." });
    }

    try {
        const query = `
            UPDATE Student
            SET AdvisorID = NULL
            WHERE ID = ANY($1::int[])
        `;
        await pool.query(query, [studentIDs]);
        res.status(200).json({ message: "Advisors successfully unassigned from selected students." });
    } catch (error) {
        console.error("Error unassigning advisors:", error);
        res.status(500).json({ message: "Failed to unassign advisors." });
    }
});

// Get advisors without students
app.get('/api/advisors/without-students', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT FullName AS name 
            FROM Advisor 
            WHERE ID NOT IN (SELECT DISTINCT AdvisorID FROM Student WHERE AdvisorID IS NOT NULL)
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching advisors without students:', error);
        res.status(500).json({ message: 'Failed to fetch advisors without students' });
    }
});

app.post('/api/select-all-advisors', (req, res) => {
    const { selectAll } = req.body;
    if (typeof selectAll !== 'boolean') {
        return res.status(400).json({ error: 'Invalid selectAll value' });
    }
    console.log(`Advisor selection state updated to: ${selectAll}`);
    res.json({ message: 'Advisor selection state updated successfully' });
});

app.post('/advisors/emails', async (req, res) => {
    const { ids } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No advisor IDs provided." });
    }

    try {
        // Query to fetch advisor details based on IDs
        const result = await pool.query(
            `SELECT ID, FullName, Email 
             FROM Advisor 
             WHERE ID = ANY($1::int[])`,
            [ids]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No advisors found for the provided IDs." });
        }

        res.json(result.rows); // Return the advisor data
    } catch (error) {
        console.error("Error fetching advisor emails:", error);
        res.status(500).json({ error: "Failed to fetch advisor emails." });
    }
});


// ======= Timeline and Utility Endpoints =======

// Fetch timeline data for students

app.get('/timelines', async (req, res) => {
    const view = req.query.view; // Accept view as a query parameter
    let query;

    switch (view) {
        case 'startEnd':
            query = `
                SELECT 
                    ID AS student_id, 
                    FullName AS fullname, 
                    CoOpStartDate AS start_date, 
                    CoOpEndDate AS end_date 
                FROM Student
            `;
            break;
        case 'earlyReport':
            query = `
                SELECT 
                    ID AS student_id, 
                    FullName AS fullname, 
                    CoOpStartDate + INTERVAL '7 weeks' AS report_date 
                FROM Student
            `;
            break;
        case 'midwayReport':
            query = `
                SELECT 
                    ID AS student_id, 
                    FullName AS fullname, 
                    CoOpStartDate + INTERVAL '14 weeks' AS report_date 
                FROM Student
            `;
            break;
        case 'finalReport':
            query = `
                SELECT 
                    ID AS student_id, 
                    FullName AS fullname, 
                    CoOpStartDate + INTERVAL '21 weeks' AS report_date 
                FROM Student
            `;
            break;
        default:
            query = `
                SELECT 
                    ID AS student_id, 
                    FullName AS fullname, 
                    CoOpStartDate AS start_date, 
                    CoOpEndDate AS end_date 
                FROM Student
            `;
    }

    try {
        const result = await pool.query(query);
        res.json(result.rows); // Return the timeline data as JSON
    } catch (error) {
        console.error("Error fetching timelines:", error);
        res.status(500).json({ error: "Failed to fetch timelines" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});