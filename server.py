from flask import Flask, url_for,render_template,request
from utils.dijkstra import dijkstra
from utils.utils import transform, transform_text
from json import loads, dumps
from base64 import b64decode
app = Flask(__name__,
            static_url_path='', 
            static_folder='static')



@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1/solve",methods=['GET'])
def solve():
    args = request.args
    data = args['edges']
    data = loads(data)
    
    start = int(args['start'])
    end = int(args['end'])
    graph = transform(data)
    distance,path = dijkstra(graph,start,end)
    return dumps({"dist": distance, "path": path})

@app.route("/api/v1/solve_text",methods=['GET'])
def solve_text():
    args = request.args
    text = args['text']
    text = b64decode(text).decode()
    start = int(args['start'])
    end = int(args['end'])
    graph = transform_text(text)
    distance,path = dijkstra(graph,start,end)
    return dumps({"dist": distance, "path": path})


if __name__ == '__main__':
   app.run()