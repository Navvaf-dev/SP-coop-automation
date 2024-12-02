//Part 1 of Javascript functions and data structures

let currentTable = "student";
let selectedItems = [];
let selectedAdvisor = null;

// Function to fetch and display students in the table
async function fetchStudentsAndPopulateTable() {
    try {
        const response = await fetch('http://localhost:3000/students');
        const students = await response.json();
        const studentTableBody = document.getElementById("studentTableBody");
        studentTableBody.innerHTML = '';

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="student-checkbox"></td>
                <td>${student.id}</td>
                <td>${student.fullname}</td>
                <td>${student.speciality}</td>
                <td>${updateStatusColors(student.status)}</td>
                <td>${student.mobilephone}</td>
                <td>${student.personalemail}</td>
                <td>${student.universityemail}</td>
                <td>${formatDate(student.coopstartdate)}</td>
                <td>${formatDate(student.coopenddate)}</td>
                <td class="advisor-name">${student.advisorname || ''}</td>
            `;
            studentTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

// Function to fetch and display advisors in the table
async function fetchAdvisorsAndPopulateTable() {
    try {
        const response = await fetch('http://localhost:3000/advisors');
        const advisors = await response.json();
        const advisorTableBody = document.getElementById("advisorTableBody");
        advisorTableBody.innerHTML = '';

        advisors.forEach(advisor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="advisor-checkbox"></td>
                <td>${advisor.id}</td>
                <td>${advisor.fullname}</td>
                <td>${advisor.email}</td>
            `;
            advisorTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching advisors:', error);
    }
}

// Function to format a date into 'YYYY-MM-DD'
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date)) {
            console.error("Invalid date:", dateString);
            return "Invalid Date"; // Return a default message for invalid dates
        }
        return date.toISOString().split('T')[0]; // Extract the date part (YYYY-MM-DD)
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
}

// Call both functions after the DOM content is fully loaded
window.addEventListener('DOMContentLoaded', function () {
    fetchStudentsAndPopulateTable();  // Populate student table
    fetchAdvisorsAndPopulateTable();  // Populate advisor table
});

async function toggleTable() {
    const studentTableContainer = document.getElementById("studentTableContainer");
    const advisorTableContainer = document.getElementById("advisorTableContainer");
    const toggleButton = document.getElementById("toggleTableButton");
    const contactStudentsButton = document.getElementById("contactStudentsButton"); // Get the Contact Students button
    const contactAdvisorsButton = document.getElementById("contactAdvisorsButton"); // Get the Contact Advisors button

    const addStudentButton = document.getElementById("addStudentButton");
    const editStudentButton = document.getElementById("editStudentButton");
    const removeStudentButton = document.getElementById("removeStudentButton");

    const addAdvisorButton = document.getElementById("addAdvisorButton");
    const editAdvisorButton = document.getElementById("editAdvisorButton");
    const removeAdvisorButton = document.getElementById("removeAdvisorButton");

    const assignAdvisorButton = document.getElementById("assignAdvisorButton");
    const unassignAdvisorButton = document.getElementById("unassignAdvisorButton");
    const studentsWithoutAdvisorButton = document.getElementById("studentsWithoutAdvisorButton");
    const advisorsWithoutStudentsButton = document.getElementById("advisorsWithoutStudentsButton");

    // Check if the current table is student
    if (currentTable === "student") {
        // Hide student table, show advisor table
        studentTableContainer.style.display = "none";
        advisorTableContainer.style.display = "block";

        toggleButton.textContent = "Switch to Student Table";
        addStudentButton.style.display = "none";
        editStudentButton.style.display = "none";
        removeStudentButton.style.display = "none";

        addAdvisorButton.style.display = "inline-block";
        editAdvisorButton.style.display = "inline-block";
        removeAdvisorButton.style.display = "inline-block";

        contactStudentsButton.style.display = "none"; // Hide Contact Students button
        contactAdvisorsButton.style.display = "inline-block"; // Show Contact Advisors button

        currentTable = "advisor";
        assignAdvisorButton.style.display = "none";
        unassignAdvisorButton.style.display = "none";
        studentsWithoutAdvisorButton.style.display = "none";
        advisorsWithoutStudentsButton.style.display = "inline-block";
        addAdvisorButton.textContent = "Add Advisor";
        await fetchAdvisorsAndPopulateTable();
    } else {
        // Hide advisor table, show student table
        advisorTableContainer.style.display = "none";
        studentTableContainer.style.display = "block";

        toggleButton.textContent = "Switch to Advisor Table";
        addStudentButton.style.display = "inline-block";
        editStudentButton.style.display = "inline-block";
        removeStudentButton.style.display = "inline-block";

        addAdvisorButton.style.display = "none";
        editAdvisorButton.style.display = "none";
        removeAdvisorButton.style.display = "none";

        contactStudentsButton.style.display = "inline-block"; // Show Contact Students button
        contactAdvisorsButton.style.display = "none"; // Hide Contact Advisors button

        currentTable = "student";
        assignAdvisorButton.style.display = "inline-block";
        unassignAdvisorButton.style.display = "inline-block";
        studentsWithoutAdvisorButton.style.display = "inline-block";
        advisorsWithoutStudentsButton.style.display = "none";
        addStudentButton.textContent = "Add Student";
        await fetchStudentsAndPopulateTable();
    }
}

