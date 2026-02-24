const USER = 'Nitish36'; // <-- Change this!

async function fetchData() {
    try {
        // 1. Get Profile Info
        const userRes = await fetch(`https://api.github.com/users/${USER}`);
        const userData = await userRes.json();
        
        document.getElementById('profile').innerHTML = `
            <img src="${userData.avatar_url}" class="avatar" alt="Avatar">
            <div class="bio">
                <h1>${userData.name || USER}</h1>
                <p>${userData.bio || 'Software Developer & Data Enthusiast'}</p>
            </div>
        `;
        document.getElementById('repo-count').innerText = userData.public_repos;
        document.getElementById('follower-count').innerText = userData.followers;

        // 2. Get Repositories & Calculate Stars
        const reposRes = await fetch(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=6`);
        const reposData = await reposRes.json();
        
        let totalStars = 0;
        const projectList = document.getElementById('projects-list');
        projectList.innerHTML = '';

        reposData.forEach(repo => {
            totalStars += repo.stargazers_count;
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <a href="${repo.html_url}" class="project-title" target="_blank">${repo.name}</a>
                <p class="project-desc">${repo.description || 'No description provided.'}</p>
                <span class="lang-tag">${repo.language || 'Plain Text'}</span>
                <span style="font-size: 0.8rem; color: #ffffff; margin-left: 10px;">⭐ ${repo.stargazers_count}</span>
            `;
            projectList.appendChild(card);
        });
        document.getElementById('star-count').innerText = totalStars;

        // 3. Get Recent Activity
        const activityRes = await fetch(`https://api.github.com/users/${USER}/events/public?per_page=10`);
        const activityData = await activityRes.json();
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';

        activityData.forEach(event => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            const type = event.type.replace('Event', '');
            const repo = event.repo.name.split('/')[1];
            const date = new Date(event.created_at).toLocaleDateString();
            
            item.innerHTML = `
                <strong>${type}</strong> in <span>${repo}</span>
                <div class="activity-date">${date}</div>
            `;
            activityList.appendChild(item);
        });

    } catch (e) {
        console.error("Error fetching data:", e);
    }
}

fetchData();