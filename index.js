const http = require('http');
const querystring = require('querystring');


const HOSTNAME = 'www.way2sms.com';
const CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';


// Get JSESSIONID cookie.
function getCookie() {
  return new Promise((fres, frej) => {
    var options = {hostname: HOSTNAME};
    var req = http.request(options, (res) => {
      var cookies = res.headers['set-cookie'];
      fres(cookies[0].replace(/;.*/, ''));
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
      if(res.statusCode===200) fres(cookie);
      else frej(new Error(`HTTP ${res.statusCode} returned!`));
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
      if(res.statusCode===200) fres();
      else frej(new Error(`HTTP ${res.statusCode} returned!`));
    });
    req.on('error', frej);
    req.write(data);
    req.end();
  });
};

reLogin('8895442590', 'Yaw2Sms77').then((cok) => {
  smstoss(cok, '8895442590', 'my heart will go on and on for ever and ever').then(() => {
    console.log('sent');
  });
});
