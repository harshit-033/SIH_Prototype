const API_BASE = "http://127.0.0.1:8000";

// State
let knownClients = new Map();

// Elements
const serverStatusEl = document.getElementById('server-status');
const clientsCountEl = document.getElementById('clients-count');
const tableBodyEl = document.getElementById('clients-table-body');

function formatTime(isoString) {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function updateDashboard() {
    try {
        // 1. Fetch Server Status
        // Note: Using fetch without CORS headers. If you open index.html directly from file://
        // and server.py lacks CORS, you might need to use a browser extension to bypass CORS 
        // or serve this folder with a python server.
        const rootRes = await fetch(`${API_BASE}/`);
        await rootRes.json();
        
        serverStatusEl.className = 'stat-badge online';
        serverStatusEl.querySelector('.text').textContent = 'Server: ONLINE';
        
        // 2. Fetch Clients
        const clientsRes = await fetch(`${API_BASE}/clients`);
        const clientsData = await clientsRes.json();
        
        clientsCountEl.textContent = clientsData.length;

        // Mark all as offline initially for this tick
        for (let [ip, client] of knownClients) {
            client.isOnline = false;
        }
        
        // Update with fresh data
        clientsData.forEach(client => {
            knownClients.set(client.ip, {
                ...client,
                isOnline: true
            });
        });

        renderTable();
    } catch (error) {
        console.error("Dashboard Error:", error);
        serverStatusEl.className = 'stat-badge offline';
        serverStatusEl.querySelector('.text').textContent = 'Server: OFFLINE';
    }
}

function renderTable() {
    tableBodyEl.innerHTML = '';

    if (knownClients.size === 0) {
        tableBodyEl.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <p>No laptops connected yet...</p>
                </td>
            </tr>`;
        return;
    }

    // Sort: Online first, then alphabetical by hostname
    const sortedClients = Array.from(knownClients.values()).sort((a, b) => {
        if (a.isOnline === b.isOnline) {
            return (a.hostname || '').localeCompare(b.hostname || '');
        }
        return a.isOnline ? -1 : 1;
    });

    sortedClients.forEach(client => {
        const tr = document.createElement('tr');
        
        const isOnline = client.isOnline;
        const statusClass = isOnline ? 'online' : 'offline';
        const statusText = isOnline ? 'ONLINE' : 'OFFLINE';
        
        const cpuText = isOnline && client.cpu !== '--' ? `${client.cpu}%` : '--';
        const ramText = isOnline && client.ram !== '--' ? `${client.ram}%` : '--';
        
        tr.innerHTML = `
            <td>
                <div class="laptop-info">
                    <div class="laptop-name">
                        ${client.hostname || 'Unknown'}
                    </div>
                    <div class="laptop-id">#${client.id.substring(0, 8)}</div>
                </div>
            </td>
            <td>
                <span class="status-pill ${statusClass}">
                    <span class="dot"></span>
                    ${statusText}
                </span>
            </td>
            <td class="mono-text highlight">${cpuText}</td>
            <td class="mono-text highlight">${ramText}</td>
            <td class="mono-text hide-mobile">${client.ip || '--'}</td>
            <td class="mono-text hide-mobile">${formatTime(client.last_seen)}</td>
        `;
        
        tableBodyEl.appendChild(tr);
    });
}

// Initial fetch
updateDashboard();

// Poll every 2 seconds for a dynamic feel
setInterval(updateDashboard, 2000);
