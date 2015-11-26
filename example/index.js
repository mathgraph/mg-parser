require.config({
    baseUrl: '../src',
    packages: [
        {
            name: 'mg-parser',
            location: './mg-parser'
            //main: 'sheet/sheet.full'
        }
    ]
});

require(
    ['mg-parser/parser'],
    function (parser) {
        var treeToString, p;

        treeToString = function (tree) {
            switch (tree.type) {
                case 'tree':
                    return "(" + treeToString(tree.left) + tree.value + treeToString(tree.right) + ")";
                case 'function':
                    return tree.value + "(" + treeToString(tree.child) + ")";
                default:
                    return tree.value;
            }
        };


        document.getElementById('go').addEventListener("click", function (e) {
            p = parser.parse(document.getElementById('str').value);
            document.getElementById('tree').innerText = treeToString(p.__root);
            document.getElementById('variables').innerText = '';
            p.variables.forEach(function (i) {
                document.getElementById('variables').innerHTML += '<p> ' + i +
                    '<input type="number" id = "' + i + '"> </p>';
            });
        });

        document.getElementById('calculate').addEventListener("click", function (e) {
            var o = {};
            p.variables.forEach(function (i) {
                o[i] = parseFloat(document.getElementById(i).value);
            });
            document.getElementById('result').innerHTML = p.func(o);
        });

        p = parser.parse('(sin x + 2) / 1 * 3 - 2');
        //p = parser.parse('1+ x');
        console.log(treeToString(p.__root))
        console.log(p.func({x: Math.PI/2}));


        return {};
    }
);


