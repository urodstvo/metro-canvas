import "./style.css";
import { UI } from "./src/ui";
import { Canvas, Node } from "./src/canvas";
import { Dijkstra, findMaxAttractivePath } from "./src/algorithms";

let doubleDirs;
if (localStorage.getItem("doubleDirs"))
  doubleDirs = localStorage.getItem("doubleDirs") === "true";
else doubleDirs = true;

const root = UI.getElement("#root");
const wrapper = UI.createElement("div", { class: ["wrapper"] });
const $config = UI.createElement("div", { class: ["config-container"] });
const config_content = UI.createElement("div", { class: ["config-content"] });
const cfg_title = UI.createElement("h3", { text: "Config" });
cfg_title.onclick = () => {
  $config.classList.toggle("opened");
  if ($config.getBoundingClientRect().left + 420 > window.innerWidth) {
    $config.style.transition = "left 0.5s ease";
    $config.style.left = window.innerWidth - 420 + "px";
    setTimeout(() => ($config.style.transition = ""), 500);
  }
};

window.addEventListener("resize", () => {
  if (
    $config.getBoundingClientRect().left + $config.offsetWidth >
    window.innerWidth
  ) {
    $config.style.transition = "left 0.5s ease";
    $config.style.left = window.innerWidth - $config.offsetWidth + "px";
    setTimeout(() => ($config.style.transition = ""), 500);
  }
});

$config.draggable = true;
cfg_title.onmousedown = (e) => {
  var coords = getCoords($config);
  var shiftX = e.pageX - coords.left;
  var shiftY = e.pageY - coords.top;

  moveAt(e);

  function moveAt(e) {
    $config.style.left = e.pageX - shiftX + "px";
    $config.style.top = e.pageY - shiftY + "px";

    if (e.pageX - shiftX + $config.offsetWidth > window.innerWidth) {
      $config.style.left = window.innerWidth - $config.offsetWidth + "px";
    }
    if (e.pageY - shiftY + $config.offsetHeight > window.innerHeight) {
      $config.style.top = window.innerHeight - $config.offsetHeight + "px";
    }

    if (e.pageX - shiftX < 0) {
      $config.style.left = 0 + "px";
    }
    if (e.pageY - shiftY < 0) {
      $config.style.top = 0 + "px";
    }

    localStorage.setItem(
      "cfg_pos",
      JSON.stringify({ left: $config.style.left, top: $config.style.top })
    );
  }

  document.onmousemove = function (e) {
    cfg_title.style = "pointer-events: none;";
    moveAt(e);
  };

  $config.onmouseup = function () {
    document.onmousemove = null;
    $config.onmouseup = null;
    cfg_title.style = "pointer-events: all;";
  };
};

$config.ondragstart = function () {
  return false;
};

function getCoords(elem) {
  var box = elem.getBoundingClientRect();
  return {
    top: box.top + scrollY,
    left: box.left + scrollX,
  };
}

const $nodes = UI.createElement("fieldset", { class: ["nodes"] });
const $nodes_legend = UI.createElement("legend", { text: "nodes" });
const nodes_list = UI.createElement("div", { class: ["nodes-list"] });
const node_input_container = UI.createElement("div", {
  class: ["node-input-container"],
});
const node_input = UI.createElement("div", { class: ["node-input"] });
const node_label_input = UI.createElement("input", { id: "node-label" });
node_label_input.placeholder = "label";
node_label_input.type = "text";
const add_node_button = UI.createElement("button", {
  id: "add-node",
  text: "+ add node",
});

const $path = UI.createElement("fieldset", { class: ["path"] });
const $path_legend = UI.createElement("legend", { text: "path" });
const path_log = UI.createElement("div", { class: ["path-log"] });
const path_input = UI.createElement("div", { class: ["path-input"] });
const path_from = UI.createElement("input", { id: "path-from" });
const path_to = UI.createElement("input", { id: "path-to" });
path_from.type = "number";
path_from.placeholder = "from (id)";

