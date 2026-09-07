function startTripAndPrint(){
  // Greg prints on the kitchen Epson from Sentinel and opens the trip himself (WG-38).
  // GET on purpose: no body for the WebView's self-signed-cert retry to drop.
  var open = gState.items.filter(function(i){return !i.bought_at}); if (!open.length) return;
  var which = activeListId===LIST_IDS.grammy ? 'grammy' : 'angela';
  showUndo('Printing <b>'+open.length+'</b> things…', function(){});
  fetch('https://192.168.2.11:9443/v1/print?list='+which, {method:'GET', cache:'no-store'})
    .then(function(r){ return r.json(); })
    .then(function(res){
      if (res && res.ok) showUndo('On the printer · <b>'+open.length+'</b> things · trip started', function(){});
      else showUndo('The printer did not answer', function(){});
      fetchGrocery();
    })
    .catch(function(){ showUndo('Could not reach the printer', function(){}); });
}