// Function to show Add Advisor Popup
function showAddAdvisorPopup() {
    // Adding advisors here
    document.getElementById("addAdvisorModal").style.display = "block";
}

// Function to close the Add Advisor popup
function closeAddAdvisorPopup() {
    document.getElementById("addAdvisorModal").style.display = "none";
}

// Function to add a new advisor to the table
async function addAdvisor() {
    const advisorID = document.getElementById("newAdvisorID").value.trim();
    const advisorName = document.getElementById("newAdvisorName").value.trim();
    const advisorEmail = document.getElementById("newAdvisorEmail").value.trim();

    // Ensure none of the fields are empty
    if (!advisorID || !advisorName || !advisorEmail) {
        alert("Please fill in all the fields.");
        return;
    }

    // Create an advisor object to send to the backend
    const advisor = {
        id: advisorID,
        fullname: advisorName,
        email: advisorEmail,
    };

    try {
        // Send a POST request to add the advisor
        const response = await fetch('http://localhost:3000/advisors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advisor),
        });

        // Check if the request was successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add advisor");
        }

        // Refresh the table to reflect the new advisor
        await fetchAdvisorsAndPopulateTable();

        // Clear the input fields
        document.getElementById("newAdvisorID").value = '';
        document.getElementById("newAdvisorName").value = '';
        document.getElementById("newAdvisorEmail").value = '';

        // Close the modal
        closeAddAdvisorPopup();

    } catch (error) {
        console.error("Error adding advisor:", error);
        alert(`An error occurred: ${error.message}`);
    }
}

function addAdvisorClickListeners() {
    const advisorNames = document.querySelectorAll('.advisor-name');
    advisorNames.forEach(advisor => {
        advisor.addEventListener('click', function () {
            const advisorName = advisor.textContent;
            showAdvisorInfo(advisorName);
        });
    });
}

async function handleEditAdvisorButton() {
    const selectedCheckbox = document.querySelector('#advisorTableBody input[type="checkbox"]:checked');
    if (!selectedCheckbox) {
        alert("Please select an advisor to edit.");
        return;
    }

    const selectedRow = selectedCheckbox.closest('tr');
    const advisorID = selectedRow.querySelector('td:nth-child(2)').textContent.trim(); // Correct column for advisor ID

    try {
        const response = await fetch(`http://localhost:3000/advisors/${advisorID}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const advisorData = await response.json();
            document.getElementById("editAdvisorID").value = advisorData.id;
            document.getElementById("editAdvisorName").value = advisorData.fullname; // Match database column name
            document.getElementById("editAdvisorEmail").value = advisorData.email;
            document.getElementById("editAdvisorModal").style.display = "block";
        } else if (response.status === 404) {
            alert(`Advisor with ID ${advisorID} not found.`);
        } else {
            throw new Error(`Unexpected response: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error fetching advisor details:", error);
        alert("An error occurred while fetching advisor details.");
    }
}

function closeEditAdvisorPopup() {
    // Hide the Edit Advisor modal
    document.getElementById("editAdvisorModal").style.display = "none";

    // Clear the input fields for cleanliness
    document.getElementById("editAdvisorID").value = '';
    document.getElementById("editAdvisorName").value = '';
    document.getElementById("editAdvisorEmail").value = '';

    // Reset any error messages or validation indicators (if applicable)
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => message.textContent = '');

    console.log("Edit Advisor modal closed and inputs cleared.");
}

// Function to save the edited advisor data
async function saveEditedAdvisor() {
    const updatedID = document.getElementById("editAdvisorID").value;
    const updatedName = document.getElementById("editAdvisorName").value;
    const updatedEmail = document.getElementById("editAdvisorEmail").value;

    try {
        await fetch(`http://localhost:3000/advisors/${advisorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAdvisor)
        });
        await fetchAdvisorsAndPopulateTable(); // Refresh the table
    } catch (error) {
        console.error('Error updating advisor:', error);
    }
    // Ensure none of the fields are empty
    if (!updatedID || !updatedName || !updatedEmail) {
        alert("Please fill in all the fields.");
        return;
    }

    // Find the selected checkbox and its corresponding row
    const selectedCheckbox = document.querySelector('#advisorTableBody input[type="checkbox"]:checked');
    const selectedRow = selectedCheckbox.closest('tr');

    // Update the advisor details in the table
    selectedRow.querySelector('td:nth-child(2)').textContent = updatedID;  // Update ID
    selectedRow.querySelector('td:nth-child(3)').textContent = updatedName; // Update Name
    selectedRow.querySelector('td:nth-child(4)').textContent = updatedEmail; // Update Email

    // Uncheck the checkbox after editing
    selectedCheckbox.checked = false;

    // Close the Edit Advisor modal
    closeEditAdvisorPopup();
}

// Function to confirm and remove the selected advisor
async function saveEditedAdvisor() {
    const updatedID = document.getElementById("editAdvisorID").value;
    const updatedName = document.getElementById("editAdvisorName").value;
    const updatedEmail = document.getElementById("editAdvisorEmail").value;

    // Ensure none of the fields are empty
    if (!updatedID || !updatedName || !updatedEmail) {
        alert("Please fill in all the fields.");
        return;
    }

    try {
        // Make a PUT request to update the advisor in the database
        const response = await fetch(`http://localhost:3000/advisors/${updatedID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullname: updatedName,
                email: updatedEmail,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update advisor: ${response.statusText}`);
        }

        console.log('Advisor updated successfully.');

        // Refresh the table to reflect changes
        await fetchAdvisorsAndPopulateTable();

        // Close the Edit Advisor modal
        closeEditAdvisorPopup();
    } catch (error) {
        console.error('Error updating advisor:', error);
        alert('An error occurred while updating the advisor. Please try again.');
    }
}

// Delete selected students from the database
async function confirmRemoveStudent() {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    if (checkboxes.length > 0 && confirm("Are you sure you want to remove the selected students?")) {
        for (let checkbox of checkboxes) {
            const studentId = checkbox.closest('tr').querySelector('td:nth-child(2)').textContent;
            try {
                await fetch(`http://localhost:3000/students/${studentId}`, { method: 'DELETE' });
            } catch (error) {
                console.error('Error deleting student:', error);
            }
        }
        await fetchStudentsAndPopulateTable(); // Refresh the table
    } else {
        alert("No students selected.");
    }
}

