define(['mg-parser/tokenizer', 'mg-parser/functions', 'mg-parser/operators'],
    function (tokenizer, functions, operators) {
        var i, tree, getFunction, operatorsSortByPriority, removeDuplicates;
        operatorsSortByPriority = [];

        for (i in operators) {
            var priority = operators[i].priority;
            var associative = operators[i].associative;
            operators[i].string = i;
            if (typeof operatorsSortByPriority[priority] === 'undefined') {
                operatorsSortByPriority[priority] = {associative: associative, arr: {}};
            }
            if (operatorsSortByPriority[priority].associative !== associative) throw type + " undefined";
            operatorsSortByPriority[priority].arr[i] = operators[i];
        }

        removeDuplicates = function (arr) {
            var result = [];
            arr.forEach(function(item) {
                if(result.indexOf(item) < 0) {
                    result.push(item);
                }
            });
            return result;
        }

        tree = function (list) {
            var i, j, a, n, p, amountParenthesis, func;
            i = list.head;
            a = null;
            amountParenthesis = 0;
            while (i !== null) {
                if (i.type === 'openingParenthesis') {
                    if (amountParenthesis === 0)
                        a = i;
                    amountParenthesis++;
                }
                if (i.type === 'closingParenthesis') {
                    amountParenthesis--;
                    if (amountParenthesis < 0) throw "error input: Parenthesis!";
                    if (amountParenthesis === 0) {
                        p = a.previous;
                        n = i.next;
                        a.next.previous = null;
                        i.previous.next = null;
                        i = tree({head: a.next, tail: i.previous});
                        if (p === null) {
                            list.head = i;
                        } else {
                            p.next = i;
                            i.previous = p;
                        }
                        if (n === null) {
                            list.tail = i;
                        } else {
                            n.previous = i;
                            i.next = n;
                        }
                    }
                }
                if (i.type === 'variable') {
                    i.variables = [i.value];
                }
                if (i.type === 'number') {
                    i.variables = [];
                }
                i = i.next;
            }

            i = list.tail;
            while (i !== null) {
                if (i.type === 'function') {
                    i.func = functions[i.value];
                    i.child = i.next;
                    i.child.parent = i;
                    if (i.next.next === null) {
                        i.next = null;
                        list.tail = i;
                    } else {
                        i.next = i.next.next;
                        //console.log(i.next)
                        i.next.previous = i;
                        i.child.next = null;
                        i.child.previous = null;
                    }
                    i.variables = i.child.variables;
                }
                i = i.previous;
            }

            i = list.head;
            while (i !== null) {
                if (i.type === 'operator' && i.value === '-' && (i.previous === null)){
                    i.child = i.next;
                    i.child.parent = i;
                    i.next = i.next.next;
                    if (i.next === null) list.tail = i; else i.next.previous = i;
                    i.child.next = null;
                    i.child.previous = null;
                    i.type = 'function';
                    i.func = function (x) {return -x;};
                    i.value = '-';
                    i.variables = i.child.variables;
                }
                i = i.next;
            }

            i = list.head;
            for (j = 9; j >= 0; j--) {
                if (typeof operatorsSortByPriority[j] !== 'undefined') {
                    i = operatorsSortByPriority[j].associative === 'left' ? list.head : list.tail;
                    while (i !== null) {
                        if (i.type === 'operator' && typeof operatorsSortByPriority[j].arr[i.value] !== 'undefined'
                            && i.next !== null && i.next.type !== 'oprerator'
                            && i.previous !== null && i.previous.type !== 'oprerator') {
                            i.func = operators[i.value].func
                            i.left = i.previous;
                            i.right = i.next;
                            if (i.previous.previous !== null) i.previous.previous.next = i; else list.head = i;
                            if (i.next.next !== null) i.next.next.previous = i; else list.tail = i;
                            i.next = i.next.next;
                            i.previous = i.previous.previous;
                            i.left.parent = i.right.parent = i;
                            i.variables = [];
                            i.variables = i.variables.concat(i.left.variables);
                            i.variables = i.variables.concat(i.right.variables);
                            i.variables = removeDuplicates(i.variables);
                            i.type = 'tree';
                        }
                        i = operatorsSortByPriority[j].associative === 'left' ? i.next : i.previous;
                    }
                }
            }
            if (list.head !== list.tail) throw "error input!!";
            return list.head;
        };

        getFunction = function (tree) {
            var a, b, c;
            if (tree.type === "number") return function (variables) {
                return tree.value;
            };
            if (tree.type === "variable") return function (variables) {
                return variables[tree.value];
            };
            if (tree.type === "tree") {
                a = getFunction(tree.left);
                b = getFunction(tree.right);
                if (tree.variables.length === 0) {
                    c = tree.func(a({}), b({}));
                    return function (variables) {
                        return c;
                    };
                }
                else return function (variables) {
                    return tree.func(a(variables), b(variables));
                };
            }
            if (tree.type === 'function') {
                return function (variables) {
                    return tree.func(getFunction(tree.child)(variables));
                }
            }
            throw "ERROR" + tree.type;
        };

        return function (str) {
            var tokens, tr, func;
            tokens = tokenizer(str);
            tr = tree(tokens);
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
        };
    }
);