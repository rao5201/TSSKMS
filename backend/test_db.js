const db = require('./config/database');
console.log('DB module loaded');
setTimeout(function() {
  db.get('SELECT COUNT(*) as c FROM admins', function(e, r) {
    if (e) { console.error('ERROR:', e.message); }
    else { console.log('admins count:', r && r.c); }
    setTimeout(function() { process.exit(0); }, 500);
  });
}, 2500);
