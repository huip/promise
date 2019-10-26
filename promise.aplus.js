

(function () {

    // Promise constructor
    var P = function (executor) {
        var self = this
        // current status of promise 
        self.status = 'pending'
        // value of promise
        self.data = undefined
        // status of promise change to resolve's sets
        self.onResolvedCallback = []
        self.onRejectedCallback = []
        function resolve(value) {
            if (self.status === 'pending') {
                self.status = 'resolved'
                self.data = value
                for (var i = 0; i < self.onResolvedCallback.length; i++) {
                    self.onResolvedCallback[i](value)
                }
            }
        }

        function reject(reason) {
            if (self.status === 'pending') {
                self.status = 'rejected'
                self.data = reason
                for (var i = 0; i < self.onRejectedCallback.length; i++) {
                    self.onRejectedCallback[i](reason)
                }
            }
        }
        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    // Promise prototype method
    P.prototype.then = function (onFulfiled, onRejected) {
        var self = this
        var p2
        onFulfiled = typeof onFulfiled === 'function' ? onFulfiled : function (value) { return value }
        onRejected = typeof onRejected === 'function' ? onRejected : function (reason) { throw reason }

        /**
         * Promise have three status and according to promise/a+ then should return new Promise
         */
        if (self.status === 'resolved') {
            return p2 = new P(function (resolve, reject) {
                try {
                    var x = onFulfiled(self.data)
                    if (x instanceof P) {
                        x.then(resolve, reject)
                    }
                    resolve(x)
                } catch (error) {
                    reject(error)
                }
            })
        }

        if (self.status === 'rejected') {
            return p2 = new P(function (resolve, reject) {
                try {
                    var x = onRejected(self.data)
                    if (x instanceof P) {
                        x.then(resolve, reject)
                    }
                } catch (error) {
                    reject(error)
                }
            })
        }

        if (self.status === 'pending') {
            return p2 = new P(function (resolve, reject) {

                self.onResolvedCallback.push(function (value) {
                    try {
                        var x = onFulfiled(self.data)
                        if (x instanceof P) {
                            x.then(resolve, reject)
                        }
                    } catch (error) {
                        reject(e)
                    }
                })

                self.onRejectedCallback.push(function (reason) {
                    try {
                        var x = onRejected(self.data)
                        if (x instanceof P) {
                            x.then(resolve, reject)
                        }
                    } catch (error) {
                        reject(error)
                    }
                })

            })
        }
    }

    P.prototype.catch = function (onRejected) {
        return this.then(null, onRejected)
    }

    // Promise static method
    P.resolve = function () { }
    P.reject = function () { }
    P.race = function () { }
    P.all = function () { }

})()