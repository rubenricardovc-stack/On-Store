Como usar
1. Baixe e extraia os arquivos.
2. Abra index.html em um navegador moderno (Chrome, Edge, Safari).
3. Para testes locais de fetch (products.json) alguns navegadores bloqueiam fetch de arquivos locais; se algo falhar, rode um servidor simples:
   - Python 3: `python -m http.server 8000` no diretório do site, depois abra http://localhost:8000
4. O carrinho usa localStorage; o checkout é apenas simulado.
5. Substitua products.json por seus produtos reais; atualize imagens e preços.

Arquivos incluídos:
- index.html, products.html, product.html, cart.html
- styles.css
- app.js
- products.json
- README.txt

Observações:
- Projeto sem backend. Para integrar pagamento e gestão de estoque, recomendo conectar a uma API (Stripe, PayPal, ou plataforma local) e um banco de dados.
