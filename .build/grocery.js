// ═══ GROCERY — lifecycle, trays, trips (spec: docs/ux-graph, WG-18/19/38/39) ═══
// needed → tap → in cart (checked) → Done shopping → bought (bought_at) → recently-bought tray → tap → needed
// Delete is a long-press with explicit buttons (Grammy never finds hidden swipes). Every destructive
// act gets a 6s undo pill instead of a confirm. The wall captures; the phone/paper shops.
var LIST_IDS = {angela:'1ab282d8-e849-4543-8410-0203ecacba83', grammy:'86c871c3-821f-4af7-b729-4440b7895a16'};
var LIST_LABEL = {}; LIST_LABEL[LIST_IDS.angela]='Angela & David'; LIST_LABEL[LIST_IDS.grammy]="Grammy's";
var DEFAULT_SECTIONS = ['Produce','Bakery','Dairy','Meat','Pantry','Condiments','Drinks','Baby','Pets','Household','Other'];
var activeListId = LIST_IDS.angela;
var gState = {items:[], staples:[], lists:{}, undoTimer:null, press:null, suppressTap:false, openActions:null};

function sbGet(path){
  return fetch(CFG.SUPABASE_URL+'/rest/v1/'+path,{headers:{'apikey':CFG.SUPABASE_ANON,'Authorization':'Bearer '+CFG.SUPABASE_ANON}}).then(function(r){return r.json()});
}
function sbPatch(path, body){
  return sbFetch(path,{method:'PATCH',body:JSON.stringify(body),headers:{'Prefer':'return=minimal'}});
}
function switchList(el){
  document.querySelectorAll('.list-pick').forEach(function(p){p.classList.remove('active')});
  el.classList.add('active');
  activeListId = el.getAttribute('data-list');
  document.getElementById('groceryCard').classList.toggle('grammy', activeListId===LIST_IDS.grammy);
  fetchGrocery();
}
function normKey(t){ return String(t||'').toLowerCase().trim().replace(/\s+/g,' '); }
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }

function fetchGrocery(){
  var since = new Date(Date.now()-30*86400000).toISOString();
  var listReq = gState.lists[activeListId] ? Promise.resolve([gState.lists[activeListId]])
    : sbGet('grocery_lists?id=eq.'+activeListId+'&select=id,name,store,section_order');
  return Promise.all([
    sbGet('grocery_items?list_id=eq.'+activeListId+'&deleted_at=is.null&or=(bought_at.is.null,bought_at.gte.'+encodeURIComponent(since)+')&order=created_at.asc'),
    sbGet('grocery_staples?list_id=eq.'+activeListId+'&on_list_now=eq.false&order=due.desc,times_added.desc&limit=12').catch(function(){return []}),
    listReq.catch(function(){return []})
  ]).then(function(r){
    gState.items = Array.isArray(r[0]) ? r[0] : [];
    gState.staples = Array.isArray(r[1]) ? r[1] : [];
    if (Array.isArray(r[2]) && r[2][0]) gState.lists[activeListId] = r[2][0];
    renderGrocery();
    updatePickerCounts();
  }).catch(function(e){console.log('Grocery fetch failed:',e)});
}

function updatePickerCounts(){
  sbGet('grocery_items?select=list_id&deleted_at=is.null&bought_at=is.null').then(function(rows){
    var n={}; (rows||[]).forEach(function(r){ n[r.list_id]=(n[r.list_id]||0)+1; });
    document.querySelectorAll('.list-pick').forEach(function(p){
      var id=p.getAttribute('data-list'); var base = id===LIST_IDS.grammy ? 'Grammy' : 'Angela & David';
      p.textContent = n[id] ? base+' · '+n[id] : base;
    });
  }).catch(function(){});
}

function sourceLabel(it){
  var s = it.source || 'wall';
  if (s==='wall' && it.added_by==='greg') s='voice';
  if (s==='wall' && it.added_by==='phone') s='phone';
  return ({voice:'voice', phone:'phone', text:'text', camera:'camera', tray:'usual', greg:'Greg', sms:'text'})[s] || null;
}

