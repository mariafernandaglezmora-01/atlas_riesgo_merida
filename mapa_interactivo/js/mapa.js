const map = L.map("map").setView([21.05, -89.65], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap"
}).addTo(map);

const descripciones = {

fracturamiento: `
<h4>Grado de fracturamiento</h4>
<p>
Representa la intensidad de fracturas presentes
en el subsuelo kárstico.
</p>
`,

geomorfologia: `
<h4>Geomorfología</h4>
<p>
Describe las principales unidades del relieve.
</p>
`,

marginacion: `
<h4>Marginación</h4>
<p>
Indicador de vulnerabilidad socioeconómica.
</p>
`,

hacinamiento: `
<h4>Hacinamiento</h4>
<p>
Representa la presión habitacional dentro de las viviendas.
</p>
`

};

const capas = {};

const nombresCapas = {
  limites_zmm: "Delimitación de la ZMM",
  municipios: "Municipio",
  fracturamiento: "Riesgo geológico",
  geomorfologia: "Geomorfología",
  zonas_karsticas: "Zonas kársticas",
  cenotes: "Cenote",
  riesgo_inundacion: "Riesgo hidrometeorológico",
  trayectoria_tormenta: "Trayectoria histórica de tormenta",
  frecuencia_ciclon: "Frecuencia ciclónica",
  gaseras_industrias: "Riesgo químico-tecnológico",
  gasoductos: "Gasoducto",
  lineas_alta: "Línea de transmisión eléctrica",
  banco_material: "Banco de material",
  usos_contaminantes: "Uso contaminante",
  tiraderos: "Sitio de disposición final",
  ptar: "Planta de tratamiento de agua residual",
  potabilizadoras: "Planta potabilizadora",
  corredores: "Corredor económico",
  intrusion_marina: "Zona con intrusión marina",
  drenaje: "Cobertura de drenaje",
  marginacion: "Marginación",
  hacinamiento: "Hacinamiento",
  urbano_2000: "Suelo urbano 2000",
  urbano_2010: "Suelo urbano 2010",
  urbano_2020: "Suelo urbano 2020",
  urbano_2030: "Suelo urbano 2030",
  urbano_2040: "Suelo urbano 2040",
  urbano_2050: "Suelo urbano 2050"
};

function actualizarPanel(capa){

    const panel = document.getElementById("info-content");

    if(!panel) return;

    panel.innerHTML =
        descripciones[capa] ||
        "<p>Seleccione una capa temática.</p>";

}


function etiquetaValor(valor) {
  if (valor === undefined || valor === null || valor === "") return "Sin dato";
  return valor;
}

function filaPopup(etiqueta, valor) {
  return `
    <div class="popup-fila">
      <span>${etiqueta}</span>
      <strong>${etiquetaValor(valor)}</strong>
    </div>
  `;
}

function interpretarCampo(id, props) {
  if (id === "fracturamiento") {
    const cod = Number(getProp(props, ["Classes"]));
    return { titulo: "Grado de fracturamiento", valor: ({0:"Muy bajo",1:"Bajo",2:"Medio",3:"Alto"})[cod] };
  }

  if (id === "marginacion") {
    const cod = Number(getProp(props, ["GRMARG_20"]));
    return { titulo: "Marginación", valor: ({1:"Muy bajo",2:"Bajo",3:"Medio",4:"Alto"})[cod] };
  }

  if (id === "hacinamiento") {
    return { titulo: "Nivel de hacinamiento", valor: getProp(props, ["Nivel_haci"]) };
  }

  return null;
}

