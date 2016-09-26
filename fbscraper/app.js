var fs = require('fs')
var express = require('express');
var request = require('request')
var app = express();
const execFile = require('child_process').execFile;

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
var index = 0

function reqLoop(items, cb, finish) {
    console.log('loop', index, items.length)
    if (index < items.length) {
        cb(items[index], cb, finish)
    } else {
        index = 0
        finish && finish()
    }
}
app.get('/post', function(req, res) {
    console.log("------------------------------->")
    var b = new Buffer(req.query.url, 'base64')
    var url = b.toString();

    var profiles = []

    function onFinish() {
        //console.log('profiles', profiles)
        res.json({
            audience: profiles
        });
    }


    execFile('phantomjs', ['post.js', 'luklukaha@gmail.com', 'b123123b', url], function(error, stdout, stderr) {
        if (error) {
            throw error;
        }
        var o = JSON.parse(stdout)
        if (o) {
            if (o.data) {
                console.log('COMMENT')
                reqLoop(o.data.comments, function(iurl, cb, finish) {
                    var url = 'http://127.0.0.1:3000/profile?url=' + new Buffer(iurl).toString('base64')
                    console.log('-', url)
                    request(url, function(error, response, body) {

                        if (!error && response.statusCode == 200) {
                            if (IsJsonString(body)) {
                                body = JSON.parse(body)
                            } else {
                                body = {
                                    data: {}
                                }
                            }
                            if (!body.data.edu)
                                console.log('==>', body)
                            body.data.action = 'comments'
                            profiles.push(body.data)

                        }
                        index++
                        reqLoop(o.data.comments, cb, finish)

                    })
                }, function() {
                    console.log('LIKE')
                    reqLoop(o.data.like, function(iurl, cb, finish) {
                        var url = 'http://127.0.0.1:3000/profile?url=' + new Buffer(iurl).toString('base64')
                        console.log('-', url)
                        request(url, function(error, response, body) {

                            if (!error && response.statusCode == 200) {
                                if (IsJsonString(body)) {
                                    body = JSON.parse(body)
                                } else {
                                    body = {
                                        data: {}
                                    }
                                }
                                //console.log('@@', body)
                                if (!body.data.edu)
                                    console.log('==>', body)
                                body.data.action = 'like'
                                profiles.push(body.data)

                            }
                            index++
                            reqLoop(o.data.like, cb, finish)

                        })

                    }, function() {
                        console.log('DONE', profiles.length)
                        onFinish()
                    })

                })

            }
        }

    });
});

app.get('/profile', function(req, res) {
    var b = new Buffer(req.query.url, 'base64')
    var url = b.toString();
    var user = url.split('.com/')
    user = user[1].split('?')
    user = user[0]
    if (fs.existsSync('cache/' + user + '.json')) {
        var stdout = fs.readFileSync('cache/' + user + '.json')
        if (IsJsonString(stdout)) {
            fs.writeFileSync('cache/' + user + '.json', stdout, 'utf-8')
            res.json(JSON.parse(stdout));
        } else {
            res.json({
                data: {},
                error: stdout
            })
        }
    }else
    execFile('phantomjs', ['profile.js', 'luklukaha@gmail.com', 'b123123b', url], function(error, stdout, stderr) {
        if (error) {
            throw error;
        }
        //console.log('Out ', url, stdout);
        //  console.log("----------------")
        if (IsJsonString(stdout)) {
            fs.writeFileSync('cache/' + user + '.json', stdout, 'utf-8')
            res.json(JSON.parse(stdout));
        } else {
            res.json({
                data: {},
                error: stdout
            })
        }

    });
});

app.get('/login', function(req, res) {

    execFile('phantomjs', ['login.js', 'luklukaha@gmail.com', 'b123123b'], function(error, stdout, stderr) {
        if (error) {
            throw error;
        }
        //console.log('Out ', url, stdout);
        //  console.log("----------------")
        if (IsJsonString(stdout)) {
            res.json(JSON.parse(stdout));
        } else {
            res.json({
                data: {},
                error: stdout
            })
        }

    });
});

app.listen(3000);