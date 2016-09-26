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



function exit() {
    debug('phantom exit')
    var user = args[3].split('.com/')
    user = user[1].split('?')
    user = user[0]

    fs.write('log/' + args[0] + '_' + args[1] + '_' + args[2] + '_' + user + '.txt', log, 'w')
    phantom.exit();
}


var user = args[3].split('.com/')
user = user[1].split('?')
user = user[0]
var profile = {}
debug(user)

page.open('https://www.facebook.com/' + user + '/about?section=education&pnref=about', function() {
    debug('https://www.facebook.com/' + user + '/about?section=education&pnref=about')
    waitFor('li.experience', function() {
        var work = page.evaluate(function() {
            var jobs = []
            var arr = document.querySelectorAll('[data-pnref=work] li.experience');
            for (var i = 0; i < arr.length; i++) {
                var ele = arr[i]
                var job = ele.innerText.split('\n')
                var title = job[2].split(' · ')
                title = title[0]
                job = job[1]
                jobs.push(title + ' at ' + job)
            }
            var edus = []
            var arr = document.querySelectorAll('[data-pnref=edu] li.experience');
            for (var i = 0; i < arr.length; i++) {
                var ele = arr[i]
                var job = ele.innerText.split('\n')
                var title = job[2]
                job = job[1]
                edus.push(title + ' at ' + job)
            }

            return {
                job: jobs,
                edu: edus
            }
        })
        profile.edu = work.edu
        profile.job = work.job
        page.open('https://www.facebook.com/' + user + '/about?section=living&pnref=about', function() {
            debug('https://www.facebook.com/' + user + '/about?section=living&pnref=about')
            // var source = page.evaluate(function() {
            //     return document.querySelector('body').innerHTML
            // })
            // console.log(source)
            waitFor('#current_city a', function() {
                var living = page.evaluate(function() {
                    var living = {}
                    living.current_city = document.querySelector('#current_city a').innerText
                    arr = document.querySelectorAll('[data-pnref=about] ul a[data-hovercard]')
                    living.city = []
                    for (var i = 0; i < arr.length; i++) {
                        living.city.push(arr[i].innerText)
                    }
                    document.write('')
                    return living
                })
                profile.living = living
                //console.log(JSON.stringify(living))
                page.open('https://www.facebook.com/' + user + '/about?section=contact-info&pnref=about', function() {
                    debug('https://www.facebook.com/' + user + '/about?section=contact-info&pnref=about')
                    capture('info')
                    waitFor('ul.fbProfileEditExperiences', function() {

                        var info = page.evaluate(function() {
                            var info = {}
                            var a = document.querySelectorAll('ul.fbProfileEditExperiences')
                            for (var i = 0; i < a.length; i++) {
                                var b = a[i].querySelectorAll('li')
                                for (var n = 0; n < b.length; n++) {
                                    var row = b[n].querySelectorAll('.clearfix div')
                                    if (row.length > 0)
                                        info[row[1].innerText.trim().replace(' ', '_')] = row[0].innerText.replace(row[1].innerText, '').replace('\n', '').replace('\n', '')
                                }
                            }
                            return info
                        })
                        profile.info = info
                        var o = {
                            data: profile
                        }

                        console.log(JSON.stringify(o))
                        exit()
                    })
                })
            })
        })

    })

})