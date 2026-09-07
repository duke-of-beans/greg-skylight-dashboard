// Splice the new grocery card (CSS, HTML, JS) into index.html between plain-ASCII anchors.
const fs = require('fs');
const path = 'D:/Projects/greg-skylight-dashboard/index.html';
let html = fs.readFileSync(path, 'utf8');
const crlf = html.indexOf('\r\n') >= 0;
if (crlf) html = html.replace(/\r\n/g, '\n');
const css = fs.readFileSync('D:/Projects/greg-skylight-dashboard/.build/grocery.css', 'utf8');
const card = fs.readFileSync('D:/Projects/greg-skylight-dashboard/.build/grocery.html', 'utf8');
let js = fs.readFileSync('D:/Projects/greg-skylight-dashboard/.build/grocery.js', 'utf8');
js += '\n// legacy modal stubs (modal markup still present, never opened)\nfunction openAddModal(){document.getElementById("addModal").classList.add("open")}\nfunction closeAddModal(){document.getElementById("addModal").classList.remove("open")}\nfunction saveNewItem(){var i=document.querySelector("#addModal input");var t=i?i.value.trim():"";if(!t)return;addGroceryItem(t,guessCategory(t),"wall");closeAddModal();}\n';

function splice(startMarker, endMarker, replacement, includeEnd) {
  const s = html.indexOf(startMarker);
  if (s < 0) throw new Error('start not found: ' + startMarker.slice(0, 60));
  const e = html.indexOf(endMarker, s);
  if (e < 0) throw new Error('end not found: ' + endMarker.slice(0, 60));
  const end = includeEnd ? e + endMarker.length : e;
  html = html.slice(0, s) + replacement + html.slice(end);
}

const cssN = css.replace(/\r\n/g,'\n').trimEnd(), cardN = card.replace(/\r\n/g,'\n').trimEnd(), jsN = js.replace(/\r\n/g,'\n').trimEnd();
// 1) CSS: from .grocery-item rule through .grocery-add-btn:active rule
splice('.grocery-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border2)}',
       '.grocery-add-btn:active{background:var(--greg-bg)}', cssN, true);
// 2) HTML: the card, up to (not including) the card-layer close
splice('  <div class="interleave-card" id="groceryCard">', '\n</div>\n\n<!--', cardN, false);
// 3) JS: from var activeListId through the fetch/interval line
splice("var activeListId = '1ab282d8-e849-4543-8410-0203ecacba83';",
       'fetchGrocery(); if(!CFG.PLEXUS_KEY) setInterval(fetchGrocery, CFG.GROCERY_REFRESH);', jsN, true);

fs.writeFileSync(path, crlf ? html.replace(/\n/g, '\r\n') : html, 'utf8');
// syntax check every inline script block
const vm = require('vm'); const re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi; let m, i = 0, ok = true;
while ((m = re.exec(html))) { i++; try { new vm.Script(m[1], { filename: 'block' + i }); } catch (err) { ok = false; console.log('SYNTAX ERROR block', i, err.message, (err.stack.match(/block\d+:(\d+)/) || [])[1]); } }
console.log('spliced; blocks', i, 'ok', ok, 'bytes', Buffer.byteLength(html));
