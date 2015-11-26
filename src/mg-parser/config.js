define(function () {
        var associative = {
            LEFT: 1,
                RIGHT: 2
        };
        return {
            associative: associative,
            operators: {
                '+': {
                    priority: 6,
                    associative: associative.LEFT,
                    func: function (x, y) {
                        return x + y;
                    }
                },
                '-': {
                    priority: 6,
                    associative: associative.LEFT,
                    func: function (x, y) {
                        return x - y;
                    }
                },
                '*': {
                    priority: 7,
                    associative: associative.LEFT,
                    func: function (x, y) {
                        return x * y;
                    }
                },
                '/': {
                    priority: 7,
                    associative: associative.LEFT,
                    func: function (x, y) {
                        return x / y;
                    }
                },
                '^': {
                    priority: 8,
                    associative: associative.RIGHT,
                    func: function (x, y) {
                        return Math.pow(x, y);
                    }
                }
            },
            functions: {
                sin: function (x){
                    return Math.sin(x);
                },
                cos: function (x){
                    return Math.cos(x);
                }
            },
            error: {
                PARENTHESIS: 1,
                OTHER: 2,
                ASSOCIATIVE: 3
            }
        };
    }
);