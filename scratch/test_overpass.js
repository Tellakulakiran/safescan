const lat = 17.44829; // Sample coordinates (Hyderabad/India area as a test)
const lon = 78.37411;

async function testOverpass(amenity) {
  const radius = 5000;
  // Searching nodes, ways, and relations using center coordinates
  const query = `[out:json][timeout:10];(node["amenity"="${amenity}"](around:${radius},${lat},${lon});way["amenity"="${amenity}"](around:${radius},${lat},${lon});relation["amenity"="${amenity}"](around:${radius},${lat},${lon}););out center 10;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  console.log(`Fetching ${amenity} from Overpass API...`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SafeScanEmergencyApp/1.0 (https://safescan.vercel.app; tellakulakiran@gmail.com)",
        "Accept": "application/json"
      }
    });
    const text = await res.text();
    console.log(`HTTP Status: ${res.status}`);
    if (!res.ok) {
      console.log("Raw Response:", text.slice(0, 500));
      return;
    }
    const data = JSON.parse(text);
    const elements = data.elements || [];
    console.log(`Found ${elements.length} elements.`);
    if (elements.length > 0) {
      console.log("Sample element:", JSON.stringify(elements[0], null, 2));
    }
  } catch (error) {
    console.error(`Error fetching ${amenity}:`, error);
  }
}

async function run() {
  await testOverpass("hospital");
  await testOverpass("pharmacy");
  await testOverpass("police");
}

run();
