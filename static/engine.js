var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var nodes = [];
var edges = [];
var current_id = 0;

function Node(x, y, id) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.id = id;
}

Node.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText(this.id, this.x, this.y);
}

Node.prototype.print = function() {
    console.log(JSON.stringify(this));
}

function Edge(node1, node2, weight) {
    this.node1 = node1;
    this.node2 = node2;
    this.weight = weight;
}

Edge.prototype.draw = function() {
    ctx.beginPath();
    ctx.moveTo(this.node1.x, this.node1.y);
    ctx.lineTo(this.node2.x, this.node2.y);
    ctx.stroke();

    var midX = (this.node1.x + this.node2.x) / 2;
    var midY = (this.node1.y + this.node2.y) / 2;
    ctx.fillText(this.weight, midX, midY);
}

Edge.prototype.edit = function(newWeight) {
    this.weight = newWeight;
    redraw();
}

Edge.prototype.print = function() {
    console.log(JSON.stringify(this));
}


function distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}


canvas.onclick = function(e) {
    var x = e.clientX - canvas.offsetLeft;
    var y = e.clientY - canvas.offsetTop;
    var newNode = new Node(x, y, current_id);
    current_id++;

    nodes.push(newNode);
    
    redraw();
}
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < edges.length; i++) {
        edges[i].draw();
    }
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].draw();
    }
}

canvas.oncontextmenu = function(e) {
    e.preventDefault();
    var x = e.clientX - canvas.offsetLeft;
    var y = e.clientY - canvas.offsetTop;

    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        var dx = edge.node2.x - edge.node1.x;
        var dy = edge.node2.y - edge.node1.y;
        var length = Math.sqrt(dx * dx + dy * dy);
        var distance = Math.abs(dx * (edge.node1.y - y) - dy * (edge.node1.x - x)) / length;
        if (distance < 5) {
            var tmp = window.prompt("Enter weight number: ","1");
            edge.weight = Number(tmp);
            redraw();
            break;
        }
    }
}

var clearButton = document.getElementById('clearButton');
clearButton.addEventListener('click', function() {
    nodes = [];
    edges = [];
    current_id = 0;
    redraw();
});

var connectButton = document.getElementById('connectButton');
connectButton.addEventListener('click', function() {
    if (nodes.length >= 2) {
        var node1_id = Number(window.prompt("Enter first node id: ","0"))
        var node2_id = Number(window.prompt("Enter second node id: ","0"))
        var node1 = nodes[node1_id];
        var node2 = nodes[node2_id];
        var edge = new Edge(node1, node2, 1);
        edges.push(edge);
        redraw();
    }
});

var solveButton = document.getElementById('solveButton');
solveButton.addEventListener('click', async function() {
    let json = JSON.stringify(edges)
    let start = Number(window.prompt("Enter start node id: ","0"))
    let end = Number(window.prompt("Enter end node id: ","0"))
    fetch(`/api/v1/solve?edges=${json}&start=${start}&end=${end}`)
    .then((response) => response.text())
    .then((text) => {
      let result = JSON.parse(text);
      let path = result['path'];

      let i = 0;
      path.forEach(element => {
        //Draw path Nodes
        let node = nodes[element]
        ctx.beginPath();
        ctx.strokeStyle = "Green";
        ctx.lineWidth = 2;
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.stroke();
        //Draw path edges
        if (i != 0){ 
            console.log("G")
            let node2 = nodes[i-1]
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.stroke();
        }

        i++;
      })
    //reset
    ctx.strokeStyle = "Black";
    ctx.lineWidth = 1;
    console.log(result)
    });
})
