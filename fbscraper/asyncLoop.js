module.exports = function() {
    this.index = 0
    this.loop = function(items, cb) {
        console.log('loop', this.index, items.length)
        var self = this
        if (self.index < items.length) {
            cb(items[self.index], function() {
                index++
                self.loop(self.items, cb)
            })
        }
    }
}