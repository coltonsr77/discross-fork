var url = require('url');
var fs = require('fs');
var HTMLMinifier = require('@bhavingajjar/html-minify');
var minifier = new HTMLMinifier();
var escape = require('escape-html');

var auth = require('../authentication.js');

const register_template = minifier.htmlMinify(fs.readFileSync('pages/templates/register.html', 'utf-8'));
const error_template = minifier.htmlMinify(fs.readFileSync('pages/templates/login/error.html', 'utf-8'));

function strReplace(string, needle, replacement) {
  return string.split(needle).join(replacement || "");
};

exports.processRegister = async function (bot, req, res, args) {
  discordID = await auth.checkAuth(req, res, true); // true means that the user isn't redirected to the login page
  if (discordID) {
    res.writeHead(302, { "Location": "/server/" });
    res.write('Logged in! Click <a href="/server/">here</a> to continue.');
  } else {
    parsedurl = url.parse(req.url, true);
    response = register_template;
    if (parsedurl.query.errortext) {
      response = strReplace(response, "{$ERROR}", strReplace(error_template, "{$ERROR_MESSAGE}", strReplace(escape(parsedurl.query.errortext), "\n", "<br>")));
    } else {
      response = strReplace(response, "{$ERROR}", "");
    }
    const whiteThemeCookie = req.headers.cookie?.split('; ')?.find(cookie => cookie.startsWith('whiteThemeCookie='))?.split('=')[1];
    
    // Apply theme class based on cookie value: 0=dark (default), 1=light, 2=amoled
    if (whiteThemeCookie == 1) {
      response = strReplace(response, "{$WHITE_THEME_ENABLED}", "class=\"light-theme\"");
    } else if (whiteThemeCookie == 2) {
      response = strReplace(response, "{$WHITE_THEME_ENABLED}", "class=\"amoled-theme\"");
    } else {
      response = strReplace(response, "{$WHITE_THEME_ENABLED}", "");
    }
    res.write(response);
  }
  res.end();
}