function renderGrocery(){
  var list = gState.lists[activeListId] || {};
  var sections = Array.isArray(list.section_order) && list.section_order.length ? list.section_order : DEFAULT_SECTIONS;
  var open = gState.items.filter(function(i){return !i.bought_at});
  var recent = gState.items.filter(function(i){return i.bought_at});
  var due = gState.staples.filter(function(s){return s.due});

  // Header — the glance
  var head = '<span class="g-count">'+open.length+' '+(open.length===1?'thing':'things')+'</span>';
  if (due.length) head += '<span class="g-count-sub">· '+due.length+' usual due</span>';
  var inCart = open.filter(function(i){return i.checked}).length;
  if (inCart) head += '<span class="g-count-sub">· '+inCart+' in the cart</span>';
  document.getElementById('groceryHead').innerHTML = head;

  // Usual tray — staples not on the list; due ones first with the gold ring
  var u = '';
  if (gState.staples.length){
    u += '<div class="g-tray-label">Usual · tap to add</div><div class="g-tray">';
    gState.staples.slice(0,10).forEach(function(s){
      u += '<div class="g-chip'+(s.due?' due':'')+'" data-add="'+esc(s.label)+'" data-cat="'+esc(s.category||'Other')+'">'+esc(s.label)+'</div>';
    });
    u += '</div>';
  }
  document.getElementById('groceryUsual').innerHTML = u;

  // The list, by aisle in store order; unchecked first, in-cart stays in its aisle
  var c = document.getElementById('groceryItems');
  if (!open.length){
    c.innerHTML = '<div class="g-empty">Nothing on the list. Say it, type it, or tap a usual.</div>';
  } else {
    var bySec = {};
    open.forEach(function(it){
      var cat = it.category || 'Other';
      var sec = sections.find(function(s){return s.toLowerCase()===String(cat).toLowerCase()}) || 'Other';
      (bySec[sec] = bySec[sec] || []).push(it);
    });
    var order = sections.filter(function(s){return bySec[s]}).concat(Object.keys(bySec).filter(function(s){return sections.indexOf(s)<0}));
    var h = '';
    order.forEach(function(sec){
      h += '<div class="g-sec">'+esc(sec)+'</div>';
      bySec[sec].sort(function(a,b){return (a.checked?1:0)-(b.checked?1:0)}).forEach(function(it){
        var src = sourceLabel(it);
        h += '<div class="grocery-item'+(it.checked?' checked':'')+'" data-id="'+it.id+'" data-checked="'+(it.checked?1:0)+'">'
           + '<div class="grocery-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>'
           + '<div class="grocery-name">'+esc(it.text)+(it.quantity && it.quantity!=='1' ? '<span class="g-qty">×'+esc(it.quantity)+'</span>':'')+'</div>'
           + (src ? '<div class="g-src">'+esc(src)+'</div>' : '')
           + '</div>';
      });
    });
    c.innerHTML = h;
  }

  // Recently bought — tap to add back
  var r = '';
  if (recent.length){
    var seen = {}; var chips = [];
    recent.sort(function(a,b){return new Date(b.bought_at)-new Date(a.bought_at)}).forEach(function(it){
      var k = normKey(it.text); if (seen[k]) return; seen[k]=1;
      if (open.some(function(o){return normKey(o.text)===k})) return;
      chips.push(it);
    });
    if (chips.length){
      r += '<div class="g-tray-label">Recently bought · tap to add back</div><div class="g-tray">';
      chips.slice(0,10).forEach(function(it){ r += '<div class="g-chip" data-add="'+esc(it.text)+'" data-cat="'+esc(it.category||'Other')+'">'+esc(it.text)+'</div>'; });
      r += '</div>';
    }
  }
  document.getElementById('groceryRecent').innerHTML = r;
  document.getElementById('groceryDone').style.display = inCart ? 'flex' : 'none';
}

