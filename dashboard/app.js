const API_BASE = "http://127.0.0.1:8000";

// ─── State ────────────────────────────────────────────────────────────
let knownClients  = new Map();   // keyed by IP, live monitor
let inventoryData = new Map();   // keyed by IP, persistent
let openClientIp  = null;
let currentTab    = 'monitor';

// ─── Elements ─────────────────────────────────────────────────────────
const serverStatusEl   = document.getElementById('server-status');
const clientsCountEl   = document.getElementById('clients-count');
const inventoryCountEl = document.getElementById('inventory-count');
const inventoryBadgeEl = document.getElementById('inventory-badge');
const tableBodyEl      = document.getElementById('clients-table-body');
const inventoryGridEl  = document.getElementById('inventory-grid');
const modal            = document.getElementById('details-modal');
const modalHostname    = document.getElementById('modal-hostname');
const modalSubtitle    = document.getElementById('modal-subtitle');
const modalBody        = document.getElementById('modal-body-content');
const closeModalBtn    = document.getElementById('close-modal');

// ─── Tab switching ────────────────────────────────────────────────────
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`panel-${tab}`).classList.add('active');
}

// ─── Modal ────────────────────────────────────────────────────────────
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
    modal.classList.add('hidden');
    openClientIp = null;
}

function openModal(client) {
    openClientIp = client.ip;
    modalHostname.textContent = client.hostname || 'Unknown';
    modalSubtitle.textContent = `${client.ip || ''}  ·  First seen: ${formatDatetime(client.first_seen || client.last_seen)}`;
    renderModalContent(client);
    modal.classList.remove('hidden');
}

