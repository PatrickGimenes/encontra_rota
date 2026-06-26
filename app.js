
const edges = [

  // Linha Azul
  { from: "Jardim Sul", to: "Vila Nova", weight: 2, line: "azul" },
  { from: "Vila Nova", to: "Parque Central", weight: 2, line: "azul" },
  { from: "Parque Central", to: "República", weight: 3, line: "azul" },
  { from: "Parque Central", to: "Bela Vista", weight: 3, line: "azul" },
  { from: "Jardim Sul", to: "Universidade", weight: 7, line: "azul" },
  { from: "Universidade", to: "Capão Redondo", weight: 7, line: "azul" },

  // Linha Verde
  { from: "Morumbi", to: "Bela Vista", weight: 2, line: "verde" },
  { from: "Bela Vista", to: "Paulista", weight: 2, line: "verde" },
  { from: "Paulista", to: "República", weight: 3, line: "verde" },
  { from: "Bela Vista", to: "Pinheiros", weight: 9, line: "verde" },

  // Linha Vermelha
  { from: "Tatuapé", to: "Carrão", weight: 2, line: "vermelha" },
  { from: "Carrão", to: "Penha", weight: 2, line: "vermelha" },
  { from: "Penha", to: "Sé", weight: 8, line: "vermelha" },

  // Linha Amarela
  { from: "Universidade", to: "Butantã", weight: 2, line: "amarela" },
  { from: "Butantã", to: "Faria Lima", weight: 2, line: "amarela" },
  { from: "Faria Lima", to: "Sé", weight: 5, line: "amarela" },

  // Linha Roxa
  { from: "Capão Redondo", to: "Santo Amaro", weight: 2, line: "roxa" },
  { from: "Santo Amaro", to: "Pinheiros", weight: 2, line: "roxa" },
  { from: "Pinheiros", to: "Luz", weight: 3, line: "roxa" },

  //Linha Laranja
  { from: "Tatuapé", to: "Butantã", weight: 2, line: "laranja" },
  { from: "Morumbi", to: "Tatuapé", weight: 2, line: "laranja" },
  { from: "Vila Nova", to: "Morumbi", weight: 3, line: "laranja" },

  // Integrações
  { from: "República", to: "Sé", weight: 4, line: "hub" },
  { from: "Sé", to: "Luz", weight: 4, line: "hub" },
];

const positions = {

  "Jardim Sul": { x: 75, y: 100 },
  "Vila Nova": { x: 250, y: 80 },
  "Parque Central": { x: 400, y: 120 },

  "Morumbi": { x: 120, y: 250 },
  "Bela Vista": { x: 250, y: 250 },
  "Paulista": { x: 500, y: 200 },

  "Tatuapé": { x: 140, y: 400 },
  "Carrão": { x: 300, y: 380 },
  "Penha": { x: 450, y: 350 },

  "Universidade": { x: 90, y: 550 },
  "Butantã": { x: 300, y: 520 },
  "Faria Lima": { x: 550, y: 500 },

  "Capão Redondo": { x: 120, y: 700 },
  "Santo Amaro": { x: 330, y: 650 },
  "Pinheiros": { x: 550, y: 600 },

  "República": { x: 800, y: 180 },
  "Sé": { x: 850, y: 400 },
  "Luz": { x: 800, y: 620 }
};

const lineColor = {
  azul: "#1e88e5",
  verde: "#43a047",
  vermelha: "#e53935",
  amarela: "#fbc02d",
  roxa: "#8e24aa",
  laranja: "#c06418",
  hub: "#555",
};


const cy = cytoscape({
  container: document.getElementById("cy"),

  style: [
    {
      selector: "edge",
      style: {
        "width": 4,
        "line-color": "#999",

        "label": "data(distance)",

        "font-size": 14,

        "text-background-opacity": 1,
        "text-background-color": "#fff",
        "text-background-padding": "2px",

        "text-rotation": "autorotate",
        "color": "#000"
      }
    },

    {
      selector: "node",
      style: {
        "label": "data(id)",
        "background-color": "#ffffff",
        "border-width": 2,
        "border-color": "#333",
        "color": "#000",
        "font-size": 12,
        "text-valign": "bottom",
        "text-margin-y": 10
      }
    },
    {
      selector: 'node[tipo = "hub"]',
      style: {
        width: 40,
        height: 40,
        'border-width': 4,
        'border-color': '#000'
      }
    },
    {
      selector: ".route",
      style: {
        "line-color": "#ff0000",
        width: 6,
      },
    },
  ],

  layout: { name: "preset" },
});


const nodes = new Set();

edges.forEach((e) => {
  nodes.add(e.from);
  nodes.add(e.to);
});

nodes.forEach((n) => {

  cy.add({
    group: "nodes",
    data: {
      id: n,
      tipo: ["República", "Sé", "Luz"].includes(n)
        ? "hub"
        : "normal"
    },
    position: positions[n]
  });

});



// ARESTAS


