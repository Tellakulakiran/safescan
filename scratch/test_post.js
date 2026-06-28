async function testPost() {
  const url = 'http://localhost:3000/api/profiles'; // Or 3001 depending on port
  const payload = {
    name: "Test User",
    bloodType: "O+",
    dob: "1995-05-15",
    insurance: "Test Insurance",
    organDonor: true,
    allergies: ["Peanuts"],
    medications: ["Aspirin"],
    conditions: "None",
    notes: "No notes",
    contacts: [
      { name: "Emergency Contact", phone: "1234567890", rel: "Friend" }
    ]
  };

  console.log("Sending POST request to /api/profiles...");
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (error) {
    console.log("Fetch failed. Trying port 3001...");
    try {
      const res = await fetch(url.replace(':3000', ':3001'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      console.log(`Status: ${res.status}`);
      console.log(`Response: ${text}`);
    } catch (err) {
      console.error("Failed to connect on both ports:", err.message);
    }
  }
}

testPost();
