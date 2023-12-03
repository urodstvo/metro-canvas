import { calculateAttractivenessScore } from "./algorithms";

export class Node {
  radius = 12;
  label_direction = "up";
  active = false;
  color = "0, 0, 0";

  constructor(node) {
    Object.assign(this, node);
    this.active = false;
    this.path = -100;
    this.colorize();
  }

  colorize() {
    if (this.score) {
      this.color = `0, ${Math.round(226 - 192 / this.score)}, 0`;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = `rgba(${this.color}, 1)`;

    if (this.active) {
      ctx.fillStyle = `rgba(${this.color}, 0.5)`;
      ctx.setLineDash([5, 5]);
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.75, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();

    this.#drawLabel(ctx);
  }

  #drawLabel(ctx) {
    const label_direction = this.label_direction;
    switch (label_direction) {
      case "up": {
        ctx.save();
        const translateX = this.x;
        const translateY = this.y;

        ctx.translate(translateX, translateY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(this.label, 2 * this.radius, 4);

        ctx.restore();
        // ctx.rotate(Math.PI / 2);
        // ctx.translate(-translateX, -translateY);
        break;
      }
      case "right": {
        ctx.fillText(this.label, this.x + 2 * this.radius, this.y + 2);
        break;
      }
      case "down": {
        const textX = this.x - this.label.toString().length * 3;
        const textY = this.y + 2 * this.radius;
        ctx.fillText(this.label, textX, textY);
        break;
      }
      case "left": {
        const textX =
          this.x - this.label.toString().length * 4 - 2 * this.radius;
        const textY = this.y + 2;
        ctx.fillText(this.label, textX, textY);
        break;
      }
    }
  }

  isHovered(mouse) {
    return (
      (mouse.x - this.x) ** 2 + (mouse.y - this.y) ** 2 <= this.radius ** 2
    );
  }
}

class Edge {
  color = "0, 0, 0";
  constructor(from, to, distance, isOneWay) {
    this.from = from;
    this.to = to;
    this.distance = distance;
    this.isOneWay = isOneWay;
    if (from.path === to.path - 1) this.color = from.color;
    this.#findAngle();
  }

  #findAngle() {
    const x_diff = this.to.x - this.from.x;
    const y_diff = this.to.y - this.from.y;
    if (x_diff === 0 && y_diff === 0) {
      this.angle = 0;
      return;
    }

    let angle;
    if (x_diff === 0)
      angle = y_diff / Math.abs(y_diff) > 0 ? Math.PI / 2 : -Math.PI / 2;
    else if (y_diff === 0) angle = x_diff / Math.abs(x_diff) > 0 ? 0 : Math.PI;
    else {
      angle = Math.abs(Math.atan(y_diff / x_diff));
      if (x_diff > 0 && y_diff < 0) angle = -angle;
      if (x_diff < 0 && y_diff > 0) angle = Math.PI - angle;
      if (x_diff < 0 && y_diff < 0) angle = -Math.PI + angle;
    }

    this.angle = angle;
  }

  #drawArrow(ctx) {
    ctx.fillStyle = `rgb(${this.color})`;

    const x_diff = this.to.x - this.from.x;
    const y_diff = this.to.y - this.from.y;
    if (x_diff === 0 && y_diff === 0) return;

    const center = Math.sqrt(x_diff ** 2 + y_diff ** 2) / 2;
    const coef = Math.abs(this.angle) > Math.PI ? -1 : 1;

    ctx.beginPath();

    ctx.moveTo(center, 0);
    ctx.lineTo(center - 8 * coef, 4);
    ctx.lineTo(center - 8 * coef, -4);
    ctx.lineTo(center, 0);
    ctx.fill();

    ctx.closePath();
  }

  #drawLabel(ctx) {
    const x_diff = this.to.x - this.from.x;
    const y_diff = this.to.y - this.from.y;
    if (x_diff === 0 && y_diff === 0) return;

    const center = Math.sqrt(x_diff ** 2 + y_diff ** 2) / 2;
    ctx.save();
    if (Math.abs(this.angle) > Math.PI / 2) {
      ctx.translate(center + 8, 14);
      ctx.rotate(Math.PI);
      ctx.fillText(this.distance, 0, 0);
    } else ctx.fillText(this.distance, center - 10, -14);
    ctx.restore();
  }

  draw(ctx, isLabelDrawing) {
    ctx.save();

    ctx.strokeStyle = `rgb(${this.color})`;

    ctx.beginPath();
    ctx.moveTo(this.from.x, this.from.y);
    ctx.lineTo(this.to.x, this.to.y);
    ctx.stroke();

    ctx.translate(this.from.x, this.from.y);

    ctx.rotate(this.angle);

    if (isLabelDrawing) this.#drawLabel(ctx);
    if (this.isOneWay) this.#drawArrow(ctx);

    ctx.restore();
  }
}

export class Canvas {
  isLabelDrawing = true;
  nodes = [];
  edges = [];
  constructor(canvas = document.getElementById("canvas"), cfg) {
    if (cfg) {
      Object.assign(this, cfg);
      this.nodes = this.nodes.map((node) => new Node(node));
    }
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.#prepare();
  }

  get config() {
    const cfg = {};
    Object.assign(cfg, this);

    return cfg;
  }

