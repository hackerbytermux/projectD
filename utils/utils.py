
def transform(data):
    graph = {}
    for edge in data:
        node1 = edge['node1']['id']
        node2 = edge['node2']['id']
        weight = edge['weight']
        if node1 not in graph:
            graph[node1] = {}
        if node2 not in graph:
            graph[node2] = {}
        graph[node1][node2] = weight
        graph[node2][node1] = weight
    return graph

def transform_text(data):
    graph = {}
    for line in data.split('\n'):
        node1, node2, weight = map(int, line.split(','))
        if node1 not in graph:
            graph[node1] = {}
        if node2 not in graph:
            graph[node2] = {}
        graph[node1][node2] = weight
        graph[node2][node1] = weight
    return graph