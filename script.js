// ✅ Use your Render backend URL
const backendUrl = "https://pos-backend-rjnm.onrender.com";

let displayItems = [];
let soldItems = [];
let totalSales = 0;

// Add item to display list + save to backend
function addItem() {
  const name = document.getElementById('itemName').value;
  const price = parseFloat(document.getElementById('itemPrice').value);

  if (name && price > 0) {
    const newItem = { name, price };

    // ✅ Save to backend (Display collection)
    saveDisplayItem(newItem);

    displayItems.push(newItem);
    renderDisplay();

    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
  } else {
    alert("Please enter a valid item name and price.");
  }
}

// Render items on display with Sold button
function renderDisplay() {
  const list = document.getElementById('displayList');
  list.innerHTML = '';
  displayItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="item-name">${item.name} - ₱${item.price}</span>
      <button class="sell-btn" onclick="sellItem(${index})">Sold</button>
    `;
    list.appendChild(li);
  });
}

// Handle selling an item
function sellItem(index) {
  const item = displayItems.splice(index, 1)[0];
  soldItems.push(item);
  totalSales += item.price;

  // ✅ Save to backend (Sales collection)
  saveSale(item.name, item.price);

  renderDisplay();
  renderSold();
}

// Render sold items list + total
function renderSold() {
  const list = document.getElementById('soldList');
  list.innerHTML = '';
  soldItems.forEach(item => {
    const li = document.createElement('li');
    li.classList.add('sold');
    li.textContent = `${item.name} - ₱${item.price} (${item.date ? new Date(item.date).toLocaleString() : 'just now'})`;
    list.appendChild(li);
  });
  document.getElementById('totalSales').textContent = totalSales;
}

// ✅ Save display item to backend
function saveDisplayItem(item) {
  fetch(`${backendUrl}/display`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: item.name, price: item.price })
  })
  .then(res => res.json())
  .then(data => console.log("Display item saved:", data))
  .catch(err => console.error("Error saving display item:", err));
}

// ✅ Save sale to backend
function saveSale(name, price) {
  fetch(`${backendUrl}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: name, price })
  })
  .then(res => res.json())
  .then(data => console.log("Sale saved:", data))
  .catch(err => console.error("Error saving sale:", err));
}

// ✅ Load display items from backend
function loadDisplayItems() {
  fetch(`${backendUrl}/display`)
    .then(res => res.json())
    .then(data => {
      displayItems = data.map(item => ({
        name: item.item,
        price: item.price,
        date: item.date
      }));
      renderDisplay();
    })
    .catch(err => console.error("Error loading display items:", err));
}

// ✅ Load sales history from backend
function loadSales() {
  fetch(`${backendUrl}/sales`)
    .then(res => res.json())
    .then(data => {
      soldItems = data.map(sale => ({
        name: sale.item,
        price: sale.price,
        date: sale.date
      }));
      totalSales = soldItems.reduce((sum, sale) => sum + sale.price, 0);
      renderSold();
    })
    .catch(err => console.error("Error loading sales:", err));
}

// ✅ Clear display items (frontend + backend)
function clearDisplay() {
  if (!confirm("Are you sure you want to clear all display items?")) return;

  displayItems = [];
  renderDisplay();

  fetch(`${backendUrl}/display/clear`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => console.log("Display cleared:", data))
    .catch(err => console.error("Error clearing display:", err));
}

// ✅ Clear sold items (frontend + backend)
function clearSold() {
  if (!confirm("Are you sure you want to clear all sold items?")) return;

  soldItems = [];
  totalSales = 0;
  renderSold();

  fetch(`${backendUrl}/sales/clear`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => console.log("Sales cleared:", data))
    .catch(err => console.error("Error clearing sales:", err));
}

// ✅ Initial load from backend
loadDisplayItems();
loadSales();
