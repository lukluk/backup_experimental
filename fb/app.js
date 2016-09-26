var fs = require('fs')
var Horseman = require('node-horseman');
var horseman = new Horseman();

//login
horseman  
  .open('https://www.facebook.com')
  .delay(1000)
  .type('input[name="email"]', 'luklukaha@gmail.com')
  .type('input[name="pass"]', 'b123123b')
  .delay(1000)
  .keyboardEvent('keypress', 16777221)  
  .delay(3000)
  .screenshot('login.png')  
  .open('https://www.facebook.com/lukluk1234/posts/10210115560310133?notif_t=like&notif_id=1468484188596689')
  .waitForSelector("[aria-label='Lihat siapa yang menanggapi ini'] a")
  .screenshot('like.png')  
  .delay(3000)
  .click('[aria-labelledby="userNavigationLabel"]')
  .delay(1000)
  .click('a[data-gt*=menu_logout]')
  .delay(1000)
  .screenshot('logout.png')
  .close();
