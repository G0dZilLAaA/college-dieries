// Declare userData in global scope
let userData;

function showSection(sectionId, element) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    const navItems = document.querySelectorAll('.sidebar ul li');
    navItems.forEach(item => item.classList.remove('active'));
    if (element && element.tagName === 'LI') element.classList.add('active');
    
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
        return;
    }

    const userDataRaw = localStorage.getItem('user');
    console.log('Raw userData from localStorage:', userDataRaw);

    try {
        userData = JSON.parse(userDataRaw);
    } catch (error) {
        console.error('Error parsing userData:', error);
        userData = null;
    }
    console.log('Parsed userData:', userData);

    if (userData) {
        document.getElementById('user-id').textContent = userData.userId || 'Not provided';
        document.getElementById('user-type').textContent = userData.userType || 'Not provided';
        document.getElementById('user-name').textContent = userData.userName || 'Not provided';
        document.getElementById('user-phone').textContent = userData.phone || 'Not provided';
        document.getElementById('user-email').textContent = userData.email || userData.emailId || 'Not provided';
        document.getElementById('user-department').textContent = userData.department || 'Not provided';
        document.getElementById('user-batch').textContent = userData.batch || 'Not provided';
        document.getElementById('user-branch').textContent = userData.branch || 'Not provided';
        document.getElementById('user-field').textContent = userData.field || 'Not provided';
        document.getElementById('user-gymkhana-pos').textContent = userData.announcementsPos || 'Not provided';
    }

    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    showSection('home', document.getElementById('nav-home'));

    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Fetch and display stories
    function loadStories() {
        fetch('http://localhost:8080/api/users/stories', { method: 'GET' })
        .then(response => { if (!response.ok) throw new Error(`Failed to fetch stories: ${response.status}`); return response.json(); })
        .then(stories => {
            const storiesList = document.getElementById('stories-list');
            if (!storiesList) { console.error('stories-list element not found'); return; }
            storiesList.innerHTML = '';
            stories.forEach(story => {
                const storyElement = document.createElement('div');
                storyElement.className = 'card';
                storyElement.innerHTML = `
                    <h4>${story.userName}</h4>
                    <p>${story.posts}</p>
                    <div class="story-actions">
                        <button class="like-btn" data-userid="${story.userId}" data-usertype="${story.userType}" data-timestamp="${story.timestamp}">
                            Like (${story.likeCount})
                        </button>
                        <button class="dislike-btn" data-userid="${story.userId}" data-usertype="${story.userType}" data-timestamp="${story.timestamp}">
                            Dislike (${story.dislikeCount})
                        </button>
                    </div>
                `;
                storiesList.appendChild(storyElement);
            });
            document.querySelectorAll('.like-btn').forEach(btn => btn.addEventListener('click', () => updateStoryAction(btn.getAttribute('data-userid'), btn.getAttribute('data-usertype'), btn.getAttribute('data-timestamp'), 'like')));
            document.querySelectorAll('.dislike-btn').forEach(btn => btn.addEventListener('click', () => updateStoryAction(btn.getAttribute('data-userid'), btn.getAttribute('data-usertype'), btn.getAttribute('data-timestamp'), 'dislike')));
        })
        .catch(error => console.error('Error fetching stories:', error));
    }

    function updateStoryAction(userId, userType, timestamp, action) {
        const endpoint = action === 'like' ? '/api/users/stories/like' : '/api/users/stories/dislike';
        fetch(`http://localhost:8080${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), userType, timestamp })
        })
        .then(response => { if (!response.ok) throw new Error(`Failed to ${action} story: ${response.status}`); return response.text(); })
        .then(data => { console.log(`${action} response:`, data); loadStories(); })
        .catch(error => { console.error(`Error ${action}ing story:`, error); alert(`Failed to ${action} story: ${error.message}`); });
    }

    loadStories();

    const storyForm = document.getElementById('add-story-form');
    if (storyForm) {
        storyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!userData || !userData.userId) {
                console.error('No userData found for story submission');
                alert('User data not found. Please log in again.');
                window.location.href = 'index.html';
                return;
            }
            const storyData = {
                userId: userData.userId,
                userType: userData.userType,
                posts: document.getElementById('story-posts').value.trim(),
                likeCount: 0,
                dislikeCount: 0,
                timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
            if (!storyData.posts) { alert('Story cannot be empty.'); return; }
            fetch('http://localhost:8080/api/users/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storyData)
            })
            .then(response => { if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`); return response.text(); })
            .then(data => { console.log('Story response:', data); document.getElementById('story-posts').value = ''; loadStories(); })
            .catch(error => { console.error('Story upload error:', error); alert('Failed to add story: ' + error.message); });
        });
    } else { console.error('add-story-form not found'); }
});
// MAKE NO CHANGES ABOVE THIS COMMENT PLEASE :)
// do not change area___________________________________________________________________________________________________________________________________________________

