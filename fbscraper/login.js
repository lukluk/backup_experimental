var system = require('system');
var args = system.args;
debug('Loading a web page');
var page = require('webpage').create();
var log = ''
var fs = require('fs');
var CookieJar = "cookiejar.json";
var pageResponses = {};
page.onResourceReceived = function(response) {
    pageResponses[response.url] = response.status;
    fs.write(CookieJar, JSON.stringify(phantom.cookies), "w");
};
if (fs.isFile(CookieJar))
    Array.prototype.forEach.call(JSON.parse(fs.read(CookieJar)), function(x) {
        phantom.addCookie(x);
    })

function waitFor(ele, cb, i) {
    var index = i ? i : 0
    if (index > 10) {
        debug(ele, 'not exist and may be timeout')
        exit()
    }
    var exist = page.evaluate(function(ele) {
        function isVisible(ele) {
            return ele.clientWidth !== 0 &&
                ele.clientHeight !== 0 &&
                ele.style.opacity !== 0 &&
                ele.style.visibility !== 'hidden';
        }
        return (document.querySelectorAll(ele).length > 0)
    }, ele)
    if (!exist) {
        capture('waitFor' + ele)
        debug('waitFor', ele, (new Date).getSeconds())
        index++;
        setTimeout(function() {
            waitFor(ele, cb, index)
        }, 1000)
    } else {
        capture('waitFor' + ele)
        debug('waitFor', ele, 'done')
        cb && cb(true)
    }
}

function debug(a, b, c, d, e) {
    a = a ? a : ''
    b = b ? b : ''
    c = c ? c : ''
    d = d ? d : ''
    e = e ? e : ''
    //  console.log(a, b, c, d, e)
    log = log + a + b + c + d + e + "\n"
}

function click(ele) {
    capture('click' + ele)
    var elem = page.evaluate(function(ele) {
        // find element to send click to
        var elements = document.querySelectorAll(ele).length;
        if (elements > 0) {
            var element = document.querySelector(ele);
            // create a mouse click event
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, window, 1, 0, 0);

            // send click to element
            element.dispatchEvent(event);
        } else {
            //debug(ele, 'not exist')
        }
        return elements
    }, ele)
    debug('click', ele, elem)
}

function capture(name) {
    //page.render('capture/' + name + '.png')
}


page.onLoadFinished = function(status) {
    //page.injectJs('jquery.min.js')

};


function fbLogin(cb) {
    page.evaluate(function(args) {
        jQuery('input[name="email"]').val(args[1])
        jQuery('input[name="pass"]').val(args[2])
    }, args);

    click('[value=Masuk]')
    waitFor('#q', function() {
        capture('after.login')
        cb && cb()
    })
}

function exit() {
    debug('phantom exit')
    
    fs.write('log/' + args[0] + '_' + args[1] + '_' + args[2]  + '.txt', log, 'w')
    phantom.exit();
}

page.open('http://www.facebook.com/', function(status) {
    if (status == 'success') {
        debug('open facebook.com done')
        page.injectJs('jquery.min.js')
        fbLogin(function() {
            exit()
        })
    }
})