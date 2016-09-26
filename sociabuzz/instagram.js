function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
exports.scraper = {
    follower: function(req, res) {
        var self = this
        var url = 'https://www.instagram.com/' + req.params.data + '/'
        var browser = new self.Horseman()
        console.log(url)        
            browser.open('https://www.instagram.com/')
            .screenshot('logged.png')                                                        
            .then(function(data) {
                res.json(data)
            })
    },
    main: function(req, res) {
        var dbuser = {}
        var url = 'https://www.instagram.com/' + req.params.action
        var self = this
        self.requestDOM(url, function(err, $) {
            if (err) {
                res.json({
                    error: true,
                    message: 'failed to get user media'
                })
                return false
            }
            dbuser.title = $('[property*=title]').attr('content')
            dbuser.status = $('[property*=description]').attr('content')
            var body = $('body').html()
            var following = body.split('"follows": {"count": ')
            following = following[1].split('}, "')

            var follower = body.split('"followed_by": {"count": ')
            follower = follower[1].split('}, "')

            dbuser.follower = parseInt(follower[0])
            dbuser.following = parseInt(following[0])
            self.request(url + '/media/', function(err, resp, body) {
                if (err) res.json({
                    error: true,
                    message: 'failed to get user media'
                })
                if (!IsJsonString(body)) {
                    res.json({
                        error: true,
                        message: 'failed to get user media'
                    })
                    return false
                }
                var media = JSON.parse(body)
                if (media && media.status == 'ok') {
                    dbuser.numberOfPost = media.items.length
                    media.items = media.items.slice(0, 150)
                    dbuser.numberOfLikes = 0
                    dbuser.numberOfComments = 0
                    dbuser.username = req.params.action
                    dbuser.post = []
                    media.items.forEach(function(item) {
                        dbuser.numberOfLikes = dbuser.numberOfLikes + item.likes.count
                        dbuser.numberOfComments = dbuser.numberOfComments + item.comments.count
                        if (item.videos) {
                            dbuser.post.push(item.videos.standard_resolution)
                        } else {
                            dbuser.post.push(item.images.standard_resolution)
                        }
                    })
                    res.json(dbuser)
                } else {
                    res.json({
                        error: true,
                        message: 'failed to get user media'
                    })
                    return false
                }
            })
        })
    }
}
