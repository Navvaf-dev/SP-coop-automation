// Function to validate the advisor name
async function validateAdvisor() {
    const advisorName = document.getElementById("advisorNameInput").value.trim();
    const errorElement = document.getElementById("error");

    if (!advisorName) {
        console.error("Advisor name is empty or undefined.");
        errorElement.textContent = "Please enter a valid advisor name.";
        return;
    }

    try {
        console.log("Validating Advisor Name:", advisorName); // Debug log

        // Fetch advisor data from the backend
        const response = await fetch(`http://localhost:3000/advisors/search?query=${encodeURIComponent(advisorName)}`);
        if (!response.ok) {
            throw new Error('No such advisor exists');
        }

        const advisor = await response.json();
        console.log("Advisor Found:", advisor); // Debug log

        errorElement.textContent = "";
        loadStudents(advisor.fullname || advisorName); // Pass the full name or input name
        document.getElementById("timeGraphButton").style.display = "block"; // Show Time Graph Button
    } catch (error) {
        console.error("Error validating advisor:", error);
        errorElement.textContent = "No such advisor exists";
        document.getElementById("studentTableContainer").style.display = "none";
        document.getElementById("timeGraphButton").style.display = "none";
        document.getElementById("timelineViewSelector").style.display = "none";
    }
}

let studentDataArr = []; // Declare the global variable

async function loadStudents(advisorName) {
    const studentTableBody = document.getElementById("studentTableBody");
    studentTableBody.innerHTML = ''; // Clear existing table data

    if (!advisorName) {
        console.error("Advisor name is missing for loading students.");
        alert("Advisor name is required to load students.");
        return;
    }

    try {
        console.log("Loading students for advisor:", advisorName); // Debug log

        // Fetch students assigned to the advisor
        const response = await fetch(`http://localhost:3000/students/searchadvp?query=${encodeURIComponent(advisorName)}`);
        if (!response.ok) {
            throw new Error('No students found for the advisor');
        }

        const students = await response.json();
        studentDataArr = students; // Populate studentDataArr with the fetched students
        console.log("Students loaded:", students); // Debug log

        if (students.length > 0) {
            document.getElementById("contactStudentsBtn").style.display = "block"; // Show the contact button
        }

        students.forEach((student) => {
            const statusColor = student.status === "Active" ? "green" : "red";

            // Main student row
            const row = `<tr>
                            <td><input type="checkbox" class="student-checkbox" data-email="${student.universityemail}"></td>
                            <td>${student.id}</td>
                            <td>${student.fullname}</td>
                            <td>${student.speciality}</td>
                            <td style="color: ${statusColor}; font-weight: bold;">${student.status}</td>
                            <td>${student.mobilephone}</td>
                            <td>${student.personalemail}</td>
                            <td>${student.universityemail}</td>
                            <td>${student.coopstartdate.split('T')[0]}</td>
                            <td>${student.coopenddate.split('T')[0]}</td>
                        </tr>`;

            const reportRow = `<tr>
                                    <td colspan="10">
                                        <div class="report-container">
                                            <strong>Reports:</strong>
                                            <div class="report-links">
                                                <span>Early Report: ${generateReportLink(student, 'earlyreport')}</span>
                                                <span>Midway Report: ${generateReportLink(student, 'midwayreport')}</span>
                                                <span>Final Report: ${generateReportLink(student, 'finalreport')}</span>
                                            </div>
                                        </div>
                                    </td>
                               </tr>`;

            studentTableBody.insertAdjacentHTML('beforeend', row + reportRow);
        });

        document.getElementById("studentTableContainer").style.display = 'block';
    } catch (error) {
        console.error("Error loading students:", error);
        alert("Failed to load students. Please try again.");
    }
}

// Helper function to generate download link or "Empty" text
function generateReportLink(student, reportType) {
    const reportName = student[reportType];
    if (reportName) {
        return `<a href="http://localhost:3000/students/download/${reportName}" download>${reportName}</a>`;
    } else {
        return '<span style="color: red;">Empty</span>';
    }
}

function toggleTimeGraph() {
    const timeGraphContainer = document.getElementById('timeGraphContainer');
    const timelineViewSelector = document.getElementById('timelineViewSelector');
    const advisorName = document.getElementById("advisorNameInput").value.trim();

    if (timeGraphContainer.style.visibility === 'hidden') {
        renderTimeGraph(advisorName);
        timeGraphContainer.style.visibility = 'visible';
        timelineViewSelector.style.display = 'block';
    } else {
        timeGraphContainer.style.visibility = 'hidden';
        timelineViewSelector.style.display = 'none';
    }
}


