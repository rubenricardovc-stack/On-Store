// app.js - minimal e-commerce logic (vanilla JS)
// Products are loaded from products.json (local file).
// Cart stored in localStorage under 'ec_cart'.
(async function(){
  const fetchProducts = async () => {
    try {
      const res = await fetch('products.json');
      return await res.json();
    } catch(e){
      console.error('Erro ao carregar products.json', e);
      return [];
    }
  };

  const products = await fetchProducts();

  // helper DOM
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // update cart count
  function cart() {
    const raw = localStorage.getItem('ec_cart') || '[]';
    try { return JSON.parse(raw); } catch { return []; }
  }
  function saveCart(c){ localStorage.setItem('ec_cart', JSON.stringify(c)); updateCartCount(); }
  function updateCartCount(){
    const count = cart().reduce((s,i)=>s+i.qty,0);
    $$('#cart-count').forEach(el=>el.textContent = count);
  }
  updateCartCount();

  function formatPrice(n){ return 'Kz ' + Number(n).toFixed(2); }

  // render featured on index.html
  if($('#featured-grid')){
    const featured = products.slice(0,6);
    const grid = $('#featured-grid');
    grid.innerHTML = featured.map(p=>`
      <article class="card" aria-label="${p.name}">
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p class="muted">${p.category}</p>
        <div class="price">${formatPrice(p.price)}</div>
        <div style="margin-top:8px">
          <a class="btn" href="product.html?id=${p.id}">Ver</a>
          <button class="btn add" data-id="${p.id}" style="background:#444;margin-left:8px">Adicionar</button>
        </div>
      </article>`).join('');
  }

  // products list page
  if($('#products-grid')){
    const grid = $('#products-grid');
    const search = $('#search');
    const catSelect = $('#category-filter');

    const categories = Array.from(new Set(products.map(p=>p.category))).sort();
    categories.forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      catSelect.appendChild(opt);
    });

    function renderList(list){
      grid.innerHTML = list.map(p=>`
        <article class="card" aria-label="${p.name}">
          <img src="${p.image}" alt="${p.name}">
          <h4>${p.name}</h4>
          <p class="muted">${p.category}</p>
          <div class="price">${formatPrice(p.price)}</div>
          <div style="margin-top:8px">
            <a class="btn" href="product.html?id=${p.id}">Ver</a>
            <button class="btn add" data-id="${p.id}" style="background:#444;margin-left:8px">Adicionar</button>
          </div>
        </article>`).join('');
    }

    function filterAndRender(){
      const q = search.value.trim().toLowerCase();
      const c = catSelect.value;
      const out = products.filter(p=>{
        const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q);
        const matchC = !c || p.category===c;
        return matchQ && matchC;
      });
      renderList(out);
    }

    search.addEventListener('input', filterAndRender);
    catSelect.addEventListener('change', filterAndRender);
    renderList(products);
  }

  // product page
  if($('#product-detail')){
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const p = products.find(x=>String(x.id)===String(id));
    const el = $('#product-detail');
    if(!p){
      el.innerHTML = '<p>Produto não encontrado. <a href="products.html">Voltar</a></p>';
    } else {
      el.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <div>
          <h1>${p.name}</h1>
          <p class="muted">${p.category}</p>
          <p>${p.description||''}</p>
          <p class="price">${formatPrice(p.price)}</p>
          <div style="margin-top:12px">
            <label>Quantidade <input id="qty" type="number" value="1" min="1" style="width:80px;padding:6px;border:1px solid #ddd;border-radius:6px"></label>
            <button class="btn" id="add-to-cart">Adicionar ao carrinho</button>
          </div>
        </div>
      `;
      $('#add-to-cart').addEventListener('click', ()=>{
        const q = Math.max(1, parseInt($('#qty').value||1));
        const c = cart();
        const existing = c.find(i=>String(i.id)===String(p.id));
        if(existing) existing.qty += q; else c.push({id:p.id, name:p.name, price:p.price, image:p.image, qty:q});
        saveCart(c);
        alert('Adicionado ao carrinho');
      });
    }
  }

  // add-to-cart buttons on lists
  document.body.addEventListener('click', (e)=>{
    if(e.target.matches('button.add')){
      const id = e.target.dataset.id;
      const p = products.find(x=>String(x.id)===String(id));
      if(!p) return alert('Produto não encontrado');
      const c = cart();
      const existing = c.find(i=>String(i.id)===String(p.id));
      if(existing) existing.qty += 1; else c.push({id:p.id, name:p.name, price:p.price, image:p.image, qty:1});
      saveCart(c);
      alert('Produto adicionado ao carrinho');
    }
  });

  // cart page rendering
  if($('#cart-contents')){
    function renderCart(){
      const c = cart();
      const wrap = $('#cart-contents');
      if(c.length===0){
        wrap.innerHTML = '<p>Seu carrinho está vazio. <a href="products.html">Ver produtos</a></p>';
        return;
      }
      const rows = c.map(item=>`
        <div class="card" data-id="${item.id}" style="display:flex;gap:12px;align-items:center">
          <img src="${item.image}" alt="${item.name}" style="width:100px;height:80px;object-fit:cover">
          <div style="flex:1">
            <strong>${item.name}</strong>
            <p class="muted">Qtd: <input type="number" min="1" value="${item.qty}" data-id="${item.id}" class="qty-input" style="width:60px;padding:6px;border-radius:6px;border:1px solid #ddd"></p>
            <p class="price">${formatPrice(item.price * item.qty)}</p>
          </div>
          <div>
            <button class="btn remove" data-id="${item.id}" style="background:#c33">Remover</button>
          </div>
        </div>
      `).join('');
      const total = c.reduce((s,i)=>s + i.price * i.qty, 0);
      wrap.innerHTML = rows + '<div style="margin-top:12px"><strong>Total: ' + formatPrice(total) + '</strong></div>';
    }
    renderCart();

    // events
    document.body.addEventListener('change', (e)=>{
      if(e.target.matches('.qty-input')){
        const id = e.target.dataset.id;
        const val = Math.max(1, parseInt(e.target.value||1));
        const c = cart();
        const it = c.find(x=>String(x.id)===String(id));
        if(it){ it.qty = val; saveCart(c); renderCart(); }
      }
    });
    document.body.addEventListener('click', (e)=>{
      if(e.target.matches('.remove')){
        const id = e.target.dataset.id;
        let c = cart();
        c = c.filter(x=>String(x.id)!==String(id));
        saveCart(c);
        renderCart();
      }
    });

    // checkout simulation
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      // simple validation
      const c = cart();
      if(c.length===0){ alert('Seu carrinho está vazio'); return; }
      // simulate order
      localStorage.removeItem('ec_cart');
      updateCartCount();
      document.getElementById('order-success').hidden = false;
      form.reset();
      renderCart();
    });
  }

  // make sure cart count updates on load
  updateCartCount();

})();
