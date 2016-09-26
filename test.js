
console.log('Loading a web page');
var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1080 };
var url = 'https://www.instagram.com/';
page.open(url, function (status) {
  //Page is loaded!
setTimeout(function(){
  page.render('google_home.jpeg', {format: 'jpeg', quality: '100'});
   console.log(status)
   phantom.exit();
},4000)

});

