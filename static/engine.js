var canvas = document.getElementById('canvas');
var tracing_text = document.getElementById('trace')
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
    tracing_text.innerText = "Tracing: \n"
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
            let node2 = nodes[i-1]
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.stroke();
            edges.forEach(edge => {
                if (edge.node1.id == node2.id && edge.node2.id == node.id){
                    tracing_text.innerText += `from ${node2.id} -> ${node.id}, weight: ${edge.weight}\n`
                }
            })
            //tracing_text.innerText += `from ${node2.id} -> ${node.id}, weight: ${path['dist']}\n`
        }

        i++;
      })
    //reset
    ctx.strokeStyle = "Black";
    ctx.lineWidth = 1;
    console.log(result)
    });
})


function calculatePosition(base_x, base_y, radius, angle) {
    var x = base_x + radius * Math.cos(angle * Math.PI / 180);
    var y = base_y + radius * Math.sin(angle * Math.PI / 180);
    return {x: x, y: y};
}

function getNodeById(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            return nodes[i];
        }
    }
    return null; // return null if no node with the given id is found
}

function getEdgeByNodeIds(edges, node1Id, node2Id) {
    for (let i = 0; i < edges.length; i++) {
        if ((edges[i].node1.id === node1Id && edges[i].node2.id === node2Id) ||
            (edges[i].node1.id === node2Id && edges[i].node2.id === node1Id)) {
            return edges[i];
        }
    }
    return null; // or throw an error, depending on your needs
}

var solveButton = document.getElementById('text-solve');
solveButton.addEventListener('click', async function() {
    tracing_text.innerText = "Tracing: \n"
    let text = document.getElementById("text-input").value
    text = text.trim()
    //parsing
    let lines = text.split("\n")
    let x = 400;
    let y = 300;
    let angle = 0;
    let angle_add = 360/lines.length
    edges = []
    nodes = []
    lines.forEach(element => {
        let args = element.split(",")
        let id_1 = Number(args[0])
        let id_2 = Number(args[1])
        let node_1 = null
        let node_2 = null
        if (getNodeById(nodes,id_1) == null){
            let pos = calculatePosition(x,y,100,angle);
            node_1 = new Node(pos.x,pos.y,id_1) //20 - radius
            nodes.push(node_1)
            angle += angle_add
        }else{
            node_1 = getNodeById(nodes,id_1);
        }

        if (getNodeById(nodes,id_2) == null){
            let pos = calculatePosition(x,y,100,angle);
            node_2 = new Node(pos.x,pos.y,Number(id_2)) //20 - radius
            nodes.push(node_2)
            angle += angle_add
        }else{
            node_2 = getNodeById(nodes,id_2)
        }

        edge = new Edge(node_1, node_2, Number(args[2]))
        
        edges.push(edge)
        redraw();
    })

    let btext = btoa(text)
    let start = Number(window.prompt("Enter start node id: ","0"))
    let end = Number(window.prompt("Enter end node id: ","0"))
    fetch(`/api/v1/solve_text?text=${btext}&start=${start}&end=${end}`)
    .then((response) => response.text())
    .then((text) => {
      let result = JSON.parse(text);
      let path = result['path'];
      let total = result['dist']
      console.log(edges)
      for(i = 0; i<path.length-1;i++){
        let edge = getEdgeByNodeIds(edges,path[i], path[i+1])
        tracing_text.innerText += `from ${path[i]} -> ${path[i+1]}, with weight: ${edge.weight}\n`
      }
      
      tracing_text.innerText += `Total: ${total}`
    });
})