// Bazaar functionality
function loadBazaarItems() {
    fetch('http://localhost:8080/api/users/bazaar', { method: 'GET' })
    .then(response => { console.log('Fetch response status:', response.status); if (!response.ok) throw new Error(`Failed to fetch bazaar items: ${response.status}`); return response.json(); })
    .then(items => {
        console.log('Fetched bazaar items:', items);
        const bazaarItems = document.getElementById('bazaar-items');
        if (!bazaarItems) { console.error('bazaar-items element not found'); return; }
        bazaarItems.innerHTML = '';
        if (items.length === 0) { bazaarItems.innerHTML = '<p>No items available.</p>'; return; }
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'card';
            itemElement.style.padding = '20px';
            itemElement.style.background = '#f9f9f9';
            itemElement.style.borderRadius = '10px';
            itemElement.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.1)';
            itemElement.innerHTML = `
                <h4>${item.itemName}</h4>
                <p>Quantity: ${item.count}</p>
                <p>Price: ₹${item.price}</p>
                <p>Type: ${item.itemType}</p>
                <div class="bazaar-actions">
                    ${item.itemType === 'sell' ? `<button class="buy-btn" data-itemid="${item.itemId}">Buy</button>` : `<button class="provide-btn" data-itemid="${item.itemId}">Provide</button>`}
                </div>
            `;
            bazaarItems.appendChild(itemElement);
        });
        document.querySelectorAll('.buy-btn').forEach(btn => btn.addEventListener('click', () => handleBazaarAction(btn.getAttribute('data-itemid'), 'buy')));
        document.querySelectorAll('.provide-btn').forEach(btn => btn.addEventListener('click', () => handleBazaarAction(btn.getAttribute('data-itemid'), 'provide')));
    })
    .catch(error => { console.error('Error fetching bazaar items:', error); bazaarItems.innerHTML = '<p>Error loading items. Check console.</p>'; });
}

function handleBazaarAction(itemId, action) {
    const endpoint = action === 'buy' ? '/api/users/bazaar/buy' : '/api/users/bazaar/provide';
    fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: parseInt(itemId) })
    })
    .then(response => { if (!response.ok) throw new Error(`Failed to ${action} item: ${response.status}`); return response.text(); })
    .then(data => { console.log(`${action} response:`, data); loadBazaarItems(); })
    .catch(error => { console.error(`Error ${action}ing item:`, error); alert(`Failed to ${action} item: ${error.message}`); });
}

