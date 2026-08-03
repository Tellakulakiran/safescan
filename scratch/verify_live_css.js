async function verifyLiveCss() {
  const url = 'https://safescan-79br.vercel.app/';
  console.log(`Fetching HTML from live deployment: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SafeScanVerificationScript/1.0'
      }
    });
    if (!res.ok) {
      console.log(`Failed to fetch HTML: ${res.statusText}`);
      return;
    }
    const html = await res.text();
    const cssMatch = html.match(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/);
    if (cssMatch) {
      const cssUrl = new URL(cssMatch[1], url).toString();
      await checkCssContent(cssUrl);
    } else {
      console.log("Next.css styles chunk not found in HTML.");
    }
    return;
    
    console.log(`Found ${cssMatches.length} Next.js CSS links:`);
    for (const match of cssMatches) {
      const cssPath = match.slice(6, -1);
      const cssUrl = new URL(cssPath, url).toString();
      await checkCssContent(cssUrl);
    }
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}

async function checkCssContent(cssUrl) {
  console.log(`Checking CSS file content at: ${cssUrl}`);
  try {
    const res = await fetch(cssUrl);
    const cssText = await res.text();
    // Search for --accent or --cyan or background:var(--bg)
    const hasCyanAccent = cssText.includes('--accent:#00b4c8') || cssText.includes('--accent');
    const hasSlateBg = cssText.includes('--bg:#090e14') || cssText.includes('090e14');
    console.log(`- Contains cyan accent: ${hasCyanAccent}`);
    console.log(`- Contains slate background: ${hasSlateBg}`);
  } catch (error) {
    console.log(`Error checking CSS: ${error.message}`);
  }
}

verifyLiveCss();
