const backendUrl = "https://pos-backend.up.railway.app"; // replace with your backend URL

let displayItems = [];
let soldItems = [];
let totalSales = 0;

function addItem() {
  const name = document.getElementById('itemName').value;
  const price = parseFloat(document.getElementById('itemPrice').value);
  if(name && price > 0) {
    displayItems.push({ name, price });
    renderDisplay();
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
  }
}

function renderDisplay() {
  const list = document.getElementById('displayList');
  list.innerHTML = '';
  displayItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="item-name">${item.name} - ₱${item.price}</span>
      <button class="sell-btn" onclick="sellItem(${index})">Sold</button>`;
    list.appendChild(li);
  });
}

function sellItem(index) {
  const item = displayItems.splice(index, 1)[0];
  soldItems.push(item);
  totalSales += item.price;

  // ✅ Save to backend
  saveSale(item.name, item.price);

  renderDisplay();
  renderSold();
}

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

function saveSale(name, price) {
  fetch(`${backendUrl}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: name, price })
  })
  .then(res => res.json())
  .then(data => console.log("Saved:", data))
  .catch(err => console.error("Error saving sale:", err));
}

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

// ✅ Initial load from backend
loadSales();
