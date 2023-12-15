import heapq

def dijkstra(graph, start, end):
    heap = [(0, start, [start])]
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    while heap:
        (dist, current, path) = heapq.heappop(heap)
        if current == end:
            return distances[end], path
        for neighbor, weight in graph[current].items():
            old_distance = distances[neighbor]
            new_distance = dist + weight
            if new_distance < old_distance:
                distances[neighbor] = new_distance
                new_path = path + [neighbor]
                heapq.heappush(heap, (new_distance, neighbor, new_path))
    return None