const bazaarForm = document.getElementById('add-bazaar-form');
console.log('Bazaar form element:', bazaarForm);
if (bazaarForm) {
    bazaarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted with action:', e.submitter.value);

        if (!userData || !userData.userId) {
            console.error('No userData found for bazaar submission:', userData);
            alert('User data not found. Please log in again.');
            window.location.href = 'index.html';
            return;
        }

        const itemData = {
            userId: userData.userId,
            itemName: document.getElementById('item-name').value.trim(),
            count: parseInt(document.getElementById('item-count').value),
            price: parseInt(document.getElementById('item-price').value),
            itemType: e.submitter.value
        };

        console.log('Submitting bazaar item:', itemData);

        if (!itemData.itemName || itemData.count < 1 || itemData.price < 0) {
            alert('Please provide valid item details. Item name cannot be empty, quantity must be at least 1, and price cannot be negative.');
            return;
        }

        fetch('http://localhost:8080/api/users/bazaar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
        })
        .then(response => {
            console.log('Fetch response status:', response.status);
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`); });
            }
            return response.text();
        })
        .then(data => {
            console.log('Bazaar response:', data);
            document.getElementById('item-name').value = '';
            document.getElementById('item-count').value = '1';
            document.getElementById('item-price').value = '';
            loadBazaarItems();
        })
        .catch(error => {
            console.error('Bazaar upload error:', error);
            alert('Failed to add item: ' + error.message);
        });
    });
} else {
    console.error('add-bazaar-form not found');
}

// Load bazaar items when the bazaar section is shown
document.getElementById('nav-bazaar').addEventListener('click', loadBazaarItems);

// Load items on page load as fallback
loadBazaarItems();

// MAKE NO CHANGES ABOVE THIS COMMENT PLEASE :)
// do not change area___________________________________________________________________________________________________________________________________________________

// ... (previous code up to MAKE NO CHANGES ABOVE THIS COMMENT) ...

// Announcements functionality
function loadAnnouncements() {
    fetch('http://localhost:8080/api/users/announcements', { method: 'GET' })
    .then(response => { console.log('Fetch response status:', response.status); if (!response.ok) throw new Error(`Failed to fetch announcements: ${response.status}`); return response.json(); })
    .then(announcements => {
        const announcementsList = document.getElementById('announcements-list');
        if (!announcementsList) { console.error('announcements-list element not found'); return; }
        announcementsList.innerHTML = '';
        if (announcements.length === 0) { announcementsList.innerHTML = '<p>No announcements available.</p>'; return; }
        announcements.forEach(announcement => {
            const announcementElement = document.createElement('div');
            announcementElement.className = 'card';
            announcementElement.style.padding = '20px';
            announcementElement.style.background = '#f9f9f9';
            announcementElement.style.borderRadius = '10px';
            announcementElement.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.1)';
            announcementElement.innerHTML = `
                <h4>${announcement.title || 'Untitled'}</h4> <!-- Fallback title if needed -->
                <p>${announcement.announcementMessage}</p>
                <p><small>By: ${announcement.userName || 'Unknown'} on ${new Date(announcement.timestamp).toLocaleString()}</small></p>
            `;
            announcementsList.appendChild(announcementElement);
        });
    })
    .catch(error => { console.error('Error fetching announcements:', error); announcementsList.innerHTML = '<p>Error loading announcements. Check console.</p>'; });
}

function handleAnnouncementSubmission() {
    if (!userData || !userData.userId) {
        console.error('No userData found for announcement submission:', userData);
        alert('User data not found. Please log in again.');
        window.location.href = 'index.html';
        return;
    }

    const announcementData = {
        gymkhanaName: userData.announcementsPos || 'DefaultGymkhana', // Adjust based on your logic
        announcementMessage: document.getElementById('announcement-content').value.trim(),
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    if (!announcementData.announcementMessage) {
        alert('Please provide announcement content.');
        return;
    }

    fetch('http://localhost:8080/api/users/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
    })
    .then(response => {
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
            return response.text().then(text => { throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`); });
        }
        return response.text();
    })
    .then(data => {
        console.log('Announcement response:', data);
        document.getElementById('announcement-title').value = '';
        document.getElementById('announcement-content').value = '';
        loadAnnouncements();
        document.getElementById('add-announcement-form-container').style.display = 'none';
    })
    .catch(error => {
        console.error('Announcement upload error:', error);
        alert('Failed to add announcement: ' + error.message);
    });
}

function toggleAnnouncementForm() {
    const formContainer = document.getElementById('add-announcement-form-container');
    const shouldShow = userData && (userData.userType === 'faculty' || userData.userType === 'admin' || userData.announcementsPos !== null);
    formContainer.style.display = shouldShow ? 'block' : 'none';
}

const announcementForm = document.getElementById('add-announcement-form');
if (announcementForm) {
    announcementForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAnnouncementSubmission();
    });
} else {
    console.error('add-announcement-form not found');
}

// Load announcements and toggle form visibility on page load and section change
document.getElementById('nav-announcements').addEventListener('click', function() {
    loadAnnouncements();
    toggleAnnouncementForm();
});
loadAnnouncements();
toggleAnnouncementForm();

// ... (rest of the Bazaar functionality remains unchanged)