async function searchItem() {
    const searchInput = document.getElementById("search").value.trim();

    const endpoint = currentTable === "student" ? "/students/search" : "/advisors/search";

    try {
        const response = await fetch(`http://localhost:3000${endpoint}?query=${encodeURIComponent(searchInput)}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch search results");
        }

        const data = await response.json();
        const tableBody = currentTable === "student"
            ? document.getElementById("studentTableBody")
            : document.getElementById("advisorTableBody");

        // Clear table body
        tableBody.innerHTML = "";

        // Populate results
        data.forEach(item => {
            const newRow = currentTable === "student"
                ? `
                    <tr>
                        <td><input type="checkbox" class="student-checkbox"></td>
                        <td>${item.id}</td>
                        <td>${item.fullname}</td>
                        <td>${item.speciality}</td>
                        <td>${updateStatusColors(item.status)}</td>
                        <td>${item.mobilephone}</td>
                        <td>${item.personalemail}</td>
                        <td>${item.universityemail}</td>
                        <td>${formatDate(item.coopstartdate)}</td>
                        <td>${formatDate(item.coopenddate)}</td>
                        <td>${item.advisorname || ""}</td>
                    </tr>`
                : `
                    <tr>
                        <td><input type="checkbox" class="advisor-checkbox"></td>
                        <td>${item.id}</td>
                        <td>${item.fullname}</td>
                        <td>${item.email}</td>
                    </tr>`;
            tableBody.insertAdjacentHTML("beforeend", newRow);
        });

    } catch (error) {
        console.error("Error during search:", error);
        
    }
}

function selectAdvisor(advisorID, advisorName) {
    const studentIDs = selectedItems.map(row => row.querySelector("td:nth-child(2)").textContent.trim());

    if (!advisorID || studentIDs.length === 0) {
        alert("Failed to assign advisor. Please ensure all fields are correct.");
        return;
    }

    // Send assignment to the server
    fetch("http://localhost:3000/api/students/assign-advisor", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ advisorId: advisorID, studentIds: studentIDs }),
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to assign advisor.");
            return response.json();
        })
        .then(() => {
            alert(`Advisor ${advisorName} assigned successfully!`);
            fetchStudentsAndPopulateTable(); // Refresh the student table
            closePopup(); // Close the popup
        })
        .catch(error => {
            console.error("Error assigning advisor:", error);
            alert("Failed to assign advisor. Please try again.");
        });
}

async function assignAdvisor() {
    // Get selected student rows
    selectedItems = [...document.querySelectorAll('.student-checkbox:checked')].map(checkbox => checkbox.closest('tr'));

    if (selectedItems.length === 0) {
        alert("Please select at least one student to assign an advisor.");
        return;
    }

    try {
        // Fetch advisors from the server
        const response = await fetch("http://localhost:3000/advisors");
        if (!response.ok) {
            throw new Error("Failed to fetch advisors. Please check your server connection.");
        }

        const advisors = await response.json();

        // Check if advisors list is empty
        if (advisors.length === 0) {
            alert("No advisors found in the system. Please add advisors first.");
            return;
        }

        // Populate the advisor list in the popup
        const advisorList = document.getElementById("advisorList");
        advisorList.innerHTML = ""; // Clear any existing list
        advisors.forEach(advisor => {
            const listItem = document.createElement("li");
            listItem.textContent = advisor.fullname;
            listItem.setAttribute("data-id", advisor.id); // Store advisor ID
            listItem.style.cursor = "pointer";
            listItem.style.padding = "10px"; // Add spacing for better UI
            listItem.addEventListener("click", () => selectAdvisor(advisor.id, advisor.name));
            advisorList.appendChild(listItem);
        });

        // Add a search bar listener to filter the advisors
        document.getElementById("advisorSearch").addEventListener("input", function () {
            const searchValue = this.value.toLowerCase();
            document.querySelectorAll("#advisorList li").forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(searchValue) ? "" : "none";
            });
        });

        // Show the advisor popup
        document.getElementById("advisorPopup").style.display = "block";
        document.getElementById("overlay").style.display = "block";

    } catch (error) {
        console.error("Error fetching advisors:", error);
        alert("Failed to load advisor list. Please try again.");
    }
}


async function confirmAssign() {
    if (!selectedAdvisor || !selectedAdvisor.id) {
        alert("No advisor selected. Please select an advisor before confirming.");
        return;
    }

    // Collect student IDs to assign the advisor
    const studentIds = selectedItems.map(studentRow => {
        return studentRow.querySelector('td:nth-child(2)').textContent; // Assuming the second cell contains the student ID
    });

    if (studentIds.length === 0) {
        alert("No students selected. Please select at least one student.");
        return;
    }

    try {
        // Make a POST request to the backend to assign the advisor
        const response = await fetch("/assign-advisor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentIds, advisorId: selectedAdvisor.id }),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Failed to assign advisor: ${error.message}`);
            return;
        }

        // Update the UI if the backend operation was successful
        selectedItems.forEach(studentRow => {
            const advisorCell = studentRow.querySelector('td:nth-child(11)'); // Advisor cell
            advisorCell.textContent = selectedAdvisor.name; // Update UI with the advisor name

            // Remove any existing event listeners to avoid conflict
            const newAdvisorCell = advisorCell.cloneNode(true);
            advisorCell.parentNode.replaceChild(newAdvisorCell, advisorCell);

            // Add click event listener to the new advisor cell
            newAdvisorCell.addEventListener('click', function () {
                if (newAdvisorCell.textContent !== "No Advisor" && newAdvisorCell.textContent !== "") {
                    // Show the advisor's info
                    showAdvisorInfo(newAdvisorCell.textContent);
                } else {
                    // Show 'Students without advisors' popup
                    showStudentsWithoutAdvisor();
                }
            });

            // Uncheck the student checkbox after assigning
            studentRow.querySelector('.student-checkbox').checked = false;
        });

        alert("Advisor assigned successfully.");
    } catch (error) {
        console.error("Error assigning advisor:", error);
        alert("An error occurred while assigning the advisor. Please try again.");
    } finally {
        closeAssignConfirmation(); // Close the confirmation popup
    }
}