// ─── Helpers ──────────────────────────────────────────────────────────
function formatTime(isoString) {
    const d = new Date(isoString);
    if (isNaN(d)) return '--';
    return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatDatetime(isoString) {
    const d = new Date(isoString);
    if (isNaN(d)) return '--';
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}
function val(v, suffix = '') {
    return (v !== undefined && v !== null && v !== '--' && v !== '') ? `${v}${suffix}` : '--';
}

function mergeLiveIntoInventory(client) {
    const existing = inventoryData.get(client.ip) || {};
    inventoryData.set(client.ip, {
        ...existing,
        ...client,
        first_seen: existing.first_seen || client.first_seen || client.last_seen,
        last_seen: client.last_seen || existing.last_seen,
        is_online: true,
        system_info: client.system_info || existing.system_info || {}
    });
}

// ─── Modal content renderer ───────────────────────────────────────────
function renderModalContent(client) {
    const si = client.system_info || {};
    const isOnline = client.isOnline !== undefined ? client.isOnline : client.is_online;

    // 1. Live Metrics
    const liveSection = `
    <div class="info-section">
        <div class="info-section-title">📊 Live Metrics</div>
        <div class="io-grid">
            <div class="io-card"><label>CPU Usage</label><span>${isOnline ? val(client.cpu, '%') : '--'}</span></div>
            <div class="io-card cyan"><label>RAM Usage</label><span>${isOnline ? val(client.ram, '%') : '--'}</span></div>
            <div class="io-card"><label>Net ↑ Sent</label><span>${isOnline ? val(client.net_sent) : '--'}</span></div>
            <div class="io-card cyan"><label>Net ↓ Received</label><span>${isOnline ? val(client.net_recv) : '--'}</span></div>
            <div class="io-card"><label>Disk Read</label><span>${isOnline ? val(client.disk_read) : '--'}</span></div>
            <div class="io-card cyan"><label>Disk Write</label><span>${isOnline ? val(client.disk_write) : '--'}</span></div>
        </div>
    </div>`;

    // 2. System & OS
    const systemSection = `
    <div class="info-section">
        <div class="info-section-title">🖥️ System Information</div>
        <div class="info-grid">
            <div class="info-item"><label>OS</label><span>${val(si.os)}</span></div>
            <div class="info-item"><label>Architecture</label><span>${val(si.machine)}</span></div>
            <div class="info-item"><label>Hostname</label><span>${val(si.node_name)}</span></div>
            <div class="info-item"><label>IP Address</label><span>${val(client.ip)}</span></div>
            <div class="info-item"><label>Processor</label><span style="font-size:12px">${si.processor || 'N/A'}</span></div>
            <div class="info-item"><label>Boot Time</label><span>${val(si.boot_time)}</span></div>
            <div class="info-item"><label>OS Version</label><span style="font-size:11px;word-break:break-word">${si.version ? si.version.substring(0,60) + (si.version.length > 60 ? '…' : '') : '--'}</span></div>
            <div class="info-item"><label>Last Seen</label><span>${formatTime(client.last_seen)}</span></div>
        </div>
    </div>`;

    // 3. CPU & RAM
    const cpuSection = `
    <div class="info-section">
        <div class="info-section-title">⚙️ CPU &amp; Memory</div>
        <div class="info-grid">
            <div class="info-item"><label>Physical Cores</label><span>${val(si.cpu_cores_physical)}</span></div>
            <div class="info-item"><label>Logical Cores</label><span>${val(si.cpu_cores_total)}</span></div>
            <div class="info-item"><label>Max Frequency</label><span>${val(si.cpu_max_freq)}</span></div>
            <div class="info-item"><label>Total RAM</label><span>${val(si.total_ram)}</span></div>
        </div>
    </div>`;

    // 4. Disk Partitions
    let diskHtml = '';
    if (si.disks && si.disks.length > 0) {
        si.disks.forEach(disk => {
            const pct = parseFloat(disk.percent);
            const warn = pct >= 80;
            diskHtml += `
            <div class="disk-entry">
                <div class="disk-header">
                    <span class="disk-name">${disk.mountpoint} (${disk.device})</span>
                    <span class="disk-percent">${disk.percent} used · ${disk.fstype}</span>
                </div>
                <div class="disk-bar-bg"><div class="disk-bar-fill ${warn ? 'warning' : ''}" style="width:${pct}%"></div></div>
                <div class="disk-info-row">
                    <span>Total: <strong>${disk.total}</strong></span>
                    <span>Used: <strong>${disk.used}</strong></span>
                    <span>Free: <strong>${disk.free}</strong></span>
                </div>
            </div>`;
        });
    } else {
        diskHtml = '<p style="color:var(--text-muted);font-size:13px">No disk data available</p>';
    }
    const diskSection = `
    <div class="info-section">
        <div class="info-section-title">💾 Storage Partitions</div>${diskHtml}
    </div>`;

    // 5. Network
    let netHtml = '';
    if (si.networks && Object.keys(si.networks).length > 0) {
        for (const [iface, addrs] of Object.entries(si.networks)) {
            const ip  = addrs.find(a => a.IP)?.IP  || '';
            const mac = addrs.find(a => a.MAC)?.MAC || '';
            if (!ip && !mac) continue;
            netHtml += `
            <div class="net-interface">
                <div class="net-iface-name">${iface}</div>
                <div class="net-iface-details">
                    ${ip  ? `<span>IP: <strong>${ip}</strong></span>`  : ''}
                    ${mac ? `<span>MAC: <strong>${mac}</strong></span>` : ''}
                </div>
            </div>`;
        }
        if (!netHtml) netHtml = '<p style="color:var(--text-muted);font-size:13px">No interface data</p>';
    } else {
        netHtml = '<p style="color:var(--text-muted);font-size:13px">No network data available</p>';
    }
    const netSection = `
    <div class="info-section">
        <div class="info-section-title">🌐 Network Interfaces</div>
        <div class="net-grid">${netHtml}</div>
    </div>`;

    modalBody.innerHTML = liveSection + systemSection + cpuSection + diskSection + netSection;
}

// ─── Inventory card renderer ──────────────────────────────────────────
function renderInventory() {
    if (inventoryData.size === 0) {
        inventoryGridEl.innerHTML = `
        <div class="inv-empty">
            <p>No PCs in inventory yet.<br>Connect a client to register it permanently.</p>
        </div>`;
        return;
    }

    inventoryGridEl.innerHTML = '';
    // Sort: online first, then by hostname
    const sorted = Array.from(inventoryData.values()).sort((a, b) => {
        if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
        return (a.hostname || '').localeCompare(b.hostname || '');
    });

    sorted.forEach(entry => {
        const si = entry.system_info || {};
        const isOnline = entry.is_online;
        const card = document.createElement('div');
        card.className = `inv-card ${isOnline ? 'online-card' : ''}`;
        card.onclick = () => openModal({ ...entry, isOnline });

        // Build disk summary (first partition only for card)
        const mainDisk = si.disks && si.disks.length > 0 ? si.disks[0] : null;
        const diskSummary = mainDisk
            ? `${mainDisk.used} / ${mainDisk.total} (${mainDisk.percent})`
            : '--';

        card.innerHTML = `
        <div class="inv-card-header">
            <div class="inv-card-title">
                <span class="inv-card-hostname">${entry.hostname || 'Unknown'}</span>
                <span class="inv-card-ip">${entry.ip}</span>
            </div>
            <span class="inv-online-badge ${isOnline ? 'online' : 'offline'}">
                <span class="dot"></span>${isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
        </div>
        <div class="inv-divider"></div>
        <div class="inv-specs">
            <div class="inv-spec"><label>OS</label><span>${val(si.os)}</span></div>
            <div class="inv-spec"><label>Architecture</label><span>${val(si.machine)}</span></div>
            <div class="inv-spec"><label>CPU Cores</label><span>${val(si.cpu_cores_total)} logical / ${val(si.cpu_cores_physical)} physical</span></div>
            <div class="inv-spec"><label>Total RAM</label><span>${val(si.total_ram)}</span></div>
            <div class="inv-spec"><label>Max CPU Freq</label><span>${val(si.cpu_max_freq)}</span></div>
            <div class="inv-spec"><label>Disk (${mainDisk ? mainDisk.mountpoint : '--'})</label><span>${diskSummary}</span></div>
            <div class="inv-spec"><label>Processor</label><span style="font-size:10px">${si.processor ? si.processor.substring(0, 30) + (si.processor.length > 30 ? '…' : '') : '--'}</span></div>
            <div class="inv-spec"><label>Boot Time</label><span style="font-size:10px">${val(si.boot_time)}</span></div>
        </div>
        <div class="inv-divider"></div>
        <div class="inv-card-footer">
            <span>First seen: ${formatDatetime(entry.first_seen)}</span>
            <button class="details-btn" onclick="event.stopPropagation(); openModal(inventoryData.get('${entry.ip}') ? { ...inventoryData.get('${entry.ip}'), isOnline: ${isOnline} } : {})">
                Full Details
            </button>
        </div>`;

        inventoryGridEl.appendChild(card);
    });
}

// ─── Main updater ─────────────────────────────────────────────────────
async function updateDashboard() {
    try {
        const rootRes = await fetch(`${API_BASE}/`);
        await rootRes.json();

        serverStatusEl.className = 'stat-badge online';
        serverStatusEl.querySelector('.text').textContent = 'Server: ONLINE';

        // ── Live Clients ──────────────────────────────────────────────
        const clientsRes  = await fetch(`${API_BASE}/clients`);
        const clientsData = await clientsRes.json();

        clientsCountEl.textContent = clientsData.length;

        knownClients = new Map();
        clientsData.forEach(c => {
            const liveClient = { ...c, isOnline: true, is_online: true };
            knownClients.set(c.ip, liveClient);
            mergeLiveIntoInventory(liveClient);
        });

        renderTable();

        // ── Inventory ─────────────────────────────────────────────────
        const invRes  = await fetch(`${API_BASE}/inventory`);
        const invData = await invRes.json();

        inventoryData = new Map();
        invData.forEach(entry => inventoryData.set(entry.ip, entry));
        clientsData.forEach(c => mergeLiveIntoInventory({ ...c, isOnline: true, is_online: true }));

        inventoryCountEl.textContent = inventoryData.size;
        inventoryBadgeEl.textContent = inventoryData.size;

        renderInventory();

        if (openClientIp) {
            const current = inventoryData.get(openClientIp) || knownClients.get(openClientIp);
            if (current) {
                renderModalContent(current);
            }
        }

    } catch (err) {
        console.error("Dashboard Error:", err);
        serverStatusEl.className = 'stat-badge offline';
        serverStatusEl.querySelector('.text').textContent = 'Server: OFFLINE';
    }
}

// ─── Table renderer ───────────────────────────────────────────────────
function renderTable() {
    tableBodyEl.innerHTML = '';

    if (knownClients.size === 0) {
        tableBodyEl.innerHTML = `
        <tr><td colspan="7" class="empty-state">
            <p>No laptops connected yet...</p>
        </td></tr>`;
        return;
    }

    const sorted = Array.from(knownClients.values()).sort((a, b) => {
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        return (a.hostname || '').localeCompare(b.hostname || '');
    });

    sorted.forEach(client => {
        const tr = document.createElement('tr');
        const isOnline   = client.isOnline;
        const statusClass = isOnline ? 'online'  : 'offline';
        const statusText  = isOnline ? 'ONLINE'  : 'OFFLINE';
        const cpuText = isOnline && client.cpu !== '--' ? `${client.cpu}%` : '--';
        const ramText = isOnline && client.ram !== '--' ? `${client.ram}%` : '--';
        const hasSysInfo  = client.system_info && Object.keys(client.system_info).length > 0;

        tr.innerHTML = `
        <td>
            <div class="laptop-info">
                <div class="laptop-name">${client.hostname || 'Unknown'}</div>
                <div class="laptop-id">#${client.id ? client.id.substring(0, 8) : '--'}</div>
            </div>
        </td>
        <td><span class="status-pill ${statusClass}"><span class="dot"></span>${statusText}</span></td>
        <td class="mono-text highlight">${cpuText}</td>
        <td class="mono-text highlight">${ramText}</td>
        <td class="mono-text hide-mobile">${client.ip || '--'}</td>
        <td class="mono-text hide-mobile">${formatTime(client.last_seen)}</td>
        <td>
            <button class="details-btn"
                onclick="openModal({ ...knownClients.get('${client.ip}'), isOnline: ${isOnline} })"
                ${!hasSysInfo ? 'disabled title="Waiting for system info..."' : ''}>
                Details
            </button>
        </td>`;
        tableBodyEl.appendChild(tr);
    });
}

// ─── Boot ─────────────────────────────────────────────────────────────
updateDashboard();
setInterval(updateDashboard, 2000);
