const USERNAME = 'Nitish36';

// Register Global Plugin for Chart.js to show numbers above bars
const topLabelsPlugin = {
    id: 'topLabels',
    afterDatasetsDraw(chart) {
        const {ctx, data} = chart;
        if (chart.config.type !== 'bar') return;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = 'bold 10px sans-serif';
        chart.getDatasetMeta(0).data.forEach((bar, index) => {
            const value = data.datasets[0].data[index];
            ctx.fillStyle = data.datasets[0].backgroundColor;
            ctx.fillText(value, bar.x, bar.y - 5);
        });
    }
};
Chart.register(topLabelsPlugin);

async function initDashboard() {
    try {
        // --- PART 0: Fetch the local file created by the Robot ---
        const response = await fetch('./github-data.json');
        
        if (!response.ok) {
            throw new Error("github-data.json not found. Make sure your GitHub Action has run successfully.");
        }

        const githubData = await response.json();

        // Extract the pieces from our data package
        const user = githubData.user;
        const repos = githubData.repos;
        const events = githubData.events;

        // Update Header with Avatar and Name
        const header = document.querySelector('header');
        if (header) {
            header.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${user.avatar_url}" style="width: 50px; border-radius: 50%; border: 2px solid var(--accent-cyan);">
                    <h1 style="margin:0;">EXECUTIVE OVERVIEW <span style="color:var(--accent-cyan); font-size: 1rem;">| ${user.name || USERNAME}</span></h1>
                </div>
            `;
        }

        // --- PART 1: USER STATS ---
        const updateElement = document.getElementById('update-time');
        if(updateElement) {
            updateElement.innerText = "Data refreshed on: " + githubData.lastUpdated;
        }
        document.getElementById('total-repos').innerText = user.public_repos;
        document.getElementById('total-followers').innerText = user.followers;
        document.getElementById('total-following').innerText = user.following;

        // --- PART 2: REPOS & TRENDS ---
        let totalStars = 0;
        let languages = {};
        let yearlyData = {};

        const tableBody = document.querySelector('#repo-table tbody');
        tableBody.innerHTML = ''; 

        repos.forEach(repo => {
            totalStars += repo.stargazers_count;
            if(repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;
            let year = new Date(repo.created_at).getFullYear();
            yearlyData[year] = (yearlyData[year] || 0) + 1;
        });

        // Populate Top 5 Repos Table
        [...repos].sort((a,b) => b.stargazers_count - a.stargazers_count).slice(0, 5).forEach(repo => {
            tableBody.innerHTML += `
                <tr>
                    <td>${repo.name}</td>
                    <td><span class="tag">${repo.language || 'N/A'}</span></td>
                    <td>${repo.stargazers_count}</td>
                    <td>${new Date(repo.updated_at).toLocaleDateString()}</td>
                </tr>`;
        });
        document.getElementById('total-stars').innerText = totalStars;

        // --- PART 3: RENDER CHARTS ---
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
                    backgroundColor: ['#ffb400', '#00f2ff', '#bc6ff1', '#238636', '#f85149']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // --- PART 4: BAR CHARTS ---
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        new Chart(document.getElementById('prChart'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{ data: [4, 7, 10, 5, 8, 12, 6, 9, 11, 4, 7, 9], backgroundColor: '#00f2ff', borderRadius: 4 }]
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                scales: { y: { display: false }, x: { grid: { display: false } } },
                plugins: { legend: { display: false } }
            }
        });

        new Chart(document.getElementById('issueChart'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{ data: [2, 4, 3, 6, 5, 8, 4, 3, 7, 5, 2, 4], backgroundColor: '#ffb400', borderRadius: 4 }]
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                scales: { y: { display: false }, x: { grid: { display: false } } },
                plugins: { legend: { display: false } }
            }
        });

        // --- PART 5: RECENT ACTIVITY ---
        const actTable = document.querySelector('#activity-table tbody');
        actTable.innerHTML = ''; 

        if (events && events.length > 0) {
            events.forEach(ev => {
                const repoName = (ev.repo && ev.repo.name) ? (ev.repo.name.split('/')[1] || ev.repo.name) : 'Unknown';
                const eventType = ev.type ? ev.type.replace('Event','') : 'Activity';
                const date = ev.created_at ? new Date(ev.created_at).toLocaleDateString() : 'N/A';

                actTable.innerHTML += `
                    <tr>
                        <td>${repoName}</td>
                        <td>${eventType}</td>
                        <td>${date}</td>
                    </tr>`;
            });
        } else {
            actTable.innerHTML = '<tr><td colspan="3" style="text-align:center;">No recent public activity found.</td></tr>';
        }

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}

// Ensure the script waits for the HTML to load
document.addEventListener('DOMContentLoaded', initDashboard);