function popupPorCapa(id, feature, layer) {
  const p = feature.properties || {};

  /* Capas que no necesitan popup */
  const sinPopup = ["zonas_karsticas", "intrusion_marina", "urbano_2000",
  "urbano_2010",
  "urbano_2020",
  "urbano_2030",
  "urbano_2040",
  "urbano_2050"];

  if (sinPopup.includes(id)) {
    return;
  }

  const titulo = nombresCapas[id] || "Capa temática";

  const configuracionPopup = {
    limites_zmm: [
      ["NOM_ENT", "Entidad"],
      ["CVEGEO", "Clave geoestadística"],
      ["NOMGEO", "Zona metropolitana"]
    ],

    municipios: [
      ["NOMGEO", "Municipio"],
      ["CVEGEO", "Clave geoestadística"]
    ],

    fracturamiento: [
      ["CLASE", "Grado de fracturamiento"]
    ],

    geomorfologia: [
      ["DESCRIPCIO", "Tipo geomorfológico"]
    ],

    cenotes: [
      ["NOMBRE", "Nombre"],
      ["Name", "Nombre"],
      ["nombre", "Nombre"]
    ],

    riesgo_inundacion: [
      ["Inundacion", "Nivel de riesgo"],
      ["INUNDACION", "Nivel de riesgo"]
    ],

    trayectoria_tormenta: [
      ["NOMBRE", "Nombre del ciclón"],
      ["Nombre", "Nombre del ciclón"],
      ["Name", "Nombre del ciclón"]
    ],

    frecuencia_ciclon: [
      ["FR_CICLON", "Frecuencia ciclónica"]
    ],

    gaseras_industrias: [
      ["Tipo", "Tipo de instalación"],
      ["TIPO", "Tipo de instalación"]
    ],

    gasoductos: [
      ["Layer", "Tipo"],
      ["Tipo", "Tipo"]
    ],

    lineas_alta: [
      ["Nombre", "Nombre"],
      ["NOMBRE", "Nombre"],
      ["tension_kv", "Tensión"],
      ["TENSION_KV", "Tensión"]
    ],

    banco_material: [
      ["conflicto", "Estatus"],
      ["Estatus", "Estatus"]
    ],

    usos_contaminantes: [
      ["RECLAS_3", "Uso contaminante"]
    ],

    tiraderos: [
      ["Tipo_Relle", "Tipo de sitio"],
      ["TIPO", "Tipo de sitio"],
      ["Tipo", "Tipo de sitio"]
    ],

    ptar: [
      ["CAUDAL", "Caudal"],
      ["CAPACIDAD", "Capacidad"],
      ["Capacidad", "Capacidad"]
    ],

    potabilizadoras: [
      ["PLANTA", "Planta"],
      ["Nombre", "Planta"],
      ["CAPACIDAD", "Capacidad"],
      ["Capacidad", "Capacidad"]
    ],

    corredores: [
      ["Nombre", "Corredor"],
      ["NOMBRE", "Corredor"],
      ["grado", "Grado de especialización"],
      ["GRADO", "Grado de especialización"]
    ],

    drenaje: [
      ["VPH_DREN", "Viviendas con drenaje (%)"]
    ],

    marginacion: [
      ["F2020_GM_2", "Grado de marginación"]
    ],

    hacinamiento: [
      ["Nivel_haci", "Nivel de hacinamiento"]
    ]
  };

  const campos = configuracionPopup[id] || [];

  let contenido = `
    <div class="popup-card">
      <div class="popup-header">${titulo}</div>
      <div class="popup-body">
  `;

  let hayCampos = false;

  campos.forEach(([campo, etiqueta]) => {
    if (p[campo] !== undefined && p[campo] !== null && p[campo] !== "") {
      contenido += filaPopup(etiqueta, p[campo]);
      hayCampos = true;
    }
  });

  if (!hayCampos) {
    contenido += `
      <div class="popup-fila">
        <span>Información</span>
        <strong>Capa temática</strong>
      </div>
    `;
  }

  contenido += `
      </div>
      <div class="popup-footer">Atlas Digital de Riesgos · ZM Mérida</div>
    </div>
  `;

  layer.bindPopup(contenido);
}