// Gymkhana functionality
function loadGymkhanas() {
    fetch('http://localhost:8080/api/users/gymkhanas', { method: 'GET' })
    .then(response => { console.log('Fetch response status:', response.status); if (!response.ok) throw new Error(`Failed to fetch gymkhanas: ${response.status}`); return response.json(); })
    .then(gymkhanas => {
        const gymkhanaList = document.getElementById('gymkhana-list');
        if (!gymkhanaList) { console.error('gymkhana-list element not found'); return; }
        gymkhanaList.innerHTML = '';
        if (gymkhanas.length === 0) { gymkhanaList.innerHTML = '<p>No gymkhanas available.</p>'; return; }
        gymkhanas.forEach(gymkhana => {
            const gymkhanaElement = document.createElement('div');
            gymkhanaElement.className = 'card';
            gymkhanaElement.style.padding = '20px';
            gymkhanaElement.style.background = '#f9f9f9';
            gymkhanaElement.style.borderRadius = '10px';
            gymkhanaElement.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.1)';
            const presName = gymkhana.presId ? `President: ${gymkhana.presName || 'Not assigned'}` : 'President: Not assigned';
            const vicePresName = gymkhana.vicePresId ? `Vice-President: ${gymkhana.vicePresName || 'Not assigned'}` : 'Vice-President: Not assigned';
            const facultyName = gymkhana.facultyId ? `Faculty: ${gymkhana.facultyName || 'Not assigned'}` : 'Faculty: Not assigned';
            gymkhanaElement.innerHTML = `
                <h4>${gymkhana.gymkhanaName}</h4>
                <p>Members: ${gymkhana.memberCount}</p>
                <p>Funds: ₹${gymkhana.funds}</p>
                <p>${presName}</p>
                <p>${vicePresName}</p>
                <p>${facultyName}</p>
                <div class="gymkhana-actions">
                    ${userData && userData.userType === 'admin' ? `
                        <button class="assign-faculty-btn" data-gymkhananame="${gymkhana.gymkhanaName}">Assign Faculty</button>
                        <button class="set-budget-btn" data-gymkhananame="${gymkhana.gymkhanaName}">Set Budget</button>
                    ` : ''}
                    ${userData && userData.userType === 'faculty' ? `
                        <button class="assign-pres-btn" data-gymkhananame="${gymkhana.gymkhanaName}">Assign President</button>
                        <button class="assign-vice-pres-btn" data-gymkhananame="${gymkhana.gymkhanaName}">Assign Vice-President</button>
                    ` : ''}
                    ${userData && userData.userType !== 'admin' && userData.userType !== 'faculty' ? `
                        <button class="join-gymkhana-btn" data-gymkhananame="${gymkhana.gymkhanaName}">Join Gymkhana</button>
                    ` : ''}
                </div>
            `;
            gymkhanaList.appendChild(gymkhanaElement);
        });
        // Add event listeners for actions
        document.querySelectorAll('.assign-faculty-btn').forEach(btn => btn.addEventListener('click', () => openAssignFacultyForm(btn.getAttribute('data-gymkhananame'))));
        document.querySelectorAll('.set-budget-btn').forEach(btn => btn.addEventListener('click', () => openSetBudgetForm(btn.getAttribute('data-gymkhananame'))));
        document.querySelectorAll('.assign-pres-btn').forEach(btn => btn.addEventListener('click', () => openAssignPresForm(btn.getAttribute('data-gymkhananame'))));
        document.querySelectorAll('.assign-vice-pres-btn').forEach(btn => btn.addEventListener('click', () => openAssignVicePresForm(btn.getAttribute('data-gymkhananame'))));
        document.querySelectorAll('.join-gymkhana-btn').forEach(btn => btn.addEventListener('click', () => handleJoinGymkhana(btn.getAttribute('data-gymkhananame'))));
    })
    .catch(error => { console.error('Error fetching gymkhanas:', error); gymkhanaList.innerHTML = '<p>Error loading gymkhanas. Check console.</p>'; });
}

function openAssignFacultyForm(gymkhanaName) {
    const userId = prompt('Enter Faculty User ID:');
    if (userId) {
        const data = { gymkhanaName, facultyId: parseInt(userId) };
        fetch('http://localhost:8080/api/users/gymkhana/assign-faculty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(data => { console.log('Assign faculty response:', data); loadGymkhanas(); })
        .catch(error => console.error('Error assigning faculty:', error));
    }
}

function openSetBudgetForm(gymkhanaName) {
    const funds = prompt('Enter new budget amount (₹):');
    if (funds) {
        const data = { gymkhanaName, funds: parseInt(funds) };
        fetch('http://localhost:8080/api/users/gymkhana/set-budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(data => { console.log('Set budget response:', data); loadGymkhanas(); })
        .catch(error => console.error('Error setting budget:', error));
    }
}

function openAssignPresForm(gymkhanaName) {
    const userId = prompt('Enter President User ID:');
    if (userId) {
        const data = { gymkhanaName, presId: parseInt(userId) };
        fetch('http://localhost:8080/api/users/gymkhana/assign-pres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(data => { console.log('Assign president response:', data); loadGymkhanas(); })
        .catch(error => console.error('Error assigning president:', error));
    }
}

function openAssignVicePresForm(gymkhanaName) {
    const userId = prompt('Enter Vice-President User ID:');
    if (userId) {
        const data = { gymkhanaName, vicePresId: parseInt(userId) };
        fetch('http://localhost:8080/api/users/gymkhana/assign-vice-pres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(data => { console.log('Assign vice-president response:', data); loadGymkhanas(); })
        .catch(error => console.error('Error assigning vice-president:', error));
    }
}

function handleJoinGymkhana(gymkhanaName) {
    if (!userData || !userData.userId) {
        alert('Please log in to join a gymkhana.');
        return;
    }
    const data = { gymkhanaName, userId: userData.userId };
    fetch('http://localhost:8080/api/users/gymkhana/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => { console.log('Join gymkhana response:', data); loadGymkhanas(); })
    .catch(error => console.error('Error joining gymkhana:', error));
}

// Load gymkhanas on page load and section change
document.getElementById('nav-clubs').addEventListener('click', function() {
    loadGymkhanas();
});
loadGymkhanas();

