
console.log('Loading a web page');
var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1080 };
var url = 'https://www.instagram.com/';
page.open(url, function (status) {
  //Page is loaded!
setTimeout(function(){
    console.log('Stripped down page text:\n' + page.plainText);
   page.render('ok.jpg')
   phantom.exit();
},4000)

});