function getProp(props, posibles) {
  for (const p of posibles) {
    if (props[p] !== undefined && props[p] !== null) return props[p];
  }
  return "";
}

function estiloPorCapa(id, feature) {
  const p = feature.properties || {};

  if (id === "limites_zmm") {
    return { color: "#8a1786", weight: 3, fillOpacity: 0 };
  }

  if (id === "municipios") {
    return { color: "#69546e", weight: 1, fillOpacity: 0 };
  }

  if (id === "fracturamiento") {
  const v = Number(getProp(p, ["Classes"]));

  const colores = {
    0: "#BFD86B",
    1: "#FFF7BC",
    2: "#FDD49E",
    3: "#F46D43"
  };

  return {
    color: "#777",
    weight: 0.8,
    fillColor: colores[v] || "#DDDDDD",
    fillOpacity: 0.75
  };
}

  if (id === "geomorfologia") {
  const v = String(getProp(p, ["DESCRIPCIO"])).trim().toLowerCase();

  let color = "#DDDDDD";

  if (v.includes("piso rocoso") && v.includes("cementado")) color = "#D8ECF7";
  else if (v.includes("transición") || v.includes("transicion")) color = "#F1C27D";
  else if (v.includes("aluvial") || v.includes("costera")) color = "#F0A6FF";
  else if (v.includes("playa") || v.includes("barra")) color = "#B5179E";

  return {
    color: color,
    weight: 1.2,
    fillColor: color,
    fillOpacity: 0.55
  };
}

  if (id === "zonas_karsticas") {
    return { color: "#C084FC", weight: 1, fillColor: "#F3E8FF", fillOpacity: 0.45 };
  }

  if (id === "riesgo_inundacion") {
    const v = getProp(p, ["Inundacion", "INUNDACION", "inundacion"]);
    const colores = {
      "Alto": "#0077B6",
      'Alto con "Marea de Tormenta"': "#023E8A",
      "Medio": "#90E0EF",
      'Medio con "Marea de Tormenta"': "#48CAE4"
    };
    return { color: colores[v] || "#0077B6", weight: 1, fillColor: colores[v] || "#90E0EF", fillOpacity: 0.42 };
  }

  if (id === "intrusion_marina") {
    return { color: "#64748B", weight: 1.2, fillColor: "#CBD5E1", fillOpacity: 0.25 };
  }

  if (id === "drenaje") {
    const v = Number(getProp(p, ["VPH_DREN", "vph_dren", "DRENAJE"]));
    let color = "#F8FAFC";
    if (v >= 95) color = "#1D4E89";
    else if (v >= 90.1) color = "#2E86AB";
    else if (v >= 85.1) color = "#75B7D1";
    else if (v >= 80) color = "#BFD7EA";
    else color = "#F1F5F9";
    return { color: "#ffffff", weight: 0.7, fillColor: color, fillOpacity: 0.6 };
  }

  if (id === "hacinamiento") {
  const v = String(getProp(p, ["Nivel_haci"])).trim();

  const colores = {
    "Muy Alto": "#D00000",
    "Alto": "#F77F00",
    "Medio": "#FCBF49",
    "Bajo": "#90BE6D",
    "Muy Bajo": "#277DA1"
  };

  return {
    color: "#ffffff",
    weight: 0.7,
    fillColor: colores[v] || "#DDDDDD",
    fillOpacity: 0.65
  };
}

  if (id === "usos_contaminantes") {
    const v = getProp(p, ["RECLAS_3", "reclas_3"]);
    const colores = {
      "Agroindustrial": "#2A9D3F",
      "Industrial": "#7FFF00"
    };
    return { color: colores[v] || "#333", weight: 1, fillColor: colores[v] || "#AAA", fillOpacity: 0.55 };
  }

  if (id.startsWith("urbano_")) {
    const colores = {
      "urbano_2000": "#90CAF9",
      "urbano_2010": "#42A5F5",
      "urbano_2020": "#1E88E5",
      "urbano_2030": "#FFB703",
      "urbano_2040": "#FB8500",
      "urbano_2050": "#D00000"
    };
    return { color: colores[id], weight: 1, fillColor: colores[id], fillOpacity: 0.45, interactive: false };
  }

  return { color: "#12344D", weight: 1, fillColor: "#0FA3B1", fillOpacity: 0.4 };
}

