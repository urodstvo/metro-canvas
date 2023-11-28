export function findShortestPath(matrix, startNodeID, endNodeID) {
  const queue = [startNodeID];
  const visited = new Set();
  const shortestDistances = new Array(matrix.length).fill(Infinity);
  shortestDistances[startNodeID] = 0;
  const prevNode = new Array(matrix.length).fill(null);

  while (queue.length > 0) {
    const currentNode = queue.shift();

    if (currentNode === endNodeID) {
      break;
    }

    for (let neighbor = 0; neighbor < matrix[currentNode].length; neighbor++) {
      if (matrix[currentNode][neighbor] === 1 && !visited.has(neighbor)) {
        queue.push(neighbor);
        visited.add(neighbor);
        if (shortestDistances[currentNode] + 1 < shortestDistances[neighbor]) {
          shortestDistances[neighbor] = shortestDistances[currentNode] + 1;
          prevNode[neighbor] = currentNode;
        }
      }
    }
  }

  if (prevNode[endNodeID] === null) {
    return {
      path: [],
      distance: Infinity,
    };
  }

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
