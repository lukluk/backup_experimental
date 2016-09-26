  var Nightmare = require('nightmare');
  var nightmare = Nightmare({ show: false })
console.log('test');
  nightmare
    .goto('http://yahoo.com')
    .type('form[action*="/search"] [name=p]', 'github nightmare')
    .click('form[action*="/search"] [type=submit]')
    .wait('#main')
    .evaluate(function () {
      return document.querySelector('#main .searchCenterMiddle li a').href
    })
    .end()
    .screenshot('test.png')
    .then(function (result) {
      console.log(result)
    })
    .catch(function (error) {
      console.error('Search failed:', error);
    });

