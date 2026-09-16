// ================================================================
// NOVA VIDA TECH — SCRIPT PRINCIPAL
// Este arquivo controla o comportamento interativo do site.
// A organização abaixo separa armazenamento, carrinho, favoritos,
// navegação, componentes visuais, formulários e inicialização.
// ================================================================


// ----------------------------------------------------------------
// 1. CHAVES DE ARMAZENAMENTO
// ----------------------------------------------------------------
// Os nomes abaixo são usados pelo localStorage do navegador.
// Eles mantêm carrinho e favoritos disponíveis entre as páginas.
const cartKey = 'novaVidaTechCart';
const favoritesKey = 'novaVidaTechFavorites';


// ----------------------------------------------------------------
// 2. ATALHOS PARA SELEÇÃO DE ELEMENTOS
// ----------------------------------------------------------------
// $  = seleciona o primeiro elemento encontrado.
// $$ = seleciona todos os elementos encontrados e retorna um array.
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];


// ----------------------------------------------------------------
// 3. CARRINHO E FAVORITOS
// ----------------------------------------------------------------
// Recupera o carrinho salvo no navegador.
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
  } catch {
    return [];
  }
}

// Salva o carrinho e atualiza o contador exibido no menu.
function saveCart(c) {
  localStorage.setItem(cartKey, JSON.stringify(c));
  updateCartCount();
}

// Recupera os favoritos salvos no navegador.
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(favoritesKey) || '[]');
  } catch {
    return [];
  }
}

// Salva a lista de favoritos.
function saveFavorites(items) {
  localStorage.setItem(favoritesKey, JSON.stringify(items));
}

// Adiciona ou remove um produto da lista de favoritos.
function toggleFavorite(product) {
  const items = getFavorites();
  const exists = items.some(i => i.id === product.id);

  const next = exists
    ? items.filter(i => i.id !== product.id)
    : [...items, product];

  saveFavorites(next);

  return !exists;
}

// Atualiza o número de itens mostrado no menu.
function updateCartCount() {
  const n = getCart().reduce((t, i) => t + i.qty, 0);

  $$('.cart-count').forEach(e => {
    e.textContent = n;
  });
}

// Adiciona um produto ao carrinho.
function addToCart(product) {
  const c = getCart();
  const old = c.find(i => i.id === product.id);

  old ? old.qty++ : c.push({
    ...product,
    qty: 1
  });

  saveCart(c);
  toast('Equipamento adicionado ao carrinho.');
}

// Remove um produto do carrinho.
function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  renderCart();
}


// ----------------------------------------------------------------
// 4. AVISOS / TOAST
// ----------------------------------------------------------------
// Exibe pequenas mensagens temporárias para o usuário.
function toast(msg) {
  let t = $('.toast');

  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }

  t.textContent = msg;
  t.classList.add('show');

  setTimeout(() => {
    t.classList.remove('show');
  }, 2200);
}


// ----------------------------------------------------------------
// 5. MENU RESPONSIVO
// ----------------------------------------------------------------
// Abre e fecha o menu principal em telas menores.
function initMenu() {
  const toggle = $('.menu-toggle');
  const nav = $('.main-nav');

  if (toggle) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
}


// ----------------------------------------------------------------
// 6. CARROSSEL DA PÁGINA INICIAL
// ----------------------------------------------------------------
// Controla os slides, setas, indicadores e troca automática.
function initCarousel() {
  const root = $('[data-carousel]');

  if (!root) return;

  const track = $('.carousel-track', root);
  const slides = $$('.carousel-slide', root);
  const dots = $$('.dot', root);

  let index = 0;

  // Mostra um slide específico e atualiza os indicadores.
  function go(i) {
    index = (i + slides.length) % slides.length;

    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach((d, n) => {
      d.classList.toggle('active', n === index);
    });
  }

  // Botões anterior e próximo.
  $('.prev', root).onclick = () => go(index - 1);
  $('.next', root).onclick = () => go(index + 1);

  // Indicadores inferiores do carrossel.
  dots.forEach((d, n) => {
    d.onclick = () => go(n);
  });

  // Troca automática de slide a cada 6,5 segundos.
  setInterval(() => go(index + 1), 6500);
}