  #prepare() {
    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth * 0.95;
      this.canvas.height = window.innerHeight * 0.95;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      const mouse = {
        x: e.pageX - canvasRect.left,
        y: e.pageY - canvasRect.top,
      };

      let isHoveredArray = this.nodes.map((node) => node.isHovered(mouse));
      !isHoveredArray.every((isHover) => isHover === false)
        ? canvas.classList.add("hover")
        : canvas.classList.remove("hover");

      this.nodes.forEach((node) => {
        if (node.active) {
          node.x = mouse.x - node.offset.x;
          node.y = mouse.y - node.offset.y;
        }
      });
    });

    this.canvas.addEventListener("mousedown", (e) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      const mouse = {
        x: e.pageX - canvasRect.left,
        y: e.pageY - canvasRect.top,
      };

      this.nodes.forEach((node) => {
        if (node.isHovered(mouse)) {
          node.active = true;
          node.offset = {
            x: mouse.x - node.x,
            y: mouse.y - node.y,
          };
        } else node.active = false;
      });
    });

    this.canvas.addEventListener("mouseup", () => {
      this.nodes.forEach((node) => (node.active = false));
      this.nodes = calculateAttractivenessScore(this.nodes);
    });

    this.canvas.addEventListener("touchmove", (e) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      const touch = {
        x: e.pageX - canvasRect.left,
        y: e.pageY - canvasRect.top,
      };

      let isHoveredArray = this.nodes.map((node) => node.isHovered(touch));
      !isHoveredArray.every((isHover) => isHover === false)
        ? canvas.classList.add("hover")
        : canvas.classList.remove("hover");

      this.nodes.forEach((node) => {
        if (node.active) {
          node.x = touch.x - node.offset.x;
          node.y = touch.y - node.offset.y;
        }
      });
    });

    this.canvas.addEventListener("touchstart", (e) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      const touch = {
        x: e.pageX - canvasRect.left,
        y: e.pageY - canvasRect.top,
      };

      this.nodes.forEach((node) => {
        if (node.isHovered(touch)) {
          node.active = true;
          node.offset = {
            x: touch.x - node.x,
            y: touch.y - node.y,
          };
        } else node.active = false;
      });
    });

    this.canvas.addEventListener("touchend", () => {
      this.nodes.forEach((node) => (node.active = false));
      this.nodes = calculateAttractivenessScore(this.nodes);
    });
  }

  #getPerformedEdges() {
    const total = this.nodes.length;

    const edges = [];
    for (let row = 0; row < total - 1; row++) {
      for (let col = row + 1; col < total; col++) {
        if (this.edges[row][col] === this.edges[col][row]) {
          if (this.edges[row][col] > 0) {
            const from = this.nodes[row];
            const to = this.nodes[col];
            const distance = this.edges[row][col];

            edges.push(new Edge(from, to, distance, false));
          }
        } else {
          let from, to, distance;

          if (this.edges[row][col] > this.edges[col][row]) {
            from = this.nodes[row];
            to = this.nodes[col];
            distance = this.edges[row][col];
          } else {
            from = this.nodes[col];
            to = this.nodes[row];
            distance = this.edges[col][row];
          }

          edges.push(new Edge(from, to, distance, true));
        }
      }
    }

    return edges;
  }

  #findFreeXY() {
    let freeX, freeY;

    while (!freeX || !freeY) {
      const randomX = Math.floor(Math.random() * 300);
      const randomY = Math.floor(Math.random() * 300);

      const isOccupied = this.nodes.some((node) =>
        node.isHovered({ x: randomX, y: randomY })
      );
      if (!isOccupied) {
        freeX = randomX;
        freeY = randomY;
      }
    }
    return { freeX, freeY };
  }

  addNode(node) {
    const { freeX, freeY } = this.#findFreeXY();
    node.x = freeX;
    node.y = freeY;

    this.nodes.push(node);
    this.nodes = calculateAttractivenessScore(this.nodes);
    this.nodes.forEach((node) => {
      node.colorize();
    });

    if (this.edges) this.edges.forEach((edge) => edge.push(0));
    this.edges.push(new Array(this.nodes.length).fill(0));
  }

  deleteNode(id) {
    this.nodes = this.nodes.filter((node) => node.id !== id);
    this.nodes.map((node) => {
      if (node.id > id) node.id--;
    });

    this.nodes = calculateAttractivenessScore(this.nodes);
    this.nodes.forEach((node) => {
      node.colorize();
    });

    this.edges = this.edges.filter((_, ind) => ind !== id);
    this.edges = this.edges.map((edge) => edge.filter((_, ind) => ind !== id));
  }

  clearPath() {
    this.nodes.forEach((node) => node.colorize());
    this.nodes.forEach((node) => (node.path = -100));
    this.edges.forEach((edge) => (edge.color = "0, 0, 0"));
  }

  visualize(path) {
    this.clearPath();
    let ind = 0;

    const interval = setInterval(() => {
      this.nodes[path[ind]].color = "255, 0, 0";
      this.nodes[path[ind]].path = ind;
      ind++;

      if (path.length === ind) clearInterval(interval);
    }, 600);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const edges = this.#getPerformedEdges();
    edges.forEach((edge) => edge.draw(this.ctx, this.isLabelDrawing));

    this.nodes.forEach((node) => node.draw(this.ctx));
  }
}
