const http = require('http');
const querystring = require('querystring');


// Globals
const HOSTNAME = 'www.way2sms.com';
const CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';


// Get JSESSIONID cookie.
function getCookie() {
  return new Promise((fres, frej) => {
    var options = {hostname: HOSTNAME};
    var req = http.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', () => 0);
      res.on('end', () => {
        var cookies = res.headers['set-cookie'];
        fres(cookies[0].replace(/;.*/, ''));
      });
    });
    req.on('error', frej);
    req.end();
  });
};

// Login with mobile no., password.
function reLogin(mob, pwd) {
  return getCookie().then((cookie) => new Promise((fres, frej) => {
    var data = querystring.stringify({mobileNo: mob, password: pwd, CatType: ''});
    var headers = {'Cookie': [cookie], 'Content-Type': CONTENT_TYPE, 'Content-Length': Buffer.byteLength(data)};
    var options = {hostname: HOSTNAME, path: '/re-login', method: 'POST', headers};
    var req = http.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', () => 0);
      res.on('end', () => {
        if(res.statusCode===200) fres(cookie);
        else frej(new Error(`HTTP ${res.statusCode} returned!`));
      });
    });
    req.on('error', frej);
    req.write(data);
    req.end();
  }));
};

// Send SMS to mobile.
function smstoss(cok, to, msg) {
  return new Promise((fres, frej) => {
    var token = cok.replace(/.*?~/, '');
    var data = querystring.stringify({Token: token, message: msg, toMobile: to, ssaction: 'ss'});
    var headers = {'Cookie': [cok], 'Content-Type': CONTENT_TYPE, 'Content-Length': Buffer.byteLength(data)};
    var options = {hostname: HOSTNAME, path: '/smstoss', method: 'POST', headers};
    var req = http.request(options, (res) => {
      var response = '';
      res.setEncoding('utf8');
      res.on('data', (cnk) => response += cnk);
      res.on('end', () => {
        if(res.statusCode!==200) frej(new Error(`HTTP ${res.statusCode} returned!`));
        else if(response!=='0') frej(new Error(`Response "${response}" returned!`));
        fres();
      });
    });
    req.on('error', frej);
    req.write(data);
    req.end();
  });
};
exports.reLogin = reLogin;
exports.login = reLogin;
exports.smstoss = smstoss;
exports.send = smstoss;


// Main
function main() {
  const A = process.argv;
  if(A[2]==='reLogin') reLogin(A[3], A[4]).then(console.log, e => console.error(e.message));
  else if(A[2]==='smstoss') smstoss(A[3], A[4], A[5]).then(() => 0, e => console.error(e.message));
  else console.error(1);
};
if(require.main===module) main();