function puntoPorCapa(id, feature, latlng) {
  const p = feature.properties || {};

  if (id === "cenotes") {
    return L.circleMarker(latlng, { radius: 5, fillColor: "#00D1C1", color: "#ffffff", weight: 1, fillOpacity: 0.9 });
  }

  if (id === "frecuencia_ciclon") {
    const v = getProp(p, ["FR_CICLON", "fr_ciclon"]);
    const colores = {
      "Muy alto": "#FF6B6B",
      "Alto": "#FFD166",
      "Medio": "#FFF3B0",
      "Bajo": "#B8F35A",
      "Muy bajo": "#38E000"
    };
    return L.circleMarker(latlng, { radius: 9, fillColor: colores[v] || "#999", color: "#ffffff", weight: 1, fillOpacity: 0.9 });
  }

  if (id === "gaseras_industrias") {
    const v = getProp(p, ["Tipo", "TIPO", "tipo"]);
    const color = v === "Gaseras" ? "#6A0572" : "#E63946";
    return L.circleMarker(latlng, { radius: 7, fillColor: color, color: "#ffffff", weight: 1, fillOpacity: 0.95 });
  }

  if (id === "banco_material") {
    return L.circleMarker(latlng, { radius: 6, fillColor: "#111827", color: "#ffffff", weight: 1, fillOpacity: 0.9 });
  }

  if (id === "tiraderos") {
    const v = getProp(p, ["Tipo_Relle", "TIPO", "tipo"]);
    const color = v === "Relleno sanitario" ? "#FFFF00" : "#D00000";
    return L.circleMarker(latlng, { radius: 6, fillColor: color, color: "#333", weight: 1, fillOpacity: 0.95 });
  }

  if (id === "ptar") {
    const v = getProp(p, ["CAUDAL", "caudal"]);
    const colores = {
      "Menor a 5 L/s": "#F4A6FF",
      "Desde 5 L/s hasta menos de 50 L/s": "#FF00B8",
      "Desde 50 L/s hasta menos de 100 L/s": "#9D00A8"
    };
    return L.circleMarker(latlng, { radius: 6, fillColor: colores[v] || "#FF00B8", color: "#ffffff", weight: 1, fillOpacity: 0.95 });
  }

  if (id === "potabilizadoras") {
    return L.circleMarker(latlng, { radius: 7, fillColor: "#2DE000", color: "#ffffff", weight: 1, fillOpacity: 0.95 });
  }

  if (id === "marginacion") {
  const v = Number(getProp(p, ["GRMARG_20"]));

  const colores = {
    1: "#E5E7EB",
    2: "#D1D5DB",
    3: "#9CA3AF",
    4: "#4B5563"
  };

  return L.circleMarker(latlng, {
    radius: 8,
    fillColor: colores[v] || "#9CA3AF",
    color: "#ffffff",
    weight: 1,
    fillOpacity: 0.95
  });
}

  return L.circleMarker(latlng, { radius: 6, fillColor: "#0FA3B1", color: "#ffffff", weight: 1, fillOpacity: 0.9 });
}

