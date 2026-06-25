
const edges = [
  // Linha Azul
  { from: "A1", to: "A2", weight: 2, line: "azul" },
  { from: "A2", to: "A3", weight: 2, line: "azul" },
  { from: "A3", to: "H1", weight: 3, line: "azul" },
  { from: "A3", to: "B2", weight: 3, line: "azul" },
  { from: "A1", to: "D2", weight: 3, line: "azul" },

  // Linha Verde
  { from: "B1", to: "B2", weight: 2, line: "verde" },
  { from: "B2", to: "B3", weight: 2, line: "verde" },
  { from: "B3", to: "H1", weight: 3, line: "verde" },
  { from: "B2", to: "E2", weight: 3, line: "verde" },

  // Linha Vermelha
  { from: "C1", to: "C2", weight: 2, line: "vermelha" },
  { from: "C2", to: "C3", weight: 2, line: "vermelha" },
  { from: "C3", to: "H2", weight: 3, line: "vermelha" },

  // Linha Amarela
  { from: "D1", to: "D2", weight: 2, line: "amarela" },
  { from: "D2", to: "D3", weight: 2, line: "amarela" },
  { from: "D3", to: "H2", weight: 3, line: "amarela" },

  // Linha Roxa
  { from: "E1", to: "E2", weight: 2, line: "roxa" },
  { from: "E2", to: "E3", weight: 2, line: "roxa" },
  { from: "E3", to: "H3", weight: 3, line: "roxa" },

  // HUBS (baldeação)
  { from: "H1", to: "H2", weight: 4, line: "hub" },
  { from: "H2", to: "H3", weight: 4, line: "hub" },
];

const positions = {
  // AZUL (linha horizontal topo)
  A1: { x: 100, y: 100 },
  A2: { x: 200, y: 100 },
  A3: { x: 300, y: 100 },

  // VERDE
  B1: { x: 100, y: 200 },
  B2: { x: 200, y: 200 },
  B3: { x: 300, y: 200 },

  // VERMELHA
  C1: { x: 100, y: 300 },
  C2: { x: 200, y: 300 },
  C3: { x: 300, y: 300 },

  // AMARELA
  D1: { x: 100, y: 400 },
  D2: { x: 250, y: 400 },
  D3: { x: 300, y: 400 },

  // ROXA
  E1: { x: 100, y: 500 },
  E2: { x: 200, y: 500 },
  E3: { x: 300, y: 500 },

  // HUBS (coluna central)
  H1: { x: 500, y: 150 },
  H2: { x: 500, y: 300 },
  H3: { x: 500, y: 450 },
};

const lineColor = {
  azul: "#1e88e5",
  verde: "#43a047",
  vermelha: "#e53935",
  amarela: "#fbc02d",
  roxa: "#8e24aa",
  hub: "#555",
};


const cy = cytoscape({
  container: document.getElementById("cy"),

  style: [
    {
      selector: "node",
      style: {
        label: "data(id)",
        "background-color": "#fff",
        "border-width": 2,
        "border-color": "#333",
        "font-size": 10,
      },
    },
    {
      selector: "edge",
      style: {
        width: 4,
        "line-color": "#999",
      },
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
    data: { id: n },
    position: positions[n],
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
  const p = dijkstra(select1.value, select2.value);
  drawRoute(p);

  document.getElementById("result").innerHTML = "Rota: " + p.join(" -> ");
}