path_to.type = "number";
path_to.placeholder = "to (id)";
const draw_path_button = UI.createElement("button", {
  id: "draw-path",
  text: "draw shortest path",
});
const draw_attractive_button = UI.createElement("button", {
  id: "draw-attractive",
  text: "draw attractive path",
});
const save_button = UI.createElement("button", {
  id: "save",
  text: "Save Config",
});

save_button.onclick = () => {
  localStorage.setItem("cfg", JSON.stringify(graph.config));
};

const $canvas = UI.createElement("div", { class: ["canvas-container"] });
const canvas = UI.createElement("canvas", { id: "canvas" });

canvas.width = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.95;

const modal = UI.createElement("dialog", { class: ["modal"] });
const modal_content = UI.createElement("div", { class: ["modal-content"] });
const table = UI.createElement("table", { id: "edges" });
const table_header = UI.createElement("thead");
const table_body = UI.createElement("tbody");
const switch_dirs = UI.createElement("input", { id: "switch" });
switch_dirs.type = "checkbox";
switch_dirs.checked = doubleDirs;
switch_dirs.onchange = () => {
  localStorage.setItem("doubleDirs", switch_dirs.checked);
  doubleDirs = switch_dirs.checked;
};

const close_modal_button = UI.createElement("button", {
  id: "close-modal",
  text: "close",
});

close_modal_button.onclick = () => {
  modal.close();
};

const open_modal_button = UI.createElement("button", {
  id: "open-modal",
  text: "Transition Matrix",
});

open_modal_button.onclick = () => {
  modal.showModal();
};

UI.append(root, [wrapper, modal]);
UI.append(wrapper, [$config, $canvas]);
UI.append($config, [config_content, save_button]);
UI.append(config_content, [cfg_title, $nodes, open_modal_button, $path]);
UI.append($nodes, [$nodes_legend, nodes_list, node_input_container]);
UI.append(node_input_container, [node_input, add_node_button]);
UI.append(node_input, [node_label_input]);
UI.append($path, [
  $path_legend,
  path_log,
  path_input,
  draw_path_button,
  draw_attractive_button,
]);
UI.append(path_input, [path_from, path_to]);
UI.append($canvas, [canvas]);
UI.append(modal, [modal_content]);
UI.append(modal_content, [table, close_modal_button, switch_dirs]);
UI.append(table, [table_header, table_body]);

const nodes_list_header = UI.createElement("div", {
  class: ["nodes-list-header"],
});
const nodes_list_header_id = UI.createElement("span", { text: "id" });
const nodes_list_header_label = UI.createElement("span", { text: "label" });
const nodes_list_header_score = UI.createElement("span", { text: "score" });

UI.append(nodes_list_header, [
  nodes_list_header_id,
  nodes_list_header_label,
  nodes_list_header_score,
]);

function addToUI(node) {
  const { id, label, label_direction, score } = node;

  let arrow;
  switch (label_direction) {
    case "up":
      arrow = "↑";
      break;
    case "right":
      arrow = "→";
      break;
    case "down":
      arrow = "↓";
      break;
    case "left":
      arrow = "←";
      break;
  }

  const node_item = UI.createElement("div", { class: ["node-item"] });
  const node_data = UI.createElement("div", { class: ["node-data"] });
  const node_id = UI.createElement("span", { text: id.toString() });
  const node_score = UI.createElement("span", {
    text: score ? score.toString() : "",
  });
  const node_label = UI.createElement("span", {
    text: [arrow, label].join(" "),
    style: "cursor: pointer;",
  });

  const delete_button = UI.createElement("button", { text: "delete" });
  delete_button.onclick = () => {
    graph.deleteNode(id);
    updateUI(graph.nodes);
  };

  node_label.onclick = () => {
    switch (graph.nodes[id].label_direction) {
      case "up":
        node.label_direction = "right";
        node_label.textContent = ["→", label].join(" ");
        break;
      case "right":
        node.label_direction = "down";
        node_label.textContent = ["↓", label].join(" ");
        break;
      case "down":
        node.label_direction = "left";
        node_label.textContent = ["←", label].join(" ");
        break;
      case "left":
        node.label_direction = "up";
        node_label.textContent = ["↑", label].join(" ");
        break;
    }
  };

  UI.append(node_item, [node_data, delete_button]);
  UI.append(node_data, [node_id, node_label, node_score]);

  UI.append(nodes_list, [node_item]);
}

