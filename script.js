const backendUrl = "https://pos-backend-rjnm.onrender.com";

let displayItems = [];
let soldItems = [];
let totalSales = 0;

// Add item
function addItem() {
  const name = document.getElementById('itemName').value;
  const price = parseFloat(document.getElementById('itemPrice').value);

  if (name && price > 0) {
    const newItem = { name, price };
    saveDisplayItem(newItem);
    displayItems.push(newItem);
    renderDisplay();
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
  } else {
    alert("Please enter a valid item name and price.");
  }
}

// Render display table
function renderDisplay() {
  const tableBody = document.getElementById('displayList');
  tableBody.innerHTML = '';
  displayItems.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>₱${item.price}</td>
      <td><button class="sell-btn" onclick="sellItem(${index})">Sold</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// Sell item
function sellItem(index) {
  const item = displayItems.splice(index, 1)[0];
  soldItems.push(item);
  totalSales += item.price;
  saveSale(item.name, item.price);
  renderDisplay();
  renderSold();
}

// Render sold table
function renderSold() {
  const tableBody = document.getElementById('soldList');
  tableBody.innerHTML = '';
  soldItems.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>₱${item.price}</td>
      <td>${item.date ? new Date(item.date).toLocaleString() : 'just now'}</td>
    `;
    tableBody.appendChild(row);
  });
  document.getElementById('totalSales').textContent = totalSales;
}

// Save display item
function saveDisplayItem(item) {
  fetch(`${backendUrl}/display`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: item.name, price: item.price })
  }).catch(err => console.error("Error saving display item:", err));
}

// Save sale
function saveSale(name, price) {
  fetch(`${backendUrl}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: name, price })
  }).catch(err => console.error("Error saving sale:", err));
}

// Load display
function loadDisplayItems() {
  fetch(`${backendUrl}/display`)
    .then(res => res.json())
    .then(data => {
      displayItems = data.map(item => ({ name: item.item, price: item.price, date: item.date }));
      renderDisplay();
    })
    .catch(err => console.error("Error loading display items:", err));
}

// Load sales
function loadSales() {
  fetch(`${backendUrl}/sales`)
    .then(res => res.json())
    .then(data => {
      soldItems = data.map(sale => ({ name: sale.item, price: sale.price, date: sale.date }));
      totalSales = soldItems.reduce((sum, sale) => sum + sale.price, 0);
      renderSold();
    })
    .catch(err => console.error("Error loading sales:", err));
}

// Clear display
function clearDisplay() {
  if (!confirm("Are you sure you want to clear all display items?")) return;
  displayItems = [];
  renderDisplay();
  fetch(`${backendUrl}/display/clear`, { method: 'DELETE' }).catch(err => console.error("Error clearing display:", err));
}

// Clear sold
function clearSold() {
  if (!confirm("Are you sure you want to clear all sold items?")) return;
  soldItems = [];
  totalSales = 0;
  renderSold();
  fetch(`${backendUrl}/sales/clear`, { method: 'DELETE' }).catch(err => console.error("Error clearing sales:", err));
}

// ✅ Search filters
function filterDisplay() {
  const query = document.getElementById('searchDisplay').value.toLowerCase();
  const rows = document.querySelectorAll('#displayList tr');
  rows.forEach(row => {
    const itemName = row.cells[0].textContent.toLowerCase();
    const itemPrice = row.cells[1].textContent.toLowerCase();
    const match = itemName.includes(query) || itemPrice.includes(query);
    row.style.display = match ? '' : 'none';
  });
}

function filterSold() {
  const query = document.getElementById('searchSold').value.toLowerCase();
  const rows = document.querySelectorAll('#soldList tr');
  rows.forEach(row => {
    const itemName = row.cells[0].textContent.toLowerCase();
    const itemPrice = row.cells[1].textContent.toLowerCase();
    const itemDate = row.cells[2].textContent.toLowerCase();
    const match = itemName.includes(query) || itemPrice.includes(query) || itemDate.includes(query);
    row.style.display = match ? '' : 'none';
  });
}

// ✅ Sort with indicators (safe for empty tables)
function sortTable(tbodyId, colIndex, type = 'string') {
  const tbody = document.getElementById(tbodyId);
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const headers = tbody.closest('table').querySelectorAll('th'); // safer

  if (rows.length === 0) return; // ✅ nothing to sort

  let sorted = rows.sort((a, b) => {
    let valA = a.cells[colIndex].textContent.trim().toLowerCase();
    let valB = b.cells[colIndex].textContent.trim().toLowerCase();

    if (type === 'number') {
      valA = parseFloat(valA.replace(/[^\d.-]/g, '')) || 0;
      valB = parseFloat(valB.replace(/[^\d.-]/g, '')) || 0;
    }

    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

  let currentSort = tbody.getAttribute('data-sorted');
  if (currentSort === `${colIndex}-asc`) {
    sorted.reverse();
    tbody.setAttribute('data-sorted', `${colIndex}-desc`);
    updateIndicators(headers, colIndex, 'desc');
  } else {
    tbody.setAttribute('data-sorted', `${colIndex}-asc`);
    updateIndicators(headers, colIndex, 'asc');
  }

  tbody.innerHTML = '';
  sorted.forEach(row => tbody.appendChild(row));
}

// ✅ Update sort indicators (safe check)
function updateIndicators(headers, activeIndex, direction) {
  headers.forEach((header, i) => {
    const indicator = header.querySelector('.sort-indicator');
    if (!indicator) return; // ✅ skip if no indicator span
    if (i === activeIndex) {
      indicator.textContent = direction === 'asc' ? '▲' : '▼';
    } else {
      indicator.textContent = '';
    }
  });
}

// ✅ Initial load
loadDisplayItems();
loadSales();
