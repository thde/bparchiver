'use strict';

const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

const readline = require('readline-sync');

const printLinks = (user, password) => {
  nightmare
  .goto('https://bandcamp.com/login')
  .type('#username-field', user)
  .type('#password-field', password)
  .click('#loginform .buttons button')
  .wait('#collection-main a')
  .click('#collection-main a')
  .wait('.redownload-item a')
  .evaluate(() => {
    var links = new Array();
    document.querySelectorAll('.redownload-item a').forEach(e => links.push(e.href));
    return links;
  })
  .then(links => {
    links.reduce((accumulator, link) => {
      return accumulator.then(results => {
        return nightmare
          .goto(link)
          .wait('.download-title a')
          .wait(() => document.querySelector('.download-title a').href != '')
          .evaluate(() => document.querySelector('.download-title a').href)
          .then(dlurl => {
            results.push(dlurl);
            return results;
          });
      })
    }, Promise.resolve([])).then(results => {
      results.forEach(result => console.log(result));
      return nightmare
        .goto('https://bandcamp.com/logout')
        .end(); 
    });
  });
}

const user = readline.question('Username: ');
const password = readline.question('Password: ', {
  hideEchoBack: true
});

printLinks(user, password);