// ── Adds ─────────────────────────────────────────────────────────────
function addGroceryItem(text, category, source){
  text = String(text||'').trim(); if (!text) return Promise.resolve();
  return sbFetch('grocery_items',{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify({list_id:activeListId,text:text,category:category||'Other',checked:false,added_by:'wall',source:source||'wall'})})
    .then(function(){ return fetchGrocery(); })
    .then(function(){ highlightItem('groceryCard', text); });
}
function quickAddItem(){
  var input=document.getElementById('quickAddInput');
  var text=input.value.trim(); if(!text)return;
  input.value='';
  addGroceryItem(text, guessCategory(text), 'wall');
}
function guessCategory(t){
  t=t.toLowerCase();
  if(/\b(milk|cheese|yogurt|butter|cream|eggs?|creamer)\b/.test(t))return'Dairy';
  if(/\b(apple|banana|orange|grape|berr|lettuce|spinach|tomato|onion|garlic|potato|carrot|celery|avocado|lemon|lime|pepper|broccoli|cucumber|salad|fruit)/.test(t))return'Produce';
  if(/\b(chicken|beef|steak|pork|bacon|sausage|turkey|ham|fish|salmon|shrimp|tuna)\b/.test(t))return'Meat';
  if(/\b(bread|bagel|bun|roll|tortilla|muffin|croissant|cake|pie)/.test(t))return'Bakery';
  if(/\b(ketchup|mustard|mayo|dressing|sauce|salsa|syrup|jam|jelly|honey)\b/.test(t))return'Condiments';
  if(/\b(water|juice|soda|coke|pepsi|beer|wine|coffee|tea|gatorade|lemonade)\b/.test(t))return'Drinks';
  if(/\b(diaper|wipes|formula|baby|pull-?ups?|sippy)/.test(t))return'Baby';
  if(/\b(dog|cat|kibble|litter|pet)\b/.test(t))return'Pets';
  if(/\b(paper towel|toilet paper|soap|detergent|dish|sponge|trash bag|bleach|shampoo|toothpaste|batter(y|ies)|foil|ziploc|cleaner)/.test(t))return'Household';
  if(/\b(rice|pasta|noodle|cereal|oat|flour|sugar|salt|oil|beans|soup|broth|snack|chips|cracker|cookie|granola|peanut butter|spice)/.test(t))return'Pantry';
  return 'Other';
}
function voiceAddItem(){
  if(!('webkitSpeechRecognition' in window)&&!('SpeechRecognition' in window)){document.getElementById('quickAddInput').placeholder='Say it to Greg instead';return;}
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  var rec=new SR();rec.lang='en-US';rec.interimResults=false;
  var input=document.getElementById('quickAddInput');
  input.placeholder='Listening…';input.style.borderColor='var(--greg)';
  rec.onresult=function(e){var t=e.results[0][0].transcript;input.placeholder='Add something…';input.style.borderColor='';addGroceryItem(t, guessCategory(t), 'voice');};
  rec.onerror=function(){input.placeholder='Add something…';input.style.borderColor='';};
  rec.onend=function(){input.style.borderColor='';};
  rec.start();
}

// ── Undo pill (Nielsen #3: undo, never confirm) ────────────────────────
function showUndo(text, undoFn){
  clearTimeout(gState.undoTimer);
  var box=document.getElementById('groceryUndo');
  box.innerHTML='<div class="g-undo"><span>'+text+'</span><span class="g-undo-btn" id="groceryUndoBtn">Undo</span></div>';
  document.getElementById('groceryUndoBtn').onclick=function(){ box.innerHTML=''; clearTimeout(gState.undoTimer); Promise.resolve(undoFn()).then(fetchGrocery); };
  gState.undoTimer=setTimeout(function(){box.innerHTML='';},6000);
}

// ── Row interactions: tap = in cart, long-press = actions ───────────────
function setChecked(id, checked){
  var it = gState.items.find(function(i){return i.id===id}); if(!it) return;
  it.checked = checked; renderGrocery();
  sbPatch('grocery_items?id=eq.'+id,{checked:checked, checked_at: checked?new Date().toISOString():null}).then(updatePickerCounts);
  showUndo('<b>'+esc(it.text)+'</b>'+(checked?' in the cart':' back on the list'), function(){ return sbPatch('grocery_items?id=eq.'+id,{checked:!checked}); });
}
function openActions(row){
  var id=row.getAttribute('data-id'); var it=gState.items.find(function(i){return i.id===id}); if(!it) return;
  gState.openActions=id;
  var other = activeListId===LIST_IDS.grammy ? LIST_IDS.angela : LIST_IDS.grammy;
  var qty = parseInt(it.quantity||'1',10)||1;
  row.innerHTML = '<div class="grocery-name" style="flex:0 1 auto;max-width:200px">'+esc(it.text)+'</div>'
    + '<div class="g-actions">'
    + '<div class="g-act qty" data-qty="-1">−</div><div class="g-act qty" data-qty="0">'+qty+'</div><div class="g-act qty" data-qty="1">+</div>'
    + '<div class="g-act" data-move="'+other+'">Move to '+esc(LIST_LABEL[other])+'</div>'
    + '<div class="g-act danger" data-del="1">Delete</div>'
    + '<div class="g-act" data-cancel="1">Cancel</div>'
    + '</div>';
  row.classList.add('pressing');
}
function deleteItem(id){
  var it = gState.items.find(function(i){return i.id===id}); if(!it) return;
  gState.items = gState.items.filter(function(i){return i.id!==id}); renderGrocery();
  sbPatch('grocery_items?id=eq.'+id,{deleted_at:new Date().toISOString()}).then(updatePickerCounts);
  showUndo('Removed <b>'+esc(it.text)+'</b>', function(){ return sbPatch('grocery_items?id=eq.'+id,{deleted_at:null}); });
}
function moveItem(id, toList){
  var it = gState.items.find(function(i){return i.id===id}); if(!it) return;
  gState.items = gState.items.filter(function(i){return i.id!==id}); renderGrocery();
  sbPatch('grocery_items?id=eq.'+id,{list_id:toList}).then(updatePickerCounts);
  showUndo('<b>'+esc(it.text)+'</b> moved to '+esc(LIST_LABEL[toList]), function(){ return sbPatch('grocery_items?id=eq.'+id,{list_id:activeListId}); });
}
function setQty(id, delta){
  var it = gState.items.find(function(i){return i.id===id}); if(!it) return;
  var q = Math.max(1,(parseInt(it.quantity||'1',10)||1)+delta); it.quantity=String(q);
  sbPatch('grocery_items?id=eq.'+id,{quantity:String(q)});
  var row=document.querySelector('.grocery-item[data-id="'+id+'"]'); if(row) openActions(row);
}

