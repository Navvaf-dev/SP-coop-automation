const advisors = `[
    {
        "ID": 2001,
        "Full Name": "Dr. Alice Johnson",
        "Email": "alice.johnson@university.edu"
    },
    {
        "ID": 2002,
        "Full Name": "Dr. Michael Thompson",
        "Email": "michael.thompson@university.edu"
    },
    {
        "ID": 2003,
        "Full Name": "Dr. Emma Williams",
        "Email": "emma.williams@university.edu"
    },
    {
        "ID": 2004,
        "Full Name": "Dr. David Harris",
        "Email": "david.harris@university.edu"
    },
    {
        "ID": 2005,
        "Full Name": "Dr. Sarah Green",
        "Email": "sarah.green@university.edu"
    },
    {
        "ID": 2006,
        "Full Name": "Dr. John Carter",
        "Email": "john.carter@university.edu"
    },
    {
        "ID": 2007,
        "Full Name": "Dr. Olivia Martin",
        "Email": "olivia.martin@university.edu"
    },
    {
        "ID": 2008,
        "Full Name": "Dr. Ethan Johnson",
        "Email": "ethan.johnson@university.edu"
    }
]`;

// Parse the JSON string into an object
const advisorDataArr = JSON.parse(advisors);

// Export the advisor data array
export { advisorDataArr };