// ----------------------------------------------------------------
// 7. PRODUTOS E FAVORITOS
// ----------------------------------------------------------------
// Ativa os botões de adicionar ao carrinho e favoritar.
function initProducts() {
  $$('.add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(JSON.parse(btn.dataset.product));
    });
  });

  $$('.favorite').forEach(btn => {
    const product = JSON.parse(btn.dataset.product);

    // Mantém o visual do botão sincronizado com os favoritos salvos.
    const sync = () => {
      const liked = getFavorites().some(i => i.id === product.id);

      btn.classList.toggle('liked', liked);
      btn.textContent = liked ? '♥' : '♡';
      btn.setAttribute(
        'aria-label',
        liked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
      );
    };

    sync();

    btn.addEventListener('click', () => {
      const added = toggleFavorite(product);

      sync();
      renderFavorites();

      toast(
        added
          ? 'Adicionado aos favoritos.'
          : 'Removido dos favoritos.'
      );
    });
  });

  renderFavorites();
}


// ----------------------------------------------------------------
// 8. RENDERIZAÇÃO DOS FAVORITOS
// ----------------------------------------------------------------
// Monta os cards de favoritos dentro da área correspondente.
function renderFavorites() {
  const list = $('#favorites-list');

  if (!list) return;

  const items = getFavorites();

  // Mensagem exibida quando não existem favoritos.
  if (!items.length) {
    list.innerHTML = `
      <div class="empty-favorites">
        <h3>Você ainda não salvou nenhum equipamento.</h3>
        <p>Use o ♡ no catálogo para guardar produtos e comparar depois.</p>
      </div>
    `;

    return;
  }

  // Cria os cards dos produtos favoritos.
  list.innerHTML = items.map(i => `
    <article class="favorite-item">
      <span class="favorite-code">${i.code || 'NVT'}</span>
      <h3>${i.name}</h3>
      <p>${i.desc || 'Equipamento Nova Vida Tech.'}</p>

      <div class="fav-actions">
        <button
          class="small-btn"
          type="button"
          data-remove-favorite="${i.id}"
        >
          Remover
        </button>

        <button
          class="small-btn primary"
          type="button"
          data-fav-cart="${i.id}"
        >
          Adicionar ao carrinho
        </button>
      </div>
    </article>
  `).join('');

  // Remove um item da lista de favoritos.
  $$('[data-remove-favorite]', list).forEach(btn => {
    btn.onclick = () => {
      saveFavorites(
        getFavorites().filter(i => i.id !== btn.dataset.removeFavorite)
      );

      renderFavorites();

      // Atualiza os botões de favorito existentes no catálogo.
      $$('.favorite').forEach(f => {
        try {
          const p = JSON.parse(f.dataset.product);

          if (p.id === btn.dataset.removeFavorite) {
            f.classList.remove('liked');
            f.textContent = '♡';
            f.setAttribute(
              'aria-label',
              'Adicionar aos favoritos'
            );
          }
        } catch {
          // Ignora um botão com dados inválidos.
        }
      });

      toast('Removido dos favoritos.');
    };
  });

  // Adiciona novamente ao carrinho um produto salvo.
  $$('[data-fav-cart]', list).forEach(btn => {
    btn.onclick = () => {
      const p = getFavorites().find(i => i.id === btn.dataset.favCart);

      if (p) {
        addToCart(p);
      }
    };
  });
}


// ----------------------------------------------------------------
// 9. RENDERIZAÇÃO DO CARRINHO
// ----------------------------------------------------------------
// Monta a lista de produtos e o resumo do pedido.
function renderCart() {
  const list = $('.cart-list');
  const summary = $('.summary');

  if (!list || !summary) return;

  const c = getCart();

  // Estado vazio do carrinho.
  if (!c.length) {
    list.innerHTML = `
      <div class="empty">
        <h2>Seu carrinho está vazio</h2>
        <p>Explore o catálogo e adicione os equipamentos que deseja avaliar.</p>
        <br>
        <a class="btn btn-navy" href="catalogo.html">
          Ir para o catálogo
        </a>
      </div>
    `;

    summary.innerHTML = `
      <h2>Resumo</h2>
      <div class="sum-row total">
        <span>Total</span>
        <span>R$ 0,00</span>
      </div>
    `;

    return;
  }

  // Calcula o total e cria os itens do carrinho.
  let total = 0;

  list.innerHTML = c.map(i => {
    total += i.price * i.qty;

    return `
      <div class="cart-item">
        <div class="cart-thumb">${i.code}</div>

        <div>
          <h3>${i.name}</h3>
          <p>${i.desc}</p>
          <p>Quantidade: ${i.qty}</p>
        </div>

        <strong>
          R$ ${(i.price * i.qty).toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}
          <br>
          <button class="remove" data-id="${i.id}">
            Remover
          </button>
        </strong>
      </div>
    `;
  }).join('');

  // Formata valores em reais.
  const fmt = v => v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  // Monta o resumo do pedido.
  summary.innerHTML = `
    <h2>Resumo do pedido</h2>

    <div class="sum-row">
      <span>Subtotal</span>
      <span>${fmt(total)}</span>
    </div>

    <div class="sum-row">
      <span>Frete</span>
      <span>A calcular</span>
    </div>

    <div class="sum-row total">
      <span>Total estimado</span>
      <span>${fmt(total)}</span>
    </div>

    <br>

    <a class="btn btn-gold" style="width:100%" href="orcamento.html">
      Continuar para orçamento
    </a>
  `;

  // Botões para remover produtos.
  $$('.remove', list).forEach(b => {
    b.onclick = () => removeFromCart(b.dataset.id);
  });
}


