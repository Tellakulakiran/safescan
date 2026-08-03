async function getVercelUrl() {
  const repo = 'Tellakulakiran/safescan';
  const url = `https://api.github.com/repos/${repo}/commits/main/check-runs`;
  console.log("Querying GitHub commit status checks...");
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SafeScanDeployScript/1.0',
        'Accept': 'application/vnd.github+json'
      }
    });
    
    if (!res.ok) {
      console.log(`Failed to fetch commit checks: ${res.statusText}`);
      return;
    }
    
    const data = await res.json();
    const checkRuns = data.check_runs || [];
    console.log(`Found ${checkRuns.length} checks.`);
    
    let vercelUrl = '';
    for (const run of checkRuns) {
      if (run.app?.name === 'Vercel' || run.name?.toLowerCase().includes('vercel')) {
        console.log(`Checking run: ${run.name}`);
        console.log(`Target URL: ${run.details_url || 'None'}`);
        if (run.details_url) {
          vercelUrl = run.details_url;
        }
      }
    }
    
    if (vercelUrl) {
      console.log(`\n🎉 Found Live Deployment URL: ${vercelUrl}`);
    } else {
      console.log("\nNo Vercel URLs found in checks. Checking statuses instead...");
      const statusUrl = `https://api.github.com/repos/${repo}/commits/main/statuses`;
      const statusRes = await fetch(statusUrl, {
        headers: {
          'User-Agent': 'SafeScanDeployScript/1.0',
          'Accept': 'application/vnd.github+json'
        }
      });
      const statusData = await statusRes.json();
      const vercelStatus = statusData.find(s => s.context?.toLowerCase().includes('vercel'));
      if (vercelStatus) {
        console.log(`\n🎉 Found Live Deployment URL: ${vercelStatus.target_url}`);
      } else {
        console.log("\nNo Vercel deployment status found in GitHub. The deployment might still be in progress.");
      }
    }
  } catch (error) {
    console.error("Error querying GitHub:", error.message);
  }
}

getVercelUrl();
