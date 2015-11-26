define(['mg-parser/tokenizer', 'mg-parser/config'],
    function (tokenizer, config) {
        var functions = config.functions,
            operators = config.operators,
            operatorsSortByPriority = [],
            i, tree, getFunction, removeDuplicates, priority, associative;

        operatorsSortByPriority.min = Number.MAX_VALUE;
        operatorsSortByPriority.max = Number.MIN_VALUE;
        for (i in operators) {
            priority = operators[i].priority;
            associative = operators[i].associative;
            priority > operatorsSortByPriority.max && (operatorsSortByPriority.max = priority);
            priority < operatorsSortByPriority.min && (operatorsSortByPriority.min = priority);
            operators[i].string = i;
            if (typeof operatorsSortByPriority[priority] === 'undefined') {
                operatorsSortByPriority[priority] = {associative: associative, arr: {}};
            }
            if (operatorsSortByPriority[priority].associative !== associative) {
                throw config.error.ASSOCIATIVE;
            }
            operatorsSortByPriority[priority].arr[i] = operators[i];
        }

        removeDuplicates = function (arr) {
            var result = [];
            arr.forEach(function (item) {
                if (result.indexOf(item) < 0) {
                    result.push(item);
                }
            });
            return result;
        };

        tree = function (list) {
            var i = list.tail,
                amountParenthesis = 0,
                j, next, previous, lastParenthesis;

            while (i !== null) {
                switch (i.type) {
                    case 'closingParenthesis':
                        if (amountParenthesis === 0) {
                            lastParenthesis = i;
                            next = i.next;
                        }
                        amountParenthesis++;
                        break;
                    case 'openingParenthesis':
                        amountParenthesis--;
                        if (amountParenthesis < 0) {
                            throw {code: config.error.PARENTHESIS};
                        } else if (amountParenthesis === 0) {
                            previous = i.previous;
                            lastParenthesis.previous.next = null;
                            i.next.previous = null;
                            i = tree({head: i.next, tail: lastParenthesis.previous});
                            if (previous === null) {
                                list.head = i;
                            } else {
                                previous.next = i;
                                i.previous = previous;
                            }
                            if (next === null) {
                                list.tail = i;
                            } else {
                                next.previous = i;
                                i.next = next;
                            }
                        }
                        break;
                    default:
                        if (amountParenthesis === 0) {
                            switch (i.type) {
                                case 'variable':
                                    i.variables = [i.value];
                                    break;
                                case 'number':
                                    i.variables = [];
                                    break;
                                case 'function':
                                    i.func = functions[i.value];
                                    i.child = i.next;
                                    i.child.parent = i;
                                    if (i.next.next === null) {
                                        i.next = null;
                                        list.tail = i;
                                    } else {
                                        i.next = i.next.next;
                                        i.next.previous = i;
                                    }
                                    delete i.child.next;
                                    delete i.child.previous;
                                    i.variables = i.child.variables;
                                    break;
                                case 'operator':
                                    if (i.value === '-' && (i.previous === null || i.previous.type === 'operator')) {
                                        i.child = i.next;
                                        i.child.parent = i;
                                        i.next = i.next.next;
                                        if (i.next === null) {
                                            list.tail = i;
                                        } else {
                                            i.next.previous = i;
                                        }
                                        delete i.child.next;
                                        delete i.child.previous;
                                        i.type = 'function';
                                        i.func = function (x) {
                                            return -x;
                                        };
                                        i.value = '-';
                                        i.variables = i.child.variables;
                                    }
                                    break;
                            }
                        }
                        break;
                }
                i = i.previous;
            }

            for (j = operatorsSortByPriority.max; j >= operatorsSortByPriority.min; j--) {
                if (typeof operatorsSortByPriority[j] !== 'undefined') {
                    i = operatorsSortByPriority[j].associative === config.associative.LEFT ? list.head : list.tail;
                    while (i !== null) {
                        if (i.type === 'operator' && typeof operatorsSortByPriority[j].arr[i.value] !== 'undefined'
                            && i.next !== null && i.next.type !== 'oprerator'
                            && i.previous !== null && i.previous.type !== 'oprerator') {
                            i.func = operators[i.value].func
                            i.left = i.previous;
                            i.right = i.next;
                            if (i.previous.previous !== null) {
                                i.previous.previous.next = i;
                            } else {
                                list.head = i;
                            }
                            if (i.next.next !== null) {
                                i.next.next.previous = i;
                            } else {
                                list.tail = i;
                            }
                            i.next = i.next.next;
                            i.previous = i.previous.previous;
                            i.left.parent = i.right.parent = i;
                            i.variables = [];
                            i.variables = i.variables.concat(i.left.variables);
                            i.variables = i.variables.concat(i.right.variables);
                            i.variables = removeDuplicates(i.variables);
                            i.type = 'tree';
                            delete i.left.next;
                            delete i.left.previous;
                            delete i.right.next;
                            delete i.right.previous;
                        }
                        if (operatorsSortByPriority[j].associative === config.associative.LEFT) {
                            i = i.next
                        } else if (operatorsSortByPriority[j].associative === config.associative.RIGHT) {
                            i = i.previous
                        }
                    }
                }
            }
            if (list.head !== list.tail) {
                throw {code: config.error.OTHER};
            }
            return list.head;
        };

        getFunction = function (tree) {
            var a, b, c;
            if (tree.type === "number") {
                return function (variables) {
                    return tree.value;
                };
            }
            if (tree.type === "variable") {
                return function (variables) {
                    return variables[tree.value];
                };
            }
            if (tree.type === "tree") {
                a = getFunction(tree.left);
                b = getFunction(tree.right);
                if (tree.variables.length === 0) {
                    c = tree.func(a({}), b({}));
                    return function (variables) {
                        return c;
                    };
                } else return function (variables) {
                    return tree.func(a(variables), b(variables));
                };
            }
            if (tree.type === 'function') {
                return function (variables) {
                    return tree.func(getFunction(tree.child)(variables));
                }
            }
        };

        return {
            parse: function (str) {
                var tokens = tokenizer(str),
                    tr = tree(tokens),
                    func = getFunction(tr);
                return {
                    __root: tr,
                    get func() {
                        return func;
                    },
                    get variables() {
                        return tr.variables;
                    }
                };
            }

        }
    });