function updateUI(nodes) {
  nodes_list.innerHTML = "";
  UI.append(nodes_list, [nodes_list_header]);

  nodes.forEach((node) => addToUI(node));
  buildMatrix();
}

function buildMatrix() {
  table_header.innerHTML = "";
  table_body.innerHTML = "";

  const header_row = UI.createElement("tr");
  let columns = [];
  for (let i = 0; i <= graph.edges.length; i++) {
    const column =
      i === 0
        ? UI.createElement("th")
        : UI.createElement("th", { text: (i - 1).toString() });
    columns.push(column);
  }
  UI.append(header_row, columns);
  UI.append(table_header, [header_row]);

  for (let i = 0; i < graph.edges.length; i++) {
    const row = UI.createElement("tr");
    for (let j = 0; j <= graph.edges[i].length; j++) {
      let cell;
      if (j !== 0) {
        cell = UI.createElement("td");
        const input = UI.createElement("input");
        input.type = "number";
        input.value = graph.edges[i][j - 1];
        input.disabled = i === j - 1;
        input.onchange = (e) => {
          graph.edges[i][j - 1] = parseInt(e.target.value);
          if (doubleDirs) graph.edges[j - 1][i] = parseInt(e.target.value);
          else graph.edges[j - 1][i] = 0;
          buildMatrix();
          graph.draw();
        };
        UI.append(cell, [input]);
      } else cell = UI.createElement("th", { text: i.toString() });

      UI.append(row, [cell]);
    }
    UI.append(table_body, [row]);
  }
}

add_node_button.onclick = () => {
  const label = !!node_label_input.value
    ? node_label_input.value
    : graph.nodes.length.toString();

  const node = new Node({ id: graph.nodes.length, x: 50, y: 50, label });

  graph.addNode(node);
  updateUI(graph.nodes);
};

draw_path_button.onclick = () => {
  if (path_from.value === "" || path_to.value === "") return;
  const from = parseInt(path_from.value);
  const to = parseInt(path_to.value);

  if (from < 0 || from >= graph.nodes.length) return;
  if (to < 0 || to >= graph.nodes.length) return;

  const { path, distance } = Dijkstra(graph.edges, from, to);
  if (path.length > 0 && distance !== Infinity) {
    path_log.textContent = `Path: ${path.join(" → ")} Distance: ${distance}`;
    graph.visualize(path);
  } else {
    path_log.textContent = `No Path`;
  }
};

draw_attractive_button.onclick = () => {
  if (path_from.value === "" || path_to.value === "") return;
  const from = parseInt(path_from.value);
  const to = parseInt(path_to.value);

  if (from < 0 || from >= graph.nodes.length) return;
  if (to < 0 || to >= graph.nodes.length) return;

  const { path, maxAttractiveness } = findMaxAttractivePath(
    from,
    to,
    graph.nodes.map((node) => node.score),
    graph.edges
  );

  if (path.length > 0 && maxAttractiveness > 0) {
    path_log.textContent = `Path: ${path.join(
      " → "
    )} Distance: ${maxAttractiveness}`;
    graph.visualize(path);
  } else {
    path_log.textContent = `No Path`;
  }
};

if (localStorage.getItem("cfg_pos")) {
  const { left, top } = JSON.parse(localStorage.getItem("cfg_pos"));
  $config.style.left = left;
  $config.style.top = top;
}

let cfg;
if (localStorage.getItem("cfg")) cfg = JSON.parse(localStorage.getItem("cfg"));

const graph = new Canvas(canvas, cfg);
updateUI(graph.nodes);

const loop = () => {
  graph.draw();
  canvas.onmouseup = () => {
    updateUI(graph.nodes);
  };
  window.requestAnimationFrame(loop);
};

loop();
