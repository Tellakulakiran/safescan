const lat = 17.44829;
const lon = 78.37411;
const amenity = 'hospital';

async function testLocalApi() {
  const url = `http://localhost:3000/api/nearby?lat=${lat}&lon=${lon}&amenity=${amenity}`;
  console.log(`Sending GET request to local API: ${url}`);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response length: ${text.length}`);
    if (res.ok) {
      const data = JSON.parse(text);
      console.log(`Successfully fetched ${data.elements?.length || 0} elements!`);
    } else {
      console.log("Raw Response:", text.slice(0, 500));
    }
  } catch (error) {
    console.log("Fetch failed. Trying port 3001...");
    try {
      const res = await fetch(url.replace(':3000', ':3001'));
      const text = await res.text();
      console.log(`Status: ${res.status}`);
      console.log(`Response length: ${text.length}`);
      if (res.ok) {
        const data = JSON.parse(text);
        console.log(`Successfully fetched ${data.elements?.length || 0} elements!`);
      } else {
        console.log("Raw Response:", text.slice(0, 500));
      }
    } catch (err) {
      console.error("Failed to connect on both ports:", err.message);
    }
  }
}

testLocalApi();
