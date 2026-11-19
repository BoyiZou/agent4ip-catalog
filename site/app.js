(function publicPreview() {
  "use strict";

  const examples = globalThis.interfaceExamples;
  const main = document.querySelector("#main");
  const dialog = document.querySelector("#detail");
  const fields = {model: "Forward model", observation: "Observations", prediction: "Requested output", check: "Predictive check"};
  const pages = {
    catalog: ["PDE INVERSE BENCHMARK", "PDE inverse problems", "Browse example tasks by equation and inverse target. Open a specification to explore its model and measurements."],
    scattering: ["BENCHMARK COLLECTION", "Inverse scattering", "Explore how a measured echo can be used to locate a reflector."],
    matrix: ["BENCHMARK COVERAGE", "Coverage matrix", "Select a populated cell to see its example task."],
    agent: ["AGENT FOR IP", "Agent workspace", "Choose an example inverse problem and export a brief for an agent or a numerical solver."]
  };
  const filters = {search: "", family: "", target: ""};
  let datasetMode = false;
  let view = "catalog";
  let selected = null;
  let redraw;
  let detailTrigger = null;

  function escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[char]);
  }

  function taskLink(task, page = view, kind = "task") {
    return `#${page}?${kind}=${encodeURIComponent(task.id)}`;
  }

  function hero() {
    const [label, title, intro] = pages[view];
    const counts = view === "catalog" ? `<div class="counts"><span><b>${examples.length}</b> example tasks</span><span><b>${new Set(examples.map(item => item.family)).size}</b> PDE families</span></div>` : "";
    return `<section class="hero" aria-labelledby="view-title"><div class="hero-copy"><div class="kicker">${label}</div><h1 id="view-title">${title}</h1><p>${intro}</p>${counts}</div><div class="figure" aria-hidden="true"><canvas id="field"></canvas><span class="fig-label">u(x, y) · illustrative field</span></div></section>`;
  }

  function filterField(label, key) {
    const choices = [...new Set(examples.map(item => item[key]))];
    return `<select data-filter="${key}" aria-label="${label}"><option value="">${label}: all</option>${choices.map(option => `<option ${filters[key] === option ? "selected" : ""}>${escape(option)}</option>`).join("")}</select>`;
  }

  function catalog() {
    return `<div class="catalog-head"><h2>Catalog</h2><div class="switch" role="group" aria-label="Catalog entries">
      <button type="button" data-mode="tasks" aria-pressed="${!datasetMode}">Inverse tasks</button><button type="button" data-mode="datasets" aria-pressed="${datasetMode}">Dataset designs</button></div></div>
      <section class="panel"><div class="toolbar"><label class="search"><input type="search" data-filter="search" aria-label="Search examples" placeholder="Search titles or topics" value="${escape(filters.search)}"></label>
      ${filterField("PDE family", "family")}${filterField("Inverse target", "target")}</div><div id="results"></div></section>`;
  }

  function resultRows(items, dataset) {
    const rows = items.map(task => `<tr><td><div class="entry"><a href="${taskLink(task, view, dataset ? "dataset" : "task")}"><strong>${escape(dataset ? task.design : task.title)}</strong></a></div></td><td>${escape(task.family)}</td><td>${escape(task.target)}</td><td><span class="stamp">Example</span></td></tr>`).join("");
    return `<div class="table-wrap" role="region" aria-label="Examples" tabindex="0"><table><thead><tr><th scope="col">${dataset ? "Dataset design" : "Inverse task"}</th><th scope="col">PDE family</th><th scope="col">Inverse target</th><th scope="col">Status</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function updateResults() {
    const terms = filters.search.trim().toLowerCase().split(/\s+/);
    const items = examples.filter(task => (!filters.family || filters.family === task.family) && (!filters.target || filters.target === task.target) && terms.every(term => Object.values(task).join(" ").toLowerCase().includes(term)));
    const summary = `<div class="results-head"><span role="status">Showing ${items.length} of ${examples.length} examples</span></div>`;
    main.querySelector("#results").innerHTML = summary + (items.length ? resultRows(items, datasetMode) : '<div class="empty">No matching examples. Change the search or filters.</div>');
  }

  function coverage() {
    const families = [...new Set(examples.map(task => task.family))];
    const targets = [...new Set(examples.map(task => task.target))];
    const rows = families.map(family => `<tr><th scope="row">${escape(family)}</th>${targets.map(target => {
      const matches = examples.filter(task => task.family === family && task.target === target);
      return `<td>${matches.length ? matches.map(task => `<a href="${taskLink(task)}">${escape(task.title)}</a>`).join("<br>") : "—"}</td>`;
    }).join("")}</tr>`).join("");
    return `<div class="panel table-wrap matrix-wrap"><table class="matrix"><thead><tr><th scope="col">Equation family</th>${targets.map(target => `<th scope="col">${escape(target)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function detailFields(task) {
    return Object.entries(fields).map(([key, label]) => `<section><h3>${label}</h3><p>${escape(task[key])}</p></section>`).join("");
  }

  function workspace() {
    const options = examples.map(task => `<option value="${escape(task.id)}" ${selected === task ? "selected" : ""}>${escape(task.title)}</option>`).join("");
    const brief = selected ? `<div class="task-handoff"><h3>${escape(selected.title)}</h3>${detailFields(selected)}
      <p class="handoff-actions"><button type="button" data-format="json">Download JSON brief</button><button type="button" data-format="md">Download Markdown brief</button>
      <a href="${taskLink(selected, "catalog")}">Full example specification</a></p></div>` : "";
    return `<div class="catalog-head"><h2>Task handoff</h2></div><section class="panel agent-handoff"><label for="agent-task">Example task</label>
      <select id="agent-task"><option value="">Select an example</option>${options}</select>${brief}</section>`;
  }

  function download(format) {
    if (!selected) return;
    const text = format === "json" ? JSON.stringify({type: "interface-example", ...selected}, null, 2) :
      [`# ${selected.title}`, "Agent4IP · interface example", ...Object.entries(fields).map(([key, label]) => `## ${label}\n\n${selected[key]}`)].join("\n\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text + "\n"], {type: format === "json" ? "application/json" : "text/markdown"}));
    link.download = `${selected.id}-brief.${format}`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function draw() {
    cancelAnimationFrame(redraw);
    redraw = requestAnimationFrame(() => globalThis.drawReferenceFigure(document.querySelector("#field")));
  }

  function navigate() {
    const [route, query] = location.hash.slice(1).split("?");
    if (route === "main" && main.innerHTML) { main.focus(); return; }
    view = Object.hasOwn(pages, route) ? route : "catalog";
    const params = new URLSearchParams(query);
    selected = examples.find(task => task.id === (params.get("task") || params.get("dataset")));
    if (view === "catalog" && selected) datasetMode = params.has("dataset");
    const render = {catalog, agent: workspace, matrix: coverage,
      scattering: () => `<div class="catalog-head"><h2>Example tasks</h2></div><section class="panel">${resultRows(examples.filter(task => task.family === "Acoustic scattering"), false)}</section>`};
    main.innerHTML = hero() + render[view]();
    if (view === "catalog") updateResults();
    for (const link of document.querySelectorAll("nav a")) {
      if (link.hash === `#${view}`) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    if (selected && view !== "agent") {
      const title = params.has("dataset") ? selected.design : selected.title;
      document.querySelector("#detail-content").innerHTML = `<p class="micro">${escape(selected.family)}</p><h2 id="detail-title">${escape(title)}</h2>${detailFields(selected)}
        <p class="handoff-actions"><a class="agent-link" href="${taskLink(selected, "agent")}">Use with Agent for IP</a></p>`;
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) dialog.close();
    draw();
  }

  main.addEventListener("input", event => {
    if (event.target.dataset.filter) {
      filters[event.target.dataset.filter] = event.target.value;
      updateResults();
    }
  });
  main.addEventListener("change", event => {
    if (event.target.id === "agent-task") location.hash = event.target.value ? `agent?task=${encodeURIComponent(event.target.value)}` : "agent";
  });
  main.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (link?.hash && view !== "agent") detailTrigger = link.hash;
    const button = event.target.closest("button");
    if (button?.dataset.format) download(button.dataset.format);
    if (button?.dataset.mode) { datasetMode = button.dataset.mode === "datasets"; navigate(); }
  });
  document.querySelector("#dismiss").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (view !== "agent" && selected) {
      history.replaceState(null, "", `#${view}`);
      selected = null;
      Array.from(main.querySelectorAll("a")).find(link => link.hash === detailTrigger)?.focus();
    }
  });
  window.addEventListener("resize", draw);
  window.addEventListener("hashchange", navigate);
  navigate();
})();
