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
        return (document.querySelectorAll(ele).length > 0) && isVisible(document.querySelectorAll(ele)[0])
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


function exit() {
    debug('phantom exit')
    var postid = args[3].split('posts/')
    postid = postid[1].split('?')
    postid = postid[0]
    fs.write('log/' + args[0] + '_' + args[1] + '_' + args[2] + '_' + postid + '.txt', log, 'w')
    phantom.exit();
}


page.open(args[3], function() {
    var postid = args[3].split('posts/')
    postid = postid[1].split('?')
    postid = postid[0]

    waitFor('[data-ft*="' + postid + '"]', function() {
        capture('open post')
        click("a[aria-label*=Suka]")
        waitFor('ul[role=tablist]', function() {
            capture('liked')
            var profiles = page.evaluate(function() {
                var o = {}
                var profiles = []
                var arr = document.querySelectorAll('[data-gt*=engagement]')
                for (var i = 0; i < arr.length; i++)
                    profiles.push(arr[i].getAttribute('href'))
                o.like = profiles

                var profiles = []
                var arr = document.querySelectorAll('.UFICommentActorName')
                for (var i = 0; i < arr.length; i++) {
                    var found = false
                    for (var n = 0; n < profiles.length; n++) {
                        if (profiles[n] == arr[i].getAttribute('href')) {
                            found = true
                        }
                    }
                    if (!found)
                        profiles.push(arr[i].getAttribute('href'))
                }
                o.comments = profiles
                return o
            })
            var o = {
                data: profiles
            }
            console.log(JSON.stringify(o))
            exit()
        })
    })
})