function estiloLinea(id, feature) {
  const p = feature.properties || {};

  if (id === "trayectoria_tormenta") {
    const v = getProp(p, ["NOMBRE", "nombre", "Name"]);
    const colores = {
      "Gilberto": "#1D4E89",
      "Winona": "#80ED99",
      "Colin": "#D00000",
      "Opal": "#FB8500",
      "Mitch": "#6A4C93",
      "Katrina": "#A0522D",
      "Isidoro": "#FFFF3F",
      "Bill": "#90BE6D",
      "Larry": "#FF9999"
    };
    return { color: colores[v] || "#FF6B35", weight: 3, dashArray: "8 6" };
  }

  if (id === "gasoductos") {
    return { color: "#111827", weight: 3 };
  }

  if (id === "lineas_alta") {
    const v = getProp(p, ["tension_kv", "TENSION_KV"]);
    return {
      color: String(v).toLowerCase().includes("media") ? "#00A6FB" : "#7B2CBF",
      weight: 3
    };
  }

  if (id === "corredores") {
    const v = getProp(p, ["grado", "GRADO", "Especializacion"]);
    const colores = {
      "Mayor": "#D000FF",
      "Intermedio": "#80ED99",
      "Menor": "#FFB703",
      "Alto": "#2DD4BF",
      "Medio": "#80ED99",
      "Bajo": "#FFB703"
    };
    return { color: colores[v] || "#FFB703", weight: 4 };
  }

  return { color: "#12344D", weight: 3 };
}

async function cargarGeoJSON(id, archivo, tipo) {
  const respuesta = await fetch(`data/${archivo}`);
  const datos = await respuesta.json();

  let capa;

  if (tipo === "punto") {
    capa = L.geoJSON(datos, {
      pointToLayer: (feature, latlng) => puntoPorCapa(id, feature, latlng),
      onEachFeature: (feature, layer) => popupPorCapa(id, feature, layer)
    });
  } else if (tipo === "linea") {
    capa = L.geoJSON(datos, {
      style: feature => estiloLinea(id, feature),
      onEachFeature: (feature, layer) => popupPorCapa(id, feature, layer)
    });
  } else {
    capa = L.geoJSON(datos, {
      style: feature => estiloPorCapa(id, feature),
      onEachFeature: (feature, layer) => popupPorCapa(id, feature, layer)
    });
  }

  capas[id] = capa;

  const checkbox = document.getElementById(id);

  if (checkbox && checkbox.checked) capa.addTo(map);

  if (checkbox) {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        capa.addTo(map);
        actualizarLeyendaCapa(id);
      } else {
        map.removeLayer(capa);
        actualizarLeyenda(null);
      }
    });
  }
}