edges.forEach((e, i) => {
  cy.add({
    group: "edges",
    data: {
      id: `${e.from}-${e.to}-${i}`,
      source: e.from,
      target: e.to,
      distance: `${e.weight} km`,
      originalColor: lineColor[e.line]
    },
    style: {
      "line-color": lineColor[e.line] || "#999",
    },
  });
});



const select1 = document.getElementById("origem");
const select2 = document.getElementById("destino");

nodes.forEach((n) => {
  select1.innerHTML += `<option>${n}</option>`;
  select2.innerHTML += `<option>${n}</option>`;
});


//DIJKSTRA


const graph = {};

edges.forEach((e) => {
  if (!graph[e.from]) graph[e.from] = [];
  if (!graph[e.to]) graph[e.to] = [];

  graph[e.from].push({ to: e.to, weight: e.weight });
  graph[e.to].push({ to: e.from, weight: e.weight });
});

function dijkstra(start, end) {
  const dist = {},
    prev = {},
    visited = new Set();

  nodes.forEach((n) => (dist[n] = Infinity));
  dist[start] = 0;

  while (true) {
    let cur = null;

    for (const n in dist) {
      if (!visited.has(n) && (cur === null || dist[n] < dist[cur])) {
        cur = n;
      }
    }

    if (!cur) break;
    if (cur === end) break;

    visited.add(cur);

    for (const e of graph[cur] || []) {
      const alt = dist[cur] + e.weight;

      if (alt < dist[e.to]) {
        dist[e.to] = alt;
        prev[e.to] = cur;
      }
    }
  }

  const path = [];
  let cur = end;

  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }

  return path;
}


function resetStyles() {
  cy.edges().style("opacity", 0.15);
  cy.nodes().style("opacity", 0.15);
}

function highlightPath(path) {
  cy.edges().removeClass("route");

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];

    const edge = cy
      .edges()
      .filter(
        (e) =>
          (e.data("source") === a && e.data("target") === b) ||
          (e.data("source") === b && e.data("target") === a),
      );

    if (edge.length) {
      edge.style({
        opacity: 1,
        width: 6,
        "line-color": "#ff2d2d",
        "z-index": 999,
      });
    }
  }
}

function highlightNodes(path) {
  path.forEach((n, i) => {
    const node = cy.getElementById(n);

    node.style({
      opacity: 1,
      "background-color":
        i === 0
          ? "#2ecc71" // origem
          : i === path.length - 1
            ? "#e74c3c" // destino
            : "#f1c40f",
      "border-width": 4,
      "border-color": "#000",
      "font-size": 12,
    });
  });
}

function fadeOthers() {
  cy.elements().forEach((el) => {
    el.style("opacity", 0.15);
  });
}

function drawRoute(path) {
  // 1. apagar tudo
  cy.elements().style("opacity", 0.15);

  // 2. destacar nós
  path.forEach((n, i) => {
    const node = cy.getElementById(n);

    node.style({
      opacity: 1,
      "background-color":
        i === 0
          ? "#2ecc71"
          : i === path.length - 1
            ? "#e74c3c"
            : "#f1c40f",
      "border-width": 4,
      "border-color": "#000",
    });
  });

  // 3. destacar arestas
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i],
      b = path[i + 1];

    const edge = cy
      .edges()
      .filter(
        (e) =>
          (e.data("source") === a && e.data("target") === b) ||
          (e.data("source") === b && e.data("target") === a),
      );

    if (edge.length) {
      edge.style({
        opacity: 1,
        width: 6,
        "line-color": "#ff2d2d",
        "z-index": 999,
      });
    }
  }
}

function calcular() {
  resetarMapa();

  const origem = select1.value;
  const destino = select2.value;

  const path = dijkstra(origem, destino);

  drawRoute(path);

  const distanciaTotal = calcularDistanciaTotal(path);

  document.getElementById("result").innerHTML = `
  <div>
    <b>Rota</b><br>
    ${path.join(" > ")}
  </div>
  <hr>
  <div>
    <b>Distância Total</b><br>
    ${distanciaTotal} km
  </div>

  <div style="margin-top:10px">
    <b>Estações</b><br>
    ${path.length}
  </div>
`;

  result.classList.remove("hidden");
}

function calcularDistanciaTotal(path) {

  let total = 0;

  for (let i = 0; i < path.length - 1; i++) {

    const origem = path[i];
    const destino = path[i + 1];

    const edge = edges.find(e =>
      (e.from === origem && e.to === destino) ||
      (e.from === destino && e.to === origem)
    );

    if (edge) {
      total += edge.weight;
    }
  }

  return total;
}

function resetarMapa() {

  cy.nodes().forEach(node => {

    node.style({
      opacity: 1,
      "background-color": "#fff",
      "border-width": 2,
      "border-color": "#333",
      "font-size": 12
    });

    const result = document.getElementById("result");

    result.innerHTML = "";
    result.classList.add("hidden");

  });

  cy.edges().forEach(edge => {

    edge.style({
      opacity: 1,
      width: 4,
      "line-color": edge.data("originalColor")
    });

  });

  document.getElementById("result").innerHTML = "";
}