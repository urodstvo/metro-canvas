export class Graph {
  __path__color = "red";
  __node_radius = 12;
  __path = new Set();
  __canvas = null;
  __canvas_width = 0;
  __canvas_height = 0;
  auto_draw = true;

  constructor(nodes = [], edges = []) {
    this.__nodes = nodes;
    this.__edges = edges;
  }

  get config() {
    return JSON.stringify(this);
  }

  set config(cfg) {
    const parsed_cfg = JSON.parse(cfg);
    Object.assign(this, parsed_cfg);
    this.__path = new Set();
  }

  get nodes() {
    return this.__nodes;
  }

  get edges() {
    return this.__edges;
  }

  initCanvas(canvas) {
    this.__canvas_width = canvas.width;
    this.__canvas_height = canvas.height;
    this.__canvas = canvas.getContext("2d");
  }

  #drawNode(node) {
    const { id, x, y, label, label_direction } = node;
    if (this.__path.has(id)) this.__canvas.fillStyle = this.__path__color;
    const radius = this.__node_radius;

    const Node = new Path2D();
    Node.arc(x, y, radius, 0, 2 * Math.PI);

    const NodeFill = new Path2D();
    NodeFill.arc(x, y, radius * 0.75, 0, 2 * Math.PI);

    Node.addPath(NodeFill);
    this.__canvas.stroke(Node);
    this.__canvas.fill(NodeFill);

    switch (label_direction) {
      case "up": {
        const translateX = x - label.toString().length * 3;
        const translateY = y - radius * 2;
        this.__canvas.translate(translateX, translateY);
        this.__canvas.rotate(-Math.PI / 2);
        this.__canvas.fillText(label, 0, radius * 2);
        this.__canvas.rotate(Math.PI / 2);
        this.__canvas.translate(-translateX, -translateY);
        break;
      }
      case "right": {
        this.__canvas.fillText(label, x + 2 * radius, y + 2);
        break;
      }
      case "down": {
        this.__canvas.fillText(
          label,
          x - label.toString().length * 3,
          y + 2 * radius
        );
        break;
      }
      case "left": {
        this.__canvas.fillText(
          label,
          x - label.toString().length * 4 - 2 * radius,
          y + 2
        );
        break;
      }
    }

    this.__canvas.fillStyle = "#000";
  }

  #drawEdgesFor(node) {
    this.__edges[node.id].map((distance, ind) => {
      if (!!distance) {
        const x_diff = this.__nodes[ind].x - node.x;
        const y_diff = this.__nodes[ind].y - node.y;
        if (x_diff === 0 && y_diff === 0) return;

        if (this.__path.has(node.id) && this.__path.has(ind)) {
          const arr_path = Array.from(this.__path);

          const ind_path = arr_path.indexOf(ind);
          const node_path = arr_path.indexOf(node.id);

          if (ind_path === node_path + 1 || ind_path === node_path - 1) {
            this.__canvas.strokeStyle = this.__path__color;
            this.__canvas.fillStyle = this.__path__color;
          }
        }

        if (this.__edges[ind][node.id] < this.__edges[node.id][ind]) {
          this.__canvas.translate(node.x, node.y);

          let angle;
          if (x_diff === 0) angle = y_diff / Math.abs(y_diff) > 0 ? 0 : Math.PI;
          else if (y_diff === 0)
            angle = x_diff / Math.abs(x_diff) > 0 ? 0 : Math.PI;
          else {
            angle = Math.abs(Math.atan(y_diff / x_diff));
            if (x_diff > 0 && y_diff < 0) angle = -angle;
            if (x_diff < 0 && y_diff > 0) angle = Math.PI - angle;
            if (x_diff < 0 && y_diff < 0) angle = -Math.PI + angle;
          }

          this.__canvas.rotate(angle);

          const center = Math.sqrt(x_diff ** 2 + y_diff ** 2) / 2;
          const coef = Math.abs(angle) > Math.PI ? -1 : 1;

          const Arrow = new Path2D();
          Arrow.moveTo(center, 0);
          Arrow.lineTo(center - 8 * coef, 4);
          Arrow.lineTo(center - 8 * coef, -4);
          Arrow.lineTo(center, 0);

          this.__canvas.fill(Arrow);
          this.__canvas.rotate(-angle);
          this.__canvas.translate(-node.x, -node.y);
        }

        const Edge = new Path2D();
        Edge.moveTo(node.x, node.y);
        Edge.lineTo(this.__nodes[ind].x, this.__nodes[ind].y);

        this.__canvas.stroke(Edge);
      }

      this.__canvas.strokeStyle = "#000";
      this.__canvas.fillStyle = "#000";
    });
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
    this.__edges.push(new Array(this.__nodes.length).fill(0));

    if (this.auto_draw && this.__canvas) this.draw();
  }

  deleteNode(id) {
    this.__nodes = this.__nodes.filter((node) => node.id !== id);
    this.__nodes.forEach((node) => {
      if (node.id > id) node.id--;
    });

    this.__edges = this.__edges.filter((_, ind) => ind !== id);
    this.__edges = this.__edges.map((edge) =>
      edge.filter((_, ind) => ind !== id)
    );

    if (this.__path.has(id)) this.__path.clear();

    if (this.auto_draw && this.__canvas) this.draw();
  }

  draw() {
    this.__canvas.clearRect(0, 0, this.__canvas_width, this.__canvas_height);

    const elems = [];
    elems.push(
      this.__nodes.filter((node) => !this.__path.has(node.id)),
      this.__nodes.filter((node) => this.__path.has(node.id))
    );

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
