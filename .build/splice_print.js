// Replace the startTripAndPrint function body in index.html with .build/print_button.js
const fs = require('fs');
const p = 'D:/Projects/greg-skylight-dashboard/index.html';
let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); if (crlf) s = s.replace(/\r\n/g, '\n');
const nf = fs.readFileSync('D:/Projects/greg-skylight-dashboard/.build/print_button.js', 'utf8').replace(/\r\n/g, '\n').trimEnd();
const start = s.indexOf('function startTripAndPrint(){');
if (start < 0) throw new Error('start anchor');
const end = s.indexOf('\n}\n', start);
if (end < 0) throw new Error('end anchor');
s = s.slice(0, start) + nf + s.slice(end + 2);
fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s, 'utf8');
const vm = require('vm'); const re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi; let m, i = 0, ok = true;
while ((m = re.exec(s))) { i++; try { new vm.Script(m[1], { filename: 'b' + i }); } catch (e) { ok = false; console.log('ERR', i, e.message); } }
console.log('spliced print button; ok', ok);