// ----------------------------------------------------------------
// 10. CHAT
// ----------------------------------------------------------------
// Controla abertura, fechamento e respostas do chat demonstrativo.
function initChat() {
  const chat = $('.chat');
  const openers = $$('.open-chat');
  const close = $('.close-chat');
  const form = $('.chat-form');

  openers.forEach(b => {
    b.onclick = () => chat.classList.add('open');
  });

  if (close) {
    close.onclick = () => chat.classList.remove('open');
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const input = $('input', form);
      const body = $('.chat-body');

      if (!input.value.trim()) return;

      body.insertAdjacentHTML(
        'beforeend',
        `<div class="bubble user">${input.value.replace(/[<>]/g, '')}</div>`
      );

      const q = input.value.toLowerCase();

      let answer =
        'Claro! Vou encaminhar sua necessidade para um especialista. ' +
        'Você também pode solicitar um orçamento pelo formulário.';

      if (q.includes('preço') || q.includes('valor')) {
        answer =
          'Os valores variam conforme configuração e necessidade. ' +
          'Posso te orientar a partir do equipamento e volume desejados.';
      }

      if (q.includes('equipamento')) {
        answer =
          'Me conte o que você precisa produzir, substituir ou automatizar. ' +
          'A partir disso indicamos algumas opções.';
      }

      setTimeout(() => {
        body.insertAdjacentHTML(
          'beforeend',
          `<div class="bubble bot">${answer}</div>`
        );

        body.scrollTop = body.scrollHeight;
      }, 400);

      input.value = '';
    });
  }
}


// ----------------------------------------------------------------
// 11. FORMULÁRIOS
// ----------------------------------------------------------------
// Controla o formulário de orçamento e os botões demonstrativos
// das telas de cadastro e login.
function initForms() {
  const budget = $('#budget-form');

  if (budget) {
    budget.addEventListener('submit', e => {
      e.preventDefault();

      localStorage.setItem('budgetSent', '1');

      toast(
        'Solicitação registrada! Agora você pode seguir para pagamento.'
      );

      setTimeout(() => {
        location.href = 'pagamento.html';
      }, 700);
    });
  }

  const auth = $$('.fake-submit');

  auth.forEach(f => {
    f.addEventListener('click', () => {
      toast('Demonstração: formulário validado com sucesso.');
    });
  });
}


// ----------------------------------------------------------------
// 12. PAGAMENTO
// ----------------------------------------------------------------
// Controla a escolha do método de pagamento e o envio demonstrativo.
function initPayment() {
  const opts = $$('.payment-option');

  // Seleção do método de pagamento.
  opts.forEach(o => {
    o.onclick = () => {
      opts.forEach(x => x.classList.remove('active'));

      o.classList.add('active');

      $('#payment-method').value = o.dataset.method;
    };
  });

  const form = $('#payment-form');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      $('#payment-result').innerHTML = `
        <div class="about-card" style="margin-top:20px">
          <h2>Solicitação enviada ✓</h2>
          <p>
            Seu pedido de pagamento foi registrado como demonstração.
            Em uma versão com backend, esta etapa será conectada ao
            gateway escolhido.
          </p>
        </div>
      `;

      localStorage.removeItem(cartKey);
      updateCartCount();
    });
  }
}


// ----------------------------------------------------------------
// 13. INICIALIZAÇÃO DO SITE
// ----------------------------------------------------------------
// Executa todos os módulos quando o HTML termina de carregar.
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initCarousel();
  initProducts();
  renderCart();
  renderFavorites();
  initChat();
  initForms();
  initPayment();
  updateCartCount();
});
