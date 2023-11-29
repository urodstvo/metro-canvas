export function Dijkstra(matrix, startNodeID, endNodeID) {
  const queue = [startNodeID];
  const visited = new Set();
  const numNodes = matrix.length;
  const shortestDistances = {};
  const prevNode = {};

  // Инициализация начальных значений
  for (let nodeID = 0; nodeID < numNodes; nodeID++) {
    shortestDistances[nodeID] = Infinity;
    prevNode[nodeID] = null;
  }
  shortestDistances[startNodeID] = 0;

  while (queue.length > 0) {
    // Находим узел с минимальной дистанцией
    const currentNode = queue.reduce((minNode, nodeID) => {
      return shortestDistances[nodeID] < shortestDistances[minNode]
        ? nodeID
        : minNode;
    }, queue[0]);

    // Удаляем текущий узел из очереди
    queue.splice(queue.indexOf(currentNode), 1);

    // Помечаем текущий узел как посещенный
    visited.add(currentNode);

    // Итерируемся по соседям текущего узла
    for (let neighborID = 0; neighborID < numNodes; neighborID++) {
      const distance = matrix[currentNode][neighborID];

      if (distance === 0 || visited.has(neighborID)) {
        continue;
      }

      // Вычисляем новую дистанцию
      const newDistance = shortestDistances[currentNode] + distance;

      if (newDistance < shortestDistances[neighborID]) {
        // Обновляем кратчайшее расстояние и предыдущий узел
        shortestDistances[neighborID] = newDistance;
        prevNode[neighborID] = currentNode;
      }

      if (!queue.includes(neighborID)) {
        // Добавляем соседа в очередь, если он еще не посещен
        queue.push(neighborID);
      }
    }
  }

  // Восстановление кратчайшего пути
  const path = [];
  let currentNode = endNodeID;
  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = prevNode[currentNode];
  }

  return {
    path: path,
    distance: shortestDistances[endNodeID],
  };
}