function renderTimeGraph() {
    if (!studentDataArr || studentDataArr.length === 0) {
        console.error("No student data available to render the graph.");
        alert("No student data available to render the graph.");
        return;
    }

    const timelineView = document.getElementById('timelineViewSelector').value;
    const traces = [];

    studentDataArr.forEach(student => {
        const startDate = new Date(student.coopstartdate);
        const endDate = new Date(student.coopenddate);

        const xValues = [];
        const yValues = [];
        const hoverTexts = [];

        // Skip students with invalid dates
        if (isNaN(startDate) || isNaN(endDate)) return;

        // Add start and end dates if "Start/End" view is selected
        if (timelineView === 'startEnd' || timelineView === 'all') {
            xValues.push(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
            yValues.push(student.fullname, student.fullname);
            hoverTexts.push(
                `ID: ${student.id}<br>Name: ${student.fullname}<br><b>Start Date:</b> ${startDate.toISOString().split('T')[0]}`,
                `ID: ${student.id}<br>Name: ${student.fullname}<br><b>End Date:</b> ${endDate.toISOString().split('T')[0]}`
            );
        }

        // Calculate and add report deadlines based on the selected timeline view
        const earlyReportDate = new Date(startDate);
        earlyReportDate.setDate(earlyReportDate.getDate() + 7 * 7); // 7 weeks
        if ((timelineView === 'earlyReport' || timelineView === 'all') && !isNaN(earlyReportDate)) {
            xValues.push(earlyReportDate.toISOString().split('T')[0]);
            yValues.push(student.fullname);
            hoverTexts.push(`ID: ${student.id}<br>Name: ${student.fullname}<br><b>Early Report:</b> ${earlyReportDate.toISOString().split('T')[0]}`);
        }

        const midwayReportDate = new Date(startDate);
        midwayReportDate.setDate(midwayReportDate.getDate() + 14 * 7); // 14 weeks
        if ((timelineView === 'midwayReport' || timelineView === 'all') && !isNaN(midwayReportDate)) {
            xValues.push(midwayReportDate.toISOString().split('T')[0]);
            yValues.push(student.fullname);
            hoverTexts.push(`ID: ${student.id}<br>Name: ${student.fullname}<br><b>Midway Report:</b> ${midwayReportDate.toISOString().split('T')[0]}`);
        }

        const finalReportDate = new Date(startDate);
        finalReportDate.setDate(finalReportDate.getDate() + 21 * 7); // 21 weeks
        if ((timelineView === 'finalReport' || timelineView === 'all') && !isNaN(finalReportDate)) {
            xValues.push(finalReportDate.toISOString().split('T')[0]);
            yValues.push(student.fullname);
            hoverTexts.push(`ID: ${student.id}<br>Name: ${student.fullname}<br><b>Final Report:</b> ${finalReportDate.toISOString().split('T')[0]}`);
        }

        // Add trace for each student
        if (xValues.length > 0) {
            traces.push({
                x: xValues,
                y: yValues,
                mode: 'lines+markers',
                name: student.fullname,
                text: hoverTexts,
                hoverinfo: 'text',
                line: { color: 'rgb(50, 113, 180)', width: 4 },
                marker: { color: 'rgb(50, 113, 180)', size: 8 },
            });
        }
    });

    const layout = {
        title: 'Student Co-op Timelines',
        xaxis: { title: 'Date', type: 'date', tickformat: '%Y-%m-%d' },
        yaxis: { title: 'Student Name', type: 'category', automargin: true },
        showlegend: true,
    };

    Plotly.newPlot('timeGraphChart', traces, layout);
}


// Function to update the graph based on timeline view selection
function updateTimeGraph() {
    const timelineView = document.getElementById('timelineViewSelector').value; // Get selected timeline view
    console.log("Selected timeline view:", timelineView); // Debugging log
    renderTimeGraph(timelineView); // Pass the selected timeline view to the render function
}

function toggleSelectAll(selectAllCheckbox) {
    // Select only the checkboxes inside the student table body
    const checkboxes = document.querySelectorAll('#studentTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}


function contactSelectedStudents() {
    // Select all checked checkboxes in the student table body
    const selectedCheckboxes = document.querySelectorAll('#studentTableBody input[type="checkbox"]:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert("Please select at least one student.");
        return;
    }

    const emailAddresses = [];
    selectedCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr'); // Get the row for the selected student
        const universityEmail = row.querySelector('td:nth-child(8)').textContent.trim(); // Get university email
        if (universityEmail) {
            emailAddresses.push(universityEmail);
        }
    });

    if (emailAddresses.length > 0) {
        // Construct the Gmail URL with all selected university emails
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddresses.join(',')}`;
        window.open(gmailLink, '_blank'); // Open Gmail compose window with the email addresses
    } else {
        alert("No university emails found for the selected students.");
    }
}


// Ensure these elements exist before adding listeners
document.getElementById('timeGraphButton').addEventListener('click', toggleTimeGraph);
document.getElementById('selectAllCheckbox').addEventListener('click', function () {
    toggleSelectAll(this);
});
document.getElementById('contactStudentsBtn').addEventListener('click', contactSelectedStudents);

document.getElementById('enterBtn').addEventListener('click', validateAdvisor);
document.getElementById('timelineViewSelector').addEventListener('change', updateTimeGraph);

export { validateAdvisor, loadStudents, toggleTimeGraph, updateTimeGraph, toggleSelectAll, contactSelectedStudents };
window.toggleTimeGraph = toggleTimeGraph;
window.updateTimeGraph = updateTimeGraph;

document.addEventListener('DOMContentLoaded', () => {
    // Ensure elements exist before adding listeners
    const timeGraphButton = document.getElementById('timeGraphButton');
    const timelineViewSelector = document.getElementById('timelineViewSelector');

    if (timeGraphButton) {
        timeGraphButton.addEventListener('click', toggleTimeGraph);
    }

    if (timelineViewSelector) {
        timelineViewSelector.addEventListener('change', updateTimeGraph);
    }
});