function actualizarLeyenda(id) {
  const cont = document.getElementById("leyenda-contenido");

  const leyendas = {
    fracturamiento: {
      titulo: "Grado de fracturamiento",
      items: [
        ["#BFD86B", "Muy bajo"],
        ["#FFF7BC", "Bajo"],
        ["#FDD49E", "Medio"],
        ["#F46D43", "Alto"]
      ]
    },

    riesgo_inundacion: {
      titulo: "Riesgo por inundación",
      items: [
        ["#023E8A", "Alto con marea de tormenta"],
        ["#0077B6", "Alto"],
        ["#48CAE4", "Medio con marea de tormenta"],
        ["#90E0EF", "Medio"]
      ]
    },

    frecuencia_ciclon: {
      titulo: "Frecuencia de ciclones",
      items: [
        ["#FF6B6B", "Muy alto"],
        ["#FFD166", "Alto"],
        ["#FFF3B0", "Medio"],
        ["#B8F35A", "Bajo"],
        ["#38E000", "Muy bajo"]
      ]
    },

    geomorfologia: {
      titulo: "Geomorfología",
      items: [
        ["#D8ECF7", "Llanura rocosa"],
        ["#F1C27D", "Llanura de transición"],
        ["#F0A6FF", "Llanura costera inundable"],
        ["#B5179E", "Playa o barra inundable"]
      ]
    },

    drenaje: {
      titulo: "Viviendas con drenaje",
      items: [
        ["#F1F5F9", "Menor a 80%"],
        ["#BFD7EA", "80% – 85%"],
        ["#75B7D1", "85.1% – 90%"],
        ["#2E86AB", "90.1% – 95%"],
        ["#1D4E89", "Mayor a 95%"]
      ]
    },

    hacinamiento: {
      titulo: "Nivel de hacinamiento",
      items: [
        ["#D00000", "Muy alto"],
        ["#F77F00", "Alto"],
        ["#FCBF49", "Medio"],
        ["#90BE6D", "Bajo"],
        ["#277DA1", "Muy bajo"]
      ]
    },

    usos_contaminantes: {
      titulo: "Usos contaminantes",
      items: [
        ["#2A9D3F", "Agroindustrial"],
        ["#7FFF00", "Industrial"]
      ]
    },

    urbano_2000: {
      titulo: "Expansión urbana",
      items: [["#90CAF9", "Suelo urbano 2000"]]
    },

    urbano_2010: {
      titulo: "Expansión urbana",
      items: [["#42A5F5", "Suelo urbano 2010"]]
    },

    urbano_2020: {
      titulo: "Expansión urbana",
      items: [["#1E88E5", "Suelo urbano 2020"]]
    },

    urbano_2030: {
      titulo: "Expansión urbana prospectiva",
      items: [["#FFB703", "Suelo urbano 2030"]]
    },

    urbano_2040: {
      titulo: "Expansión urbana prospectiva",
      items: [["#FB8500", "Suelo urbano 2040"]]
    },

    urbano_2050: {
      titulo: "Expansión urbana prospectiva",
      items: [["#D00000", "Suelo urbano 2050"]]
    }
  };

  if (!id || !leyendas[id]) {
    cont.innerHTML = "Activa una capa temática para visualizar su simbología.";
    return;
  }

  const leyenda = leyendas[id];

  cont.innerHTML = `
    <strong>${leyenda.titulo}</strong>
    ${leyenda.items.map(([color, texto]) =>
      `<div class="leyenda-item">
        <span class="swatch" style="background:${color}"></span>
        ${texto}
      </div>`
    ).join("")}
  `;
}

function actualizarLeyendaSimple(titulo, items) {
  const cont = document.getElementById("leyenda-contenido");

  cont.innerHTML = `
    <strong>${titulo}</strong>
    ${items.map(item => {
      if (item.tipo === "punto") {
        return `
          <div class="leyenda-item">
            <span class="punto" style="background:${item.color}"></span>
            ${item.texto}
          </div>
        `;
      }

      if (item.tipo === "linea") {
        return `
          <div class="leyenda-item">
            <span class="linea" style="border-top-color:${item.color}"></span>
            ${item.texto}
          </div>
        `;
      }

      return `
        <div class="leyenda-item">
          <span class="swatch" style="background:${item.color}"></span>
          ${item.texto}
        </div>
      `;
    }).join("")}
  `;
}

let capaRiesgoQuimico = null;

function colorRiesgoQuimico(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return null;

  if (valor <= 1) return "#FFF3B0";   // Bajo
  if (valor <= 2) return "#FFB703";   // Medio
  if (valor <= 3) return "#FB8500";   // Alto
  return "#D00000";                  // Muy alto
}

async function cargarRasterRiesgoQuimico() {
  const respuesta = await fetch("data/riesgo_quimico.tif");
  const arrayBuffer = await respuesta.arrayBuffer();
  const georaster = await parseGeoraster(arrayBuffer);

  capaRiesgoQuimico = new GeoRasterLayer({
    georaster: georaster,
    opacity: 0.55,
    resolution: 128,
    pixelValuesToColorFn: values => {
      const valor = values[0];
      return colorRiesgoQuimico(valor);
    }
  });

  const check = document.getElementById("riesgo_quimico");

  check.addEventListener("change", function () {
    if (this.checked) {
      capaRiesgoQuimico.addTo(map);
      actualizarLeyendaRasterQuimico();
    } else {
      map.removeLayer(capaRiesgoQuimico);
      actualizarLeyenda(null);
    }
  });
}