function cancelAssign() {
    // Reset the selected items and advisor
    selectedItems = [];
    selectedAdvisor = null;

    // Close the assign confirmation popup and overlay
    closeAssignConfirmation();
}


function closePopup() {
    document.getElementById("advisorPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

async function unassignAdvisor() {
    selectedItems = [...document.querySelectorAll('.student-checkbox:checked')].map(checkbox => checkbox.closest('tr'));

    if (selectedItems.length === 0) {
        alert("Please select at least one student to unassign an advisor.");
        return;
    }

    const studentIDs = selectedItems.map(row => row.querySelector('td:nth-child(2)').textContent.trim());

    try {
        const response = await fetch('http://localhost:3000/api/students/unassign-advisor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentIDs }),
        });

        if (!response.ok) {
            throw new Error("Failed to unassign advisors.");
        }

        const result = await response.json();
        console.log('Unassignment result:', result);

        selectedItems.forEach(row => {
            const advisorCell = row.querySelector('td:nth-child(11)');
            advisorCell.textContent = ""; // Clear the advisor assignment in the UI
            row.querySelector('.student-checkbox').checked = false; // Uncheck the checkbox
        });

        alert("Advisors successfully unassigned from selected students.");
        closeUnassignPopup();
    } catch (error) {
        console.error("Error unassigning advisors:", error);
        alert("Failed to unassign advisors. Please try again.");
    }
}

async function confirmUnassign() {
    if (!selectedItems || selectedItems.length === 0) {
        alert("No students selected for unassignment.");
        return;
    }

    // Extract student IDs from the selected rows
    const studentIDs = selectedItems.map(row => row.querySelector('td:nth-child(2)').textContent);

    try {
        // Send unassignment request to the server
        const response = await fetch('/api/students/unassign-advisor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentIDs }), // Send student IDs to the server
        });

        if (!response.ok) {
            throw new Error('Failed to unassign advisors.');
        }

        const result = await response.json();
        console.log('Unassignment result:', result);

        // Update the UI
        selectedItems.forEach(studentRow => {
            studentRow.querySelector('td:nth-child(11)').textContent = ""; // Clear advisor column in UI
            studentRow.querySelector('.student-checkbox').checked = false; // Uncheck the checkbox
        });

        alert("Advisors successfully unassigned from selected students.");
        closeUnassignPopup(); // Close the unassign popup
    } catch (error) {
        console.error('Error unassigning advisors:', error);
        alert("Failed to unassign advisors. Please try again.");
    }
}

