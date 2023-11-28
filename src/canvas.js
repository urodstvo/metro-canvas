const nodesProxyHandler = {
  get(target, property) {
    if (property === "push") {
      if (edges) edges.forEach((el) => el.push(0));
      edges.push(new Array(nodes.length + 1).fill(0));
      drawEdgesTable();
      return function (...args) {
        args.forEach((item) => target.push(item));
      };
    }

    return target[property];
  },
};

const edgesProxyHandler = {};

const pathProxyHandler = {
  get(target, property, receiver) {
    const value = Reflect.get(target, property, receiver);
    if (property === "add") {
      return function (element) {
        const res = value.call(target, element);
        drawMap();
        return res;
      };
    } else if (property === "delete") {
      return function (element) {
        const res = value.call(target, element);
        drawMap();
        return res;
      };
    } else if (property === "has") {
      return function (element) {
        return value.call(target, element);
      };
    } else if (property === "clear") {
      return function () {
        value.call(target);
      };
    } else if (property === "indexOf") {
      return function (element) {
        return value.call(target, element);
      };
    }
    return value;
  },
};

export class Graph {
  __path__color = "rgba(255, 0, 0, 1)";
  __node_radius = 12;
  __path = new Set();
  __canvas = null;
  __canvas_width = 0;
  __canvas_height = 0;

  constructor(nodes = [], edges = []) {
    this.__nodes = nodes;
    this.__edges = edges;
  }

  get config() {
    return JSON.stringify(this);
  }

  set config(cfg) {
    const parsed_cfg = JSON.parse(cfg);
    for (const key in parsed_cfg) {
      this[key] = cfg[key];
    }
  }

  initCanvas(canvas) {
    this.__canvas_width = canvas.width;
    this.__canvas_height = canvas.height;
    this.__canvas = canvas.getContext("2d");
  }

  #drawNode(node) {
    const { id, x, y, label } = node;
    if (this.__path.has(id)) this.__canvas.fillStyle = this.__path__color;
    const radius = this.__node_radius;

    const Node = new Path2D();
    Node.arc(x, y, radius, 0, 2 * Math.PI);

    const NodeFill = new Path2D();
    NodeFill.arc(x, y, radius * 0.75, 0, 2 * Math.PI);

    Node.addPath(NodeFill);
    this.__canvas.stroke(Node);
    this.__canvas.fill(NodeFill);

    this.__canvas.fillText(
      label,
      x - label.toString().length * 3,
      y + radius * -2
    );

    this.__canvas.fillStyle = "#000";
  }

  #drawEdgesFor(node) {
    const from = node;

    this.__edges[node.id].map((distance, ind) => {
      if (!!distance) {
        if (this.__path.has(node.id) && this.__path.has(ind)) {
          const arr_path = Array.from(this.__path);

          const ind_path = arr_path.indexOf(ind);
          const node_path = arr_path.indexOf(node.id);

          if (ind_path === node_path + 1 || ind_path === node_path - 1)
            this.__canvas.strokeStyle = this.__path__color;
        }

        const Edge = new Path2D();
        E.moveTo(from.x, from.y);
        E.lineTo(this.__nodes[ind].x, thos.__nodes[ind].y);

        this.__canvas.stroke(Edge);
        this.__canvas.strokeStyle = "#000";
      }
    });
  }

  #clearCanvas() {
    this.__canvas.clearRect(0, 0, this.__canvas_width, this.__canvas_height);
  }

  setDistance(from, to, distance) {
    this.__edges[from][to] = distance;
  }

  getDistance(from, to) {
    return this.__edges[from][to];
  }

  addNode(node) {
    this.__nodes.push(node);

    if (this.__edges) this.__edges.forEach((edge) => edge.push(0));
    this.__edges.push(new Array(this.__nodes.length + 1).fill(0));
  }

  deleteNode(id) {
    this.__nodes = this.__nodes.filter((node) => node.id !== id);

    this.__edges = this.__edges.filter((_, ind) => ind !== id);
    this.__edges = this.__edges.map((edge) =>
      edge.filter((_, ind) => ind !== id)
    );
  }

  draw() {
    this.#clearCanvas();

    const elems = [];
    elems
      .push(this.__nodes.filter((node) => !this.__path.has(node.id)))
      .push(this.__nodes.filter((node) => pthis.__path.has(node.id)));

    elems.forEach((nodes) => {
      nodes.forEach((node) => {
        this.__canvas.fillStyle = "#000";
        this.__canvas.strokeStyle = "#000";
        this.#drawEdgesFor(node);
        this.#drawNode(node);
      });
    });
  }

  drawPath(path) {
    this.__path.clear();
    const path_copy = [...path];

    const interval = setInterval(() => {
      const node = path_copy.shift();
      this.__path.add(node);
      this.draw();

      if (path_copy.length === 0) clearInterval(interval);
    }, 600);
  }
}
