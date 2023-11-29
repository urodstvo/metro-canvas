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

export function calculateAttractivenessScore(graph) {
  const centerNodesCount = 5;
  const centerScore = 10;

  // Находим центр графа
  const centerX = graph.reduce((sum, node) => sum + node.x, 0) / graph.length;
  const centerY = graph.reduce((sum, node) => sum + node.y, 0) / graph.length;

  // Сортируем узлы по расстоянию от центра
  const sortedNodes = graph.slice().sort((a, b) => {
    const distanceA = Math.sqrt(
      Math.pow(a.x - centerX, 2) + Math.pow(a.y - centerY, 2)
    );
    const distanceB = Math.sqrt(
      Math.pow(b.x - centerX, 2) + Math.pow(b.y - centerY, 2)
    );
    return distanceA - distanceB;
  });

  // Рассчитываем баллы для центральных узлов
  for (let i = 0; i < centerNodesCount && i < sortedNodes.length; i++) {
    sortedNodes[i].score = centerScore;
  }

  // Рассчитываем баллы для остальных узлов на основе расстояния от центра
  for (let i = centerNodesCount; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];
    const distance = Math.sqrt(
      Math.pow(node.x - centerX, 2) + Math.pow(node.y - centerY, 2)
    );

    // Рассчитываем балл на основе нормализованного расстояния
    const normalizedDistance = Math.min(
      distance / Math.max(centerX, centerY),
      1
    );
    const score = Math.ceil((1 - normalizedDistance) * (centerScore - 1) + 1);

    // Присвоим вычисленный балл исходному узлу в графе
    const originalNode = graph.find((original) => original.id === node.id);
    originalNode.score = score;
  }

  return graph;
}

class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(item, priority) {
    this.queue.push({ item, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.queue.shift().item;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

export function findMaxAttractivePath(
  startNode,
  endNode,
  attractivenessScores,
  graph
) {
  const visited = new Set();
  let maxAttractiveness = 0;
  let maxAttractivenessPath = [];

  function dfs(currentNode, path, currentAttractiveness) {
    visited.add(currentNode);
    path.push(currentNode);

    if (currentNode === endNode) {
      if (currentAttractiveness > maxAttractiveness) {
        maxAttractiveness = currentAttractiveness;
        maxAttractivenessPath = path.slice();
      }
    } else {
      const transitions = graph[currentNode];
      for (
        let neighborNode = 0;
        neighborNode < transitions.length;
        neighborNode++
      ) {
        const transition = transitions[neighborNode];
        if (transition !== 0 && !visited.has(neighborNode)) {
          const neighborAttractiveness = attractivenessScores[neighborNode];
          dfs(
            neighborNode,
            path,
            currentAttractiveness + neighborAttractiveness
          );
        }
      }
    }

    visited.delete(currentNode);
    path.pop();
  }

  dfs(startNode, [], attractivenessScores[startNode]);

  return {
    path: maxAttractivenessPath,
    maxAttractiveness,
    maxAttractivenessNode: attractivenessScores[endNode],
  };
}