function closeUnassignPopup() {
    document.getElementById("unassignPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

async function showStudentsWithoutAdvisor() {
    try {
        const response = await fetch('http://localhost:3000/api/students/without-advisor'); // Correct backend URL
        
        if (!response.ok) {
            throw new Error('Failed to fetch students without advisors');
        }

        const students = await response.json();
        const studentsWithoutAdvisorList = document.getElementById("studentsWithoutAdvisorList");
        studentsWithoutAdvisorList.innerHTML = '';

        if (students.length > 0) {
            students.forEach(student => {
                const listItem = document.createElement("li");
                listItem.textContent = `ID: ${student.id}, Name: ${student.fullname}`;
                studentsWithoutAdvisorList.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement("li");
            listItem.textContent = "No students without advisors.";
            studentsWithoutAdvisorList.appendChild(listItem);
        }

        document.getElementById("studentsWithoutAdvisorPopup").style.display = "block";
        document.getElementById("overlay").style.display = "block";
    } catch (error) {
        console.error('Error fetching students without advisors:', error);
        alert('Failed to load students without advisors. Please try again later.');
    }
}

function closeStudentsWithoutAdvisorPopup() {
    document.getElementById("studentsWithoutAdvisorPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

async function showAdvisorsWithoutStudents() {
    try {
        // Clear the existing list to ensure fresh data
        const advisorsWithoutStudentsList = document.getElementById("advisorsWithoutStudentsList");
        advisorsWithoutStudentsList.innerHTML = '';

        // Fetch advisors without students from the server
        const response = await fetch('http://localhost:3000/api/advisors/without-students'); // Updated API endpoint
        if (!response.ok) {
            throw new Error(`Failed to fetch advisors without students: ${response.statusText}`);
        }

        const advisors = await response.json(); // Expecting a JSON response with an array of advisor objects

        // Populate the list with advisors
        if (advisors.length > 0) {
            advisors.forEach(advisor => {
                const listItem = document.createElement("li");
                listItem.textContent = advisor.name; // Use the "name" property from the response
                advisorsWithoutStudentsList.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement("li");
            listItem.textContent = "No advisors without students.";
            advisorsWithoutStudentsList.appendChild(listItem);
        }

        // Show the popup
        document.getElementById("advisorsWithoutStudentsPopup").style.display = "block";
        document.getElementById("overlay").style.display = "block";

    } catch (error) {
        console.error('Error fetching advisors without students:', error);
        alert('Failed to load advisors without students. Please try again later.');
    }
}

function closeAdvisorsWithoutStudentsPopup() {
    // Hide the popup and overlay
    document.getElementById("advisorsWithoutStudentsPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";

    // Clear the advisors list to ensure a fresh state for the next time it's opened
    const advisorsWithoutStudentsList = document.getElementById("advisorsWithoutStudentsList");
    advisorsWithoutStudentsList.innerHTML = '';
}

function closeAdvisorInfo() {
    document.getElementById("advisorInfoPopup").style.display = "none";
}


async function toggleSelectAll(selectAllCheckbox) {
    try {
        // Determine the new selection state
        const isSelected = selectAllCheckbox.checked;

        // Send the updated state to the backend for database synchronization
        const response = await fetch('http://localhost:3000/api/select-all-students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectAll: isSelected })
        });

        if (!response.ok) {
            throw new Error('Failed to update selection state in the database.');
        }

        // Get all the checkboxes for students
        const studentCheckboxes = document.querySelectorAll('.student-checkbox');

        // Set each student's checkbox to the same state as the "select all" checkbox
        studentCheckboxes.forEach(checkbox => {
            checkbox.checked = isSelected;
        });

        
    } catch (error) {
        console.error('Error updating select all functionality:', error);
        
    }
}

async function toggleSelectAllAdvisors(selectAllCheckbox) {
    try {
        const isSelected = selectAllCheckbox.checked;

        // Send the updated state to the backend
        const response = await fetch('http://localhost:3000/api/select-all-advisors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectAll: isSelected }),
        });

        if (!response.ok) {
            throw new Error('Failed to update advisor selection state in the database.');
        }

        // Update the checkboxes in the UI
        const advisorCheckboxes = document.querySelectorAll('.advisor-checkbox');
        advisorCheckboxes.forEach(checkbox => {
            checkbox.checked = isSelected;
        });

        
    } catch (error) {
        console.error('Error updating select all functionality for advisors:', error);
        
    }
}


// Show the Add Student modal
function showAddStudentPopup() {
    document.getElementById("addStudentModal").style.display = "block";
}

// Close the Add Student modal
function closeAddStudentPopup() {
    document.getElementById("addStudentModal").style.display = "none";
}

// Function to add a new student
async function addStudent() {
    // Get form values
    const studentID = document.getElementById("studentID").value;
    const fullName = document.getElementById("fullName").value;
    const speciality = document.getElementById("speciality").value;
    const status = document.getElementById("status").value;
    const mobilePhone = document.getElementById("mobilePhone").value;
    const personalEmail = document.getElementById("personalEmail").value;
    const universityEmail = document.getElementById("universityEmail").value;
    const coopStartDate = document.getElementById("coopStartDate").value;
    const coopEndDate = document.getElementById("coopEndDate").value;

    // Check if all fields are filled
    if (studentID && fullName && speciality && status && mobilePhone && personalEmail && universityEmail && coopStartDate && coopEndDate) {
        try {
            // Send data to backend API
            const response = await fetch(`http://localhost:3000/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: studentID,               // Adjusted to match backend expectation
                    fullname: fullName,
                    speciality: speciality,
                    status: status,
                    mobilephone: mobilePhone,
                    personalemail: personalEmail,
                    universityemail: universityEmail,
                    coopstartdate: coopStartDate,
                    coopenddate: coopEndDate,
                    advisorid: null               // Assuming no advisor is assigned initially
                })
            });

            if (response.ok) {
                // Reload student table to reflect changes
                fetchStudentsAndPopulateTable();

                // Close the modal after adding the student
                closeAddStudentPopup();

                // Reset the form
                document.getElementById("addStudentForm").reset();
            } else {
                throw new Error("Failed to add student");
            }
        } catch (error) {
            console.error("Error adding student:", error);
            alert("An error occurred while adding the student. Please try again.");
        }
    } else {
        alert("Please fill in all required fields.");
    }
}

// Function to show the Edit Student modal for the selected student
async function handleEditStudentButton() {
    const selectedCheckbox = document.querySelector('#studentTableBody input[type="checkbox"]:checked');
    if (!selectedCheckbox) {
        alert("Please select a student to edit.");
        return;
    }

    const selectedRow = selectedCheckbox.closest('tr');
    const studentID = selectedRow.querySelector('td:nth-child(2)').textContent.trim();
    const rowIndex = Array.from(selectedRow.parentNode.children).indexOf(selectedRow); // Get the row index

    document.getElementById("editRowIndex").value = rowIndex; // Store row index in a hidden field

    try {
        const response = await fetch(`http://localhost:3000/students/${studentID}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const studentData = await response.json();

            // Populate the modal with fetched data
            document.getElementById("editStudentID").value = studentData.id;
            document.getElementById("editFullName").value = studentData.fullname;
            document.getElementById("editSpeciality").value = studentData.speciality;
            document.getElementById("editStatus").value = studentData.status;
            document.getElementById("editMobilePhone").value = studentData.mobilephone;
            document.getElementById("editPersonalEmail").value = studentData.personalemail;
            document.getElementById("editUniversityEmail").value = studentData.universityemail;
            document.getElementById("editCoopStartDate").value = studentData.coopstartdate;
            document.getElementById("editCoopEndDate").value = studentData.coopenddate;

            // Show the modal
            document.getElementById("editStudentModal").style.display = "block";
        } else {
            throw new Error(`Failed to fetch student with ID: ${studentID}`);
        }
    } catch (error) {
        console.error("Error fetching student details:", error);
        alert("An error occurred while fetching student details. Please try again.");
    }
}

function showEditStudentPopup(rowIndex) {
    console.log("Row Index Received:", rowIndex); // Debugging

    const row = document.querySelector(`#studentTableBody tr:nth-child(${parseInt(rowIndex) + 1})`);
    if (!row) {
        console.error("Row not found for rowIndex:", rowIndex);
        alert("Unable to locate the student in the table.");
        return;
    }

    const cells = row.getElementsByTagName("td");

    // Store rowIndex in the hidden field
    document.getElementById("editRowIndex").value = rowIndex;

    // Populate modal fields
    document.getElementById("editStudentID").value = cells[1].textContent.trim();
    document.getElementById("editFullName").value = cells[2].textContent.trim();
    document.getElementById("editSpeciality").value = cells[3].textContent.trim();
    document.getElementById("editStatus").value = cells[4].textContent.trim();
    document.getElementById("editMobilePhone").value = cells[5].textContent.trim();
    document.getElementById("editPersonalEmail").value = cells[6].textContent.trim();
    document.getElementById("editUniversityEmail").value = cells[7].textContent.trim();
    document.getElementById("editCoopStartDate").value = cells[8].textContent.trim();
    document.getElementById("editCoopEndDate").value = cells[9].textContent.trim();

    console.log("Modal populated for rowIndex:", rowIndex); // Debugging

    // Show the modal
    document.getElementById("editStudentModal").style.display = "block";
}

// Function to close the Edit Student modal
function closeEditStudentPopup() {
    // Hide the modal
    document.getElementById("editStudentModal").style.display = "none";

    // Clear input fields
    const fieldsToClear = [
        "editStudentID",
        "editFullName",
        "editSpeciality",
        "editStatus",
        "editMobilePhone",
        "editPersonalEmail",
        "editUniversityEmail",
        "editCoopStartDate",
        "editCoopEndDate",
    ];
    fieldsToClear.forEach(fieldID => {
        document.getElementById(fieldID).value = '';
    });

    console.log("Edit Student modal closed and inputs cleared.");
}

// Function to save the edited student data
async function saveEditedStudent() {
    // Get updated values from the modal form
    const studentID = document.getElementById("editStudentID").value.trim();
    const fullName = document.getElementById("editFullName").value.trim();
    const speciality = document.getElementById("editSpeciality").value.trim();
    const status = document.getElementById("editStatus").value.trim();
    const mobilePhone = document.getElementById("editMobilePhone").value.trim();
    const personalEmail = document.getElementById("editPersonalEmail").value.trim();
    const universityEmail = document.getElementById("editUniversityEmail").value.trim();
    const coopStartDate = document.getElementById("editCoopStartDate").value.trim();
    const coopEndDate = document.getElementById("editCoopEndDate").value.trim();

    // Check if all required fields are filled
    if (!studentID || !fullName || !speciality || !status || !mobilePhone || !personalEmail || !universityEmail || !coopStartDate || !coopEndDate) {
        alert("All fields are required to commit the edit. Please fill in all fields.");
        return;
    }

    try {
        // Make a PUT request to update the student in the database
        const response = await fetch(`http://localhost:3000/students/${studentID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullname: fullName,
                speciality: speciality,
                status: status,
                mobilephone: mobilePhone,
                personalemail: personalEmail,
                universityemail: universityEmail,
                coopstartdate: coopStartDate,
                coopenddate: coopEndDate,
                advisorid: null, // Adjust as necessary
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update student: ${response.statusText}`);
        }

        // Reload students and update the table
        fetchStudentsAndPopulateTable();

        // Close the edit modal
        closeEditStudentPopup();
    } catch (error) {
        console.error("Error updating student:", error);
        alert("An unexpected error occurred while updating the student. Please try again.");
    }
}

// Function to update status colors for all rows
async function updateStatusColors() {
    try {
        // Fetch the latest student data from the database
        const response = await fetch('http://localhost:3000/students', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch students data");
        }

        const students = await response.json(); // Assuming the response is a JSON array of students
        console.log("Fetched students:", students); // Debugging log

        const studentRows = document.querySelectorAll("#studentTableBody tr");

        // Update each row based on the fetched data
        studentRows.forEach(row => {
            const studentIDCell = row.querySelector("td:nth-child(2)"); // Assuming ID is in the 2nd column
            const statusCell = row.querySelector("td:nth-child(5)"); // Assuming status is in the 5th column

            if (studentIDCell && statusCell) {
                const studentID = studentIDCell.textContent.trim();
                const studentData = students.find(student => student.id.toString() === studentID); // Find matching student

                if (studentData) {
                    console.log(`Updating status for student ID: ${studentID}`, studentData); // Debugging log

                    // Update the status cell's color and text
                    if (studentData.status === 'Active') {
                        statusCell.style.color = 'green';
                        statusCell.style.fontWeight = 'bold';
                    } else if (studentData.status === 'Inactive') {
                        statusCell.style.color = 'red';
                        statusCell.style.fontWeight = 'bold';
                    } else {
                        // Handle unexpected status values gracefully
                        statusCell.style.color = 'black'; // Default color
                        statusCell.style.fontWeight = 'normal';
                    }

                    statusCell.textContent = studentData.status; // Update the text to the current status
                } else {
                    console.warn(`No matching student found for ID: ${studentID}`); // Debugging log
                }
            } else {
                console.warn("Missing ID or status cell in a row:", row); // Debugging log
            }
        });
    } catch (error) {
        console.error("Error updating status colors:", error);
        alert("An error occurred while updating the status colors. Please try again.");
    }
}

async function contactSelectedStudents() {
    // Get all checked student checkboxes
    const selectedCheckboxes = document.querySelectorAll('#studentTableBody input[type="checkbox"]:checked');
    
    // If no students are selected, alert the user and stop the function
    if (selectedCheckboxes.length === 0) {
        alert("Please select at least one student.");
        return;
    }

    // Collect the IDs of the selected students
    const studentIDs = [];
    selectedCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr'); // Get the row for the selected student
        const studentID = row.querySelector('td:nth-child(2)').textContent.trim(); // Get the student ID from the 2nd column
        if (studentID) {
            studentIDs.push(studentID);
        }
    });

    // If no IDs were found, alert the user
    if (studentIDs.length === 0) {
        alert("No student IDs found for the selected students.");
        return;
    }

    try {
        // Fetch student details from the backend
        const response = await fetch('http://localhost:3000/students/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: studentIDs }) // Send the selected student IDs
        });

        if (!response.ok) {
            throw new Error("Failed to fetch student emails from the database.");
        }

        const students = await response.json(); // Assuming the response contains an array of students with emails

        // Collect university emails
        const emailAddresses = students.map(student => student.universityemail).filter(email => email);

        // If no emails were found, alert the user
        if (emailAddresses.length === 0) {
            alert("No university emails found for the selected students.");
            return;
        }

        // Construct the Gmail URL with the selected emails
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddresses.join(',')}`;
        
        // Open the Gmail compose window with the email addresses
        window.open(gmailLink, '_blank');
    } catch (error) {
        console.error("Error contacting students:", error);
        alert("An error occurred while fetching student emails. Please try again.");
    }
}

async function contactSelectedAdvisors() {
    // Get all checked advisor checkboxes
    const selectedCheckboxes = document.querySelectorAll('#advisorTableBody input[type="checkbox"]:checked');

    // If no advisors are selected, alert the user and stop the function
    if (selectedCheckboxes.length === 0) {
        alert("Please select at least one advisor.");
        return;
    }

    // Collect the IDs of the selected advisors
    const advisorIDs = [];
    selectedCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr'); // Get the row for the selected advisor
        const advisorID = row.querySelector('td:nth-child(2)').textContent.trim(); // Get the ID from the 2nd column
        if (advisorID) {
            advisorIDs.push(advisorID);
        }
    });

    // If no IDs were found, alert the user
    if (advisorIDs.length === 0) {
        alert("No advisor IDs found for the selected advisors.");
        return;
    }

    try {
        // Fetch advisor details from the backend
        const response = await fetch('http://localhost:3000/advisors/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: advisorIDs }) // Send the selected advisor IDs
        });

        if (!response.ok) {
            throw new Error("Failed to fetch advisor emails from the database.");
        }

        const advisors = await response.json(); // Assuming the response contains an array of advisors with emails

        // Collect advisor emails
        const emailAddresses = advisors.map(advisor => advisor.email).filter(email => email);

        // If no emails were found, alert the user
        if (emailAddresses.length === 0) {
            alert("No emails found for the selected advisors.");
            return;
        }

        // Construct the Gmail URL with the selected advisor emails
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddresses.join(',')}`;
        
        // Open the Gmail compose window with the advisor email addresses
        window.open(gmailLink, '_blank');
    } catch (error) {
        console.error("Error contacting advisors:", error);
        alert("An error occurred while fetching advisor emails. Please try again.");
    }
}

// Fetch and toggle the time graph
async function toggleTimeGraph() {
    const timeGraphContainer = document.getElementById('timeGraphContainer');
    const timelineViewSelector = document.getElementById('timelineViewSelector');

    // Toggle visibility of the graph and the dropdown
    const isGraphVisible = timeGraphContainer.style.display === 'block';
    timeGraphContainer.style.display = isGraphVisible ? 'none' : 'block';
    timelineViewSelector.style.display = isGraphVisible ? 'none' : 'block';

    if (!isGraphVisible) {
        try {
            const timelineView = timelineViewSelector.value; // Get the selected timeline view

            // Fetch timeline data from the backend
            const response = await fetch(`http://localhost:3000/timelines?view=${encodeURIComponent(timelineView)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch student timeline data from the database.');
            }

            const timelineData = await response.json();
            console.log('Fetched timeline data:', timelineData); // Debugging log
            renderTimeGraphPlotly(timelineData, timelineView);
        } catch (error) {
            console.error('Error fetching or rendering time graph data:', error);
            alert('An error occurred while fetching the graph data.');
        }
    }
}

// Render the graph with Plotly
function renderTimeGraphPlotly(data, timelineView) {
    const traces = [];

    data.forEach((item) => {
        const { student_id, fullname, start_date, end_date, report_date } = item;
        const xValues = [];
        const yValues = [];
        const hoverTexts = [];

        if (start_date && end_date && (timelineView === 'startEnd' || timelineView === 'all')) {
            xValues.push(start_date, end_date);
            yValues.push(student_id, student_id);
            hoverTexts.push(`Start: ${formatDate(start_date)}`, `End: ${formatDate(end_date)}`);
        }

        if (report_date && (timelineView !== 'startEnd')) {
            xValues.push(report_date);
            yValues.push(student_id);
            hoverTexts.push(`Report: ${formatDate(report_date)}`);
        }

        traces.push({
            x: xValues,
            y: yValues,
            mode: 'lines+markers',
            name: `${fullname} Timeline`,
            text: hoverTexts,
            hoverinfo: 'text',
            line: { color: 'blue', width: 2 },
            marker: { size: 6 },
        });
    });

    const layout = {
        title: 'Student Co-op Timelines',
        xaxis: { title: 'Date', type: 'date' },
        yaxis: { title: 'Student ID', type: 'category' },
    };

    Plotly.newPlot('timeGraphChart', traces, layout);
}

// Function to update the graph when the timeline view changes
async function updateTimeGraph() {
    const timelineViewSelector = document.getElementById('timelineViewSelector');
    const timelineView = timelineViewSelector.value; // Get the selected timeline view

    try {
        // Fetch timeline data from the backend
        const response = await fetch(`http://localhost:3000/timelines?view=${encodeURIComponent(timelineView)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch timeline data from the database.');
        }

        const timelineData = await response.json();
        console.log('Fetched timeline data:', timelineData); // Debugging log

        // Render the graph with the updated data
        renderTimeGraphPlotly(timelineData, timelineView);
    } catch (error) {
        console.error('Error updating time graph:', error);
        alert('An error occurred while updating the graph. Please try again.');
    }
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Call this function on page load to update all existing data
window.onload = function () {

    updateStatusColors(); // Update status colors for existing data when the page loads
    // Initialize and load data when the page is loaded

window.onload = async function () {
    if (currentTable === "student") {
        await fetchStudentsAndPopulateTable();
    } else {
        await fetchAdvisorsAndPopulateTable();
    }
};
};

// Close the modal if the user clicks outside of it
window.onclick = function (event) {
    const modal = document.getElementById("addStudentModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
