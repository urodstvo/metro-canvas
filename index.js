import "./style.css";
import { UI } from "./src/ui";
import { Graph } from "./src/canvas";
import { Dijkstra } from "./src/algorithms";

let doubleDirs = localStorage.getItem("doubleDirs")
  ? localStorage.getItem("doubleDirs") === "true"
  : true;
const graph = new Graph();

const root = UI.getElement("#root");
const wrapper = UI.createElement("div", { class: ["wrapper"] });
const $config = UI.createElement("div", { class: ["config-container"] });
const config_content = UI.createElement("div", { class: ["config-content"] });
const cfg_title = UI.createElement("h3", { text: "Config" });
const $nodes = UI.createElement("fieldset", { class: ["nodes"] });
const $nodes_legend = UI.createElement("legend", { text: "nodes" });
const nodes_list = UI.createElement("div", { class: ["nodes-list"] });
const node_input_container = UI.createElement("div", {
  class: ["node-input-container"],
});
const node_input = UI.createElement("div", { class: ["node-input"] });
const node_x_input = UI.createElement("input", { id: "node-x" });
const node_y_input = UI.createElement("input", { id: "node-y" });
const node_label_input = UI.createElement("input", { id: "node-label" });
// const node_input_wrapper = UI.createElement("div");
node_x_input.placeholder = "x";
node_x_input.type = "number";
node_y_input.placeholder = "y";
node_y_input.type = "number";
node_label_input.placeholder = "label";
node_label_input.type = "text";
const add_node_button = UI.createElement("button", {
  id: "add-node",
  text: "+ add node",
});
const delete_node_button = UI.createElement("button", {
  id: "delete-node",
  text: "delete",
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
  text: "draw path",
});
const save_button = UI.createElement("button", {
  id: "save",
  text: "save",
});

const $canvas = UI.createElement("div", { class: ["canvas-container"] });
const canvas = UI.createElement("canvas", { id: "canvas" });
canvas.width = 1000;
canvas.height = 500;

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
const open_modal_button = UI.createElement("button", {
  id: "open-modal",
  text: "Edit edges",
});

UI.append(root, [wrapper, modal]);
UI.append(wrapper, [$config, $canvas]);
UI.append($config, [config_content, save_button]);
UI.append(config_content, [cfg_title, $nodes, open_modal_button, $path]);
UI.append($nodes, [$nodes_legend, nodes_list, node_input_container]);
UI.append(node_input_container, [node_input, add_node_button]);
UI.append(node_input, [node_x_input, node_y_input, node_label_input]);
UI.append($path, [$path_legend, path_log, path_input, draw_path_button]);
UI.append(path_input, [path_from, path_to]);
UI.append($canvas, [canvas]);
UI.append(modal, [modal_content]);
UI.append(modal_content, [table, close_modal_button, switch_dirs]);
UI.append(table, [table_header, table_body]);

const nodes_list_header = UI.createElement("div", {
  class: ["nodes-list-header"],
});
const nodes_list_header_id = UI.createElement("span", { text: "id" });
const nodes_list_header_x = UI.createElement("span", { text: "x" });
const nodes_list_header_y = UI.createElement("span", { text: "y" });
const nodes_list_header_label = UI.createElement("span", { text: "label" });

UI.append(nodes_list_header, [
  nodes_list_header_id,
  nodes_list_header_x,
  nodes_list_header_y,
  nodes_list_header_label,
]);

function addNodeToUI(node) {
  const { id, x, y, label, label_direction } = node;

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
  const node_x = UI.createElement("span", { text: x.toString() });
  const node_y = UI.createElement("span", { text: y.toString() });
  const node_label = UI.createElement("span", {
    text: [arrow, label].join(" "),
    style: "cursor: pointer;",
  });
  const delete_button = UI.createElement("button", { text: "delete" });
  delete_button.onclick = () => {
    graph.deleteNode(id);
    buildEdgesTable();
    addAllNodesToUI(graph.nodes);
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

    graph.draw();
  };

  UI.append(node_item, [node_data, delete_button]);
  UI.append(node_data, [node_id, node_x, node_y, node_label]);

  UI.append(nodes_list, [node_item]);
}

function addAllNodesToUI(nodes) {
  nodes_list.innerHTML = "";

  UI.append(nodes_list, [nodes_list_header]);

  nodes.forEach((node) => {
    addNodeToUI(node);
  });
}

function buildEdgesTable() {
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
          buildEdgesTable();
          graph.draw();
        };
        UI.append(cell, [input]);
      } else cell = UI.createElement("th", { text: i.toString() });

      UI.append(row, [cell]);
    }
    UI.append(table_body, [row]);
  }
}

function saveConfig() {
  localStorage.setItem("cfg", graph.config);
}

function loadConfig() {
  if (localStorage.getItem("cfg")) {
    graph.config = localStorage.getItem("cfg");
    graph.initCanvas(canvas);
    graph.draw();
    buildEdgesTable();
    addAllNodesToUI(graph.nodes);

    return true;
  }

  return false;
}

add_node_button.onclick = () => {
  if (node_x_input.value === "" || node_y_input.value === "") return;
  const node = {
    id: graph.nodes.length,
    x: parseInt(node_x_input.value),
    y: parseInt(node_y_input.value),
    label: !!node_label_input.value
      ? node_label_input.value
      : graph.nodes.length.toString(),
    label_direction: "up",
  };
  graph.addNode(node);
  addAllNodesToUI(graph.nodes);
  buildEdgesTable();
};

open_modal_button.onclick = () => {
  modal.showModal();
};

close_modal_button.onclick = () => {
  modal.close();
};

save_button.onclick = saveConfig;

draw_path_button.onclick = () => {
  if (path_from.value === "" || path_to.value === "") return;
  const from = parseInt(path_from.value);
  const to = parseInt(path_to.value);

  if (from < 0 || from >= graph.nodes.length) return;
  if (to < 0 || to >= graph.nodes.length) return;

  const { path, distance } = Dijkstra(graph.edges, from, to);
  path_log.textContent = `Path: ${path.join(" → ")} Distance: ${distance}`;
  graph.drawPath(path);
};

!loadConfig() && graph.initCanvas(canvas);