function actualizarLeyendaRasterQuimico() {
  const cont = document.getElementById("leyenda-contenido");

  cont.innerHTML = `
    <strong>Riesgo químico-tecnológico</strong>
    <div class="leyenda-item"><span class="swatch" style="background:#FFF3B0"></span>Bajo</div>
    <div class="leyenda-item"><span class="swatch" style="background:#FFB703"></span>Medio</div>
    <div class="leyenda-item"><span class="swatch" style="background:#FB8500"></span>Alto</div>
    <div class="leyenda-item"><span class="swatch" style="background:#D00000"></span>Muy alto</div>
  `;
}

cargarRasterRiesgoQuimico();





cargarGeoJSON("limites_zmm", "limites_zmm.geojson", "poligono");
cargarGeoJSON("municipios", "municipios.geojson", "poligono");

cargarGeoJSON("fracturamiento", "fracturamiento.geojson", "poligono");
cargarGeoJSON("geomorfologia", "geomorfologia.geojson", "poligono");
cargarGeoJSON("zonas_karsticas", "zonas_karsticas.geojson", "poligono");
cargarGeoJSON("cenotes", "cenotes.geojson", "punto");

cargarGeoJSON("riesgo_inundacion", "riesgo_inundacion.geojson", "poligono");
cargarGeoJSON("trayectoria_tormenta", "trayectoria_tormenta.geojson", "linea");
cargarGeoJSON("frecuencia_ciclon", "frecuencia_ciclon.geojson", "punto");

cargarGeoJSON("gaseras_industrias", "gaseras_industrias.geojson", "punto");
cargarGeoJSON("gasoductos", "gasoductos.geojson", "linea");
cargarGeoJSON("lineas_alta", "lineas_alta.geojson", "linea");
cargarGeoJSON("banco_material", "banco_material.geojson", "punto");
cargarGeoJSON("usos_contaminantes", "usos_contaminantes.geojson", "poligono");

cargarGeoJSON("tiraderos", "tiraderos.geojson", "punto");
cargarGeoJSON("ptar", "ptar.geojson", "punto");
cargarGeoJSON("potabilizadoras", "potabilizadoras.geojson", "punto");
cargarGeoJSON("corredores", "corredores.geojson", "linea");
cargarGeoJSON("intrusion_marina", "intrusion_marina.geojson", "poligono");
cargarGeoJSON("drenaje", "drenaje.geojson", "poligono");

cargarGeoJSON("marginacion", "marginacion.geojson", "punto");
cargarGeoJSON("hacinamiento", "hacinamiento.geojson", "poligono");

cargarGeoJSON("urbano_2000", "urbano_2000.geojson", "poligono");
cargarGeoJSON("urbano_2010", "urbano_2010.geojson", "poligono");
cargarGeoJSON("urbano_2020", "urbano_2020.geojson", "poligono");
cargarGeoJSON("urbano_2030", "urbano_2030.geojson", "poligono");
cargarGeoJSON("urbano_2040", "urbano_2040.geojson", "poligono");
cargarGeoJSON("urbano_2050", "urbano_2050.geojson", "poligono");

const capasUrbanas = {
  0: { anio: "2000", id: "urbano_2000" },
  1: { anio: "2010", id: "urbano_2010" },
  2: { anio: "2020", id: "urbano_2020" },
  3: { anio: "2030", id: "urbano_2030" },
  4: { anio: "2040", id: "urbano_2040" },
  5: { anio: "2050", id: "urbano_2050" }
};

function apagarCapasUrbanas() {
  Object.values(capasUrbanas).forEach(item => {
    if (capas[item.id] && map.hasLayer(capas[item.id])) {
      map.removeLayer(capas[item.id]);
    }

    const check = document.getElementById(item.id);
    if (check) check.checked = false;
  });
}

