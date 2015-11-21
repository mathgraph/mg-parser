define(['mg-parser/functions', 'mg-parser/operators'],
    function (functions, operators) {
        var pushToken = function (tokens, type, value) {
            if (type === 'number') {
                tokens.push({type: type, value: parseFloat(value)});
            } else if (type === 'operator') {
                tokens.push({type: type, value: value});
            } else if (type === 'letter') {
                tokens.push({type: typeof functions[value] !== 'undefined' ? 'function' : 'variable', value: value});
            } else if (type === 'openingParenthesis' || type === 'closingParenthesis') {
                tokens.push({type: type, value: value});
            } else if (type === 'space' || typeof type === 'undefined') {
            } else {
                throw type + " undefined";
            }
        };

        return function (str) {
            var i, c, h, tokens, typeOfPrevious, previosValue;
            tokens = {
                head: null,
                tail: null,
                push: function (v) {
                    var newItem = v;
                    v.next = null;
                    v.previous = this.tail;
                    if (this.head === null) {
                        this.head = this.tail = newItem;
                    } else {
                        this.tail.next = newItem;
                        this.tail = newItem;
                    }
                }
            };
            for (i = 0; i < str.length; i++) {
                if (str[i] >= '0' && str[i] <= '9' || str[i] === '.' && typeOfPrevious === 'number') {
                    if (typeOfPrevious === 'number') {
                        previosValue += str[i];
                    } else {
                        pushToken(tokens, typeOfPrevious, previosValue);
                        previosValue = str[i];
                        typeOfPrevious = 'number'
                    }
                } else if (typeof operators[str[i]] !== "undefined") {
                    pushToken(tokens, typeOfPrevious, previosValue);
                    previosValue = str[i];
                    typeOfPrevious = 'operator'
                } else if (str[i].match(/[a-z]/i)) {
                    if (typeOfPrevious === 'letter') {
                        previosValue += str[i];
                    } else {
                        pushToken(tokens, typeOfPrevious, previosValue);
                        previosValue = str[i];
                        typeOfPrevious = 'letter';
                    }
                } else if (str[i] === ' ') {
                    pushToken(tokens, typeOfPrevious, previosValue);
                    previosValue = str[i];
                    typeOfPrevious = 'space';
                } else if (str[i] === '(') {
                    pushToken(tokens, typeOfPrevious, previosValue);
                    previosValue = str[i];
                    typeOfPrevious = 'openingParenthesis';
                } else if (str[i] === ')') {
                    pushToken(tokens, typeOfPrevious, previosValue);
                    previosValue = str[i];
                    typeOfPrevious = 'closingParenthesis';
                } else {
                    throw "error input!";
                }
            }
            pushToken(tokens, typeOfPrevious, previosValue);
            return tokens;
        }
    }
);