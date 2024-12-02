document.addEventListener('DOMContentLoaded', () => {
    let advisorEmail = ''; // Variable to store the advisor's email
    window.currentStudent = null; // Current logged-in student
    let selectedFiles = {}; // Object to track selected files by report type
    
    // Prevent unintended form submissions globally
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', event => event.preventDefault());
    });

    async function enterStudentPortal(event) {
    
        const studentId = parseInt(document.getElementById("studentId").value);
    
        if (!studentId) {
            alert("Please enter a valid Student ID.");
            return;
        }
    
        try {
            // Fetch the student's details from the database
            const response = await fetch(`http://localhost:3000/students/${studentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error("Student not found. Please enter a valid student ID.");
            }
    
            const student = await response.json();
            currentStudent = student; // Set the student data globally
            advisorEmail = currentStudent.advisor_email || '';
    
            // Update the portal UI
            document.getElementById("loginSection").style.display = "none";
            document.getElementById("studentPage").style.display = "block";
            document.getElementById("docContainer").style.display = "block";
    
            const advisorElement = document.getElementById("advisorName");
            if (advisorElement) {
                advisorElement.innerText = `Advisor: ${currentStudent.advisor || "No Advisor Assigned"}`;
            } else {
                console.error('Element with id "advisorName" not found.');
            }
    
            renderTimeGraph(currentStudent.coopstartdate, currentStudent.coopenddate);
            loadUploadedFiles();
        } catch (error) {
            alert(error.message);
        }
    }

    async function uploadFile(reportType) {
        const file = selectedFiles[reportType]; // Get the selected file for the given report type
    
        if (!file) {
            alert('No file selected. Please choose a file first.');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('reportType', reportType);
        formData.append('studentId', currentStudent.id);
    
        try {
            // Fetch request to upload file
            const response = await fetch('http://localhost:3000/students/upload', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server Error:', errorText);
                alert('Failed to upload the file. Please try again.');
                return;
            }
    
            const { message, fileName } = await response.json();
            console.log(message); // Log success message
    
            // Update UI to indicate success
            const normalizedReportType = reportType.replace(/\s+/g, '');
            const fileElement = document.getElementById(`${normalizedReportType}File`);
            const removeButton = document.getElementById(`${normalizedReportType}Remove`);
    
            if (fileElement) {
                fileElement.innerText = fileName;
                fileElement.classList.add('success'); // Add a CSS class for success indication
            }
    
            if (removeButton) {
                removeButton.style.display = 'inline';
            }
    
            // Update the `currentStudent` object correctly
            currentStudent[reportType.toLowerCase().replace(/\s+/g, '_')] = fileName;
    
            alert('File uploaded successfully.');
        } catch (error) {
            console.error('Error during upload:', error);
            alert('An error occurred during upload. Please try again.');
        }
    }

    function handleFileSelection(event, reportType) {
        const file = event.target.files[0];
        if (file) {
            selectedFiles[reportType] = file; // Store the selected file in the global object
    
            // Update UI to indicate file selection
            const fileDisplay = document.getElementById(`${reportType.replace(/\s+/g, '')}File`);
            if (fileDisplay) {
                fileDisplay.innerText = file.name;
            }
        }
    }

    function triggerUpload(reportType) {
        uploadFile(reportType);
    }

    async function removeFile(reportType) {
        const reportField = reportType.toLowerCase().replace(/\s+/g, '_');
    
        try {
            const payload = {
                studentId: currentStudent.id, // Ensure currentStudent is defined and has ID
                reportType,
            };
    
            console.log("Sending DELETE request with payload:", payload);
    
            const response = await fetch('http://localhost:3000/students/remove-file', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server Error:', errorText);
                alert('Failed to remove the file. Please try again.');
                return;
            }
    
            const result = await response.json();
            console.log(result.message);
    
            // Update the UI
            const normalizedReportType = reportType.replace(/\s+/g, '');
            const fileElement = document.getElementById(`${normalizedReportType}File`);
            const removeButton = document.getElementById(`${normalizedReportType}Remove`);
    
            if (fileElement) {
                fileElement.innerText = ''; // Clear the file name
            }
    
            if (removeButton) {
                removeButton.style.display = 'none'; // Hide the remove button
            }
    
            alert('File removed successfully.');
        } catch (error) {
            console.error('Error during file removal:', error);
            alert('An error occurred during file removal. Please try again.');
        }
    }

    function loadUploadedFiles() {
        const reportMappings = [
            { type: "Early Report", field: "earlyreport" },
            { type: "Midway Report", field: "midwayreport" },
            { type: "Final Report", field: "finalreport" },
        ];
    
        reportMappings.forEach(({ type, field }) => {
            const fileName = currentStudent[field]; // Ensure currentStudent has data
            const normalizedReportType = type.replace(/\s+/g, '');
            const fileDisplay = document.getElementById(`${normalizedReportType}File`);
            const removeButton = document.getElementById(`${normalizedReportType}Remove`);
    
            if (fileName) {
                if (fileDisplay) {
                    fileDisplay.innerText = fileName; // Display the file name
                }
                if (removeButton) {
                    removeButton.style.display = 'inline'; // Show the remove button
                }
            } else {
                if (fileDisplay) {
                    fileDisplay.innerText = ''; // Clear the file display
                }
                if (removeButton) {
                    removeButton.style.display = 'none'; // Hide the remove button
                }
            }
        });
    }

    function contactAdvisor() {
        if (advisorEmail) {
            const mailtoLink = `https://mail.google.com/mail/?view=cm&to=${advisorEmail}`;
            window.open(mailtoLink, '_blank');
        } else {
            alert("Advisor's email not found.");
        }
    }

    function renderTimeGraph(coopstartdate, coopenddate) {
        const start = new Date(coopstartdate);
        const end = new Date(coopenddate);

        const earlyReportDate = new Date(start);
        earlyReportDate.setDate(start.getDate() + 7 * 7);

        const midwayReportDate = new Date(start);
        midwayReportDate.setDate(start.getDate() + 14 * 7);

        const finalReportDate = new Date(start);
        finalReportDate.setDate(start.getDate() + 21 * 7);

        const earlyDeadlineElem = document.getElementById("earlyDeadline");
        earlyDeadlineElem.innerText = `Early Report Deadline: ${earlyReportDate.toISOString().split('T')[0]}`;
        earlyDeadlineElem.style.display = "block";

        const midwayDeadlineElem = document.getElementById("midwayDeadline");
        midwayDeadlineElem.innerText = `Midway Report Deadline: ${midwayReportDate.toISOString().split('T')[0]}`;
        midwayDeadlineElem.style.display = "block";

        const finalDeadlineElem = document.getElementById("finalDeadline");
        finalDeadlineElem.innerText = `Final Report Deadline: ${finalReportDate.toISOString().split('T')[0]}`;
        finalDeadlineElem.style.display = "block";

        const trace = {
            x: [
                coopstartdate,
                earlyReportDate.toISOString().split('T')[0],
                midwayReportDate.toISOString().split('T')[0],
                finalReportDate.toISOString().split('T')[0],
                coopenddate
            ],
            y: ['Start Date', 'Early Report', 'Midway Report', 'Final Report', 'End Date'],
            mode: 'lines+markers',
            type: 'scatter',
            text: [
                `Start Date: ${coopstartdate}`,
                `Early Report: ${earlyReportDate.toISOString().split('T')[0]}`,
                `Midway Report: ${midwayReportDate.toISOString().split('T')[0]}`,
                `Final Report: ${finalReportDate.toISOString().split('T')[0]}`,
                `End Date: ${coopenddate}`
            ],
            hoverinfo: 'text',
            marker: { size: 8 }
        };

        const layout = {
            title: 'Student Time Graph',
            xaxis: {
                title: 'Date',
                type: 'date',
                tickformat: '%Y-%m-%d',
                dtick: 'M1'
            },
            yaxis: {
                title: 'Milestones',
                tickvals: ['Start Date', 'Early Report', 'Midway Report', 'Final Report', 'End Date']
            },
            width: 1000,
            height: 500
        };

        Plotly.newPlot('timeGraphChart', [trace], layout);
    }

    // Attach global functions to window for HTML integration
    window.enterStudentPortal = enterStudentPortal;
    window.uploadFile = uploadFile;
    window.removeFile = removeFile;
    window.contactAdvisor = contactAdvisor;
    window.loadUploadedFiles = loadUploadedFiles;
    window.renderTimeGraph = renderTimeGraph;
    window.handleFileSelection = handleFileSelection;
    window.triggerUpload = triggerUpload;
});