(function wireGrocery(){
  var c = document.getElementById('groceryItems');
  var start = function(e){
    var row=e.target.closest('.grocery-item'); if(!row || gState.openActions) return;
    gState.suppressTap=false;
    row.classList.add('pressing');
    gState.press=setTimeout(function(){ gState.suppressTap=true; openActions(row); }, 600);
  };
  var end = function(e){
    clearTimeout(gState.press); gState.press=null;
    if (gState.openActions) return;
    document.querySelectorAll('.grocery-item.pressing').forEach(function(r){r.classList.remove('pressing')});
  };
  c.addEventListener('pointerdown', start); c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end); c.addEventListener('pointerleave', end);
  c.addEventListener('click', function(e){
    var row=e.target.closest('.grocery-item'); if(!row) return;
    var id=row.getAttribute('data-id');
    if (gState.openActions){
      if (gState.openActions!==id) return;
      var t=e.target.closest('.g-act');
      if (!t) return;
      if (t.hasAttribute('data-cancel')) { gState.openActions=null; renderGrocery(); return; }
      if (t.hasAttribute('data-del')) { gState.openActions=null; deleteItem(id); return; }
      if (t.hasAttribute('data-move')) { gState.openActions=null; moveItem(id, t.getAttribute('data-move')); return; }
      if (t.hasAttribute('data-qty')) { var d=parseInt(t.getAttribute('data-qty'),10); if(d) setQty(id,d); return; }
      return;
    }
    if (gState.suppressTap){ gState.suppressTap=false; return; }
    setChecked(id, row.getAttribute('data-checked')!=='1');
  });
  // trays: tap a chip to add
  ['groceryUsual','groceryRecent'].forEach(function(id){
    document.getElementById(id).addEventListener('click', function(e){
      var chip=e.target.closest('.g-chip'); if(!chip) return;
      addGroceryItem(chip.getAttribute('data-add'), chip.getAttribute('data-cat'), 'tray');
    });
  });
})();

// ── Trips: print starts one; Done shopping closes it (catch-up by exception lives on the phone + voice) ──
function doneShopping(){
  var inCart = gState.items.filter(function(i){return !i.bought_at && i.checked});
  if (!inCart.length) return;
  var now = new Date().toISOString(); var ids = inCart.map(function(i){return i.id});
  inCart.forEach(function(i){ i.bought_at=now; i.checked=false; }); renderGrocery();
  sbPatch('grocery_items?id=in.('+ids.join(',')+')',{bought_at:now, checked:false})
    .then(function(){ return sbPatch('grocery_trips?list_id=eq.'+activeListId+'&completed_at=is.null',{completed_at:now, completed_by:'wall'}); })
    .then(updatePickerCounts);
  showUndo('<b>'+ids.length+'</b> bought · trip done', function(){ return sbPatch('grocery_items?id=in.('+ids.join(',')+')',{bought_at:null, checked:true}); });
}
function startTripAndPrint(){
  var open = gState.items.filter(function(i){return !i.bought_at});
  if (!open.length) return;
  var list = gState.lists[activeListId]||{};
  sbFetch('grocery_trips',{method:'POST',headers:{'Prefer':'return=representation'},body:JSON.stringify({list_id:activeListId,started_by:'wall',medium:'print',store:list.store||null})})
    .then(function(r){ return r.json ? r.json() : r; })
    .then(function(rows){ var trip = rows && rows[0]; if(!trip) return; return sbPatch('grocery_items?list_id=eq.'+activeListId+'&bought_at=is.null&deleted_at=is.null&trip_id=is.null',{trip_id:trip.id}); })
    .then(function(){ showUndo('Trip started · <b>'+open.length+'</b> things · printing', function(){}); if (typeof printGroceryList==='function') printGroceryList(); })
    .catch(function(e){ console.log('trip failed', e); if (typeof printGroceryList==='function') printGroceryList(); });
}

fetchGrocery(); if(!CFG.PLEXUS_KEY) setInterval(fetchGrocery, CFG.GROCERY_REFRESH);
