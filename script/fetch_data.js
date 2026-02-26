const fs = require('fs');

async function run() {
    const username = 'Nitish36'; 
    const token = process.env.MY_GITHUB_TOKEN; // It grabs this from the "Vault"
    const headers = { "Authorization": `token ${token}` };

    console.log("Fetching data for " + username);

    // Fetch Profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    const user = await userRes.json();

    // Fetch Repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
    const repos = await reposRes.json();

    // Create one big object
    const finalData = {
        user: user,
        repos: repos,
        lastUpdated: new Date().toLocaleString()
    };

    // Save it to a file
    fs.writeFileSync('github-data.json', JSON.stringify(finalData, null, 2));
    console.log("Done! Data saved to github-data.json");
}

run();
