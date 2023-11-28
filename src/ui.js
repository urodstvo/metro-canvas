export class UI {
  static createElement(tagName, properties = {}) {
    const element = document.createElement(tagName);
    const { class: className, id, style, text } = properties;
    element.className = className ? className.join(" ") : "";
    element.id = id ? id : "";
    element.style = style ? style : "";
    element.textContent = text ? text : "";

    return element;
  }

  static getElement(selector) {
    return document.querySelector(selector);
  }

  static append(parent, childs) {
    for (let child in childs) parent.appendChild(childs[child]);
  }
}
