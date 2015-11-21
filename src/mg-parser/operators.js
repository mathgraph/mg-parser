define(function () {
        return {
                '+': {
                    priority: 6,
                    associative: 'left',
                    func: function (x, y) {
                        return x + y;
                    }
                },
                '-': {
                    priority: 6,
                    associative: 'left',
                    func: function (x, y) {
                        return x - y;
                    }
                },
                '*': {
                    priority: 7,
                    associative: 'left',
                    func: function (x, y) {
                        return x * y;
                    }
                },
                '/': {
                    priority: 7,
                    associative: 'left',
                    func: function (x, y) {
                        return x / y;
                    }
                },
                '^': {
                    priority: 8,
                    associative: 'right',
                    func: function (x, y) {
                        return Math.pow(x, y);
                    }
                }
        };
    }
);