function mostrarUrbano(indice) {
  const item = capasUrbanas[indice];

  if (!item) return;

  apagarCapasUrbanas();

  if (capas[item.id]) {
    capas[item.id].addTo(map);
  }

  const check = document.getElementById(item.id);
  if (check) check.checked = true;

  document.getElementById("anio-urbano").textContent = item.anio;
  actualizarLeyenda(item.id);
}

const sliderUrbano = document.getElementById("slider-urbano");

if (sliderUrbano) {
  sliderUrbano.addEventListener("input", function () {
    mostrarUrbano(this.value);
  });
}


function actualizarLeyendaCapa(id) {
  const simples = {
    cenotes: {
      titulo: "Cenotes",
      items: [{ tipo: "punto", color: "#00D1C1", texto: "Cenote" }]
    },

    trayectoria_tormenta: {
      titulo: "Trayectorias históricas de tormentas",
      items: [{ tipo: "linea", color: "#FF6B35", texto: "Trayectoria ciclónica" }]
    },

    gaseras_industrias: {
      titulo: "Gaseras e industrias peligrosas",
      items: [
        { tipo: "punto", color: "#6A0572", texto: "Gaseras" },
        { tipo: "punto", color: "#E63946", texto: "Industrias peligrosas" }
      ]
    },

    gasoductos: {
      titulo: "Gasoductos",
      items: [{ tipo: "linea", color: "#111827", texto: "Gasoducto" }]
    },

    lineas_alta: {
      titulo: "Líneas de transmisión eléctrica",
      items: [
        { tipo: "linea", color: "#7B2CBF", texto: "Alta tensión" },
        { tipo: "linea", color: "#00A6FB", texto: "Media tensión" }
      ]
    },

    banco_material: {
      titulo: "Bancos de material",
      items: [{ tipo: "punto", color: "#111827", texto: "Banco de material" }]
    },

    tiraderos: {
      titulo: "Sitios de disposición final",
      items: [
        { tipo: "punto", color: "#FFFF00", texto: "Relleno sanitario" },
        { tipo: "punto", color: "#D00000", texto: "Tiradero" }
      ]
    },

    ptar: {
      titulo: "Plantas de tratamiento de aguas residuales",
      items: [
        { tipo: "punto", color: "#F4A6FF", texto: "Menor a 5 L/s" },
        { tipo: "punto", color: "#FF00B8", texto: "5 a menos de 50 L/s" },
        { tipo: "punto", color: "#9D00A8", texto: "50 a menos de 100 L/s" }
      ]
    },

    potabilizadoras: {
      titulo: "Plantas potabilizadoras",
      items: [{ tipo: "punto", color: "#2DE000", texto: "Planta potabilizadora" }]
    },

    corredores: {
      titulo: "Corredores económicos",
      items: [
        { tipo: "linea", color: "#D000FF", texto: "Mayor especialización" },
        { tipo: "linea", color: "#80ED99", texto: "Especialización intermedia" },
        { tipo: "linea", color: "#FFB703", texto: "Menor especialización" }
      ]
    },

    marginacion: {
      titulo: "Marginación",
      items: [
        { tipo: "punto", color: "#E5E7EB", texto: "Muy bajo" },
        { tipo: "punto", color: "#D1D5DB", texto: "Bajo" },
        { tipo: "punto", color: "#9CA3AF", texto: "Medio" },
        { tipo: "punto", color: "#4B5563", texto: "Alto" }
      ]
    },

    limites_zmm: {
      titulo: "Delimitación metropolitana",
      items: [{ tipo: "linea", color: "#12344D", texto: "Límite de la ZMM" }]
    },

    municipios: {
      titulo: "División municipal",
      items: [{ tipo: "linea", color: "#6B7280", texto: "Límite municipal" }]
    }
  };

  if (simples[id]) {
    actualizarLeyendaSimple(simples[id].titulo, simples[id].items);
  } else {
    actualizarLeyenda(id);
  }
}