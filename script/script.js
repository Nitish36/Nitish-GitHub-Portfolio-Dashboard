const USERNAME = 'Nitish36'; // Change this!

async function initDashboard() {
    // 1. Fetch User Stats
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`);
    const user = await userRes.json();
    document.getElementById('total-repos').innerText = user.public_repos;
    document.getElementById('total-followers').innerText = user.followers;
    document.getElementById('total-following').innerText = user.following;

    // 2. Fetch Repos
    const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`);
    const repos = await reposRes.json();

    let totalStars = 0;
    let languages = {};
    let yearlyData = {};

    const tableBody = document.querySelector('#repo-table tbody');

    repos.sort((a,b) => b.stargazers_count - a.stargazers_count).slice(0, 5).forEach(repo => {
        totalStars += repo.stargazers_count;
        
        // Process Languages for Donut
        if(repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;

        // Process Yearly Creation for Line Chart
        let year = new Date(repo.created_at).getFullYear();
        yearlyData[year] = (yearlyData[year] || 0) + 1;

        // Build Table
        tableBody.innerHTML += `
            <tr>
                <td>${repo.name}</td>
                <td><span class="tag">${repo.language || 'N/A'}</span></td>
                <td>${repo.stargazers_count}</td>
                <td>${new Date(repo.updated_at).toLocaleDateString()}</td>
            </tr>
        `;
    });
    document.getElementById('total-stars').innerText = totalStars;

    // 3. Render Charts (Like Looker configuration)
    new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: Object.keys(yearlyData),
            datasets: [{
                label: 'Repos Created',
                data: Object.values(yearlyData),
                borderColor: '#00f2ff',
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('donutChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(languages),
            datasets: [{
                data: Object.values(languages),
                backgroundColor: ['#ffb400', '#00f2ff', '#bc6ff1', '#238636']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 4. Fetch Activity
    const actRes = await fetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=5`);
    const events = await actRes.json();
    const actTable = document.querySelector('#activity-table tbody');
    events.forEach(ev => {
        actTable.innerHTML += `<tr><td>${ev.repo.name.split('/')[1]}</td><td>${ev.type.replace('Event','')}</td><td>${new Date(ev.created_at).toLocaleDateString()}</td></tr>`;
    });
}

initDashboard();