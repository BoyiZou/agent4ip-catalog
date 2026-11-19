/* Illustrative analytic surface for the catalog masthead. */
globalThis.drawReferenceFigure = function drawReferenceFigure(canvas) {
  if (!canvas) return;
  const bounds = canvas.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;
  if (!width || !height) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ratio = Math.min(globalThis.devicePixelRatio || 1, 3);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const compact = height < 130;
  const plotWidth = Math.min(width * 0.91, height * (compact ? 3.7 : 2.5));
  const plotHeight = height * (compact ? 0.94 : 0.88);
  const centerX = width * 0.51;
  const centerY = height * (compact ? 0.63 : 0.65);
  const floor = -0.17;

  function field(x, y) {
    const ridge = 1.07 * Math.exp(-5.1 * ((x + 0.12) ** 2 + (y + 0.15 - x * 0.37) ** 2));
    const shoulder = 0.51 * Math.exp(-11 * (x - 0.57) ** 2 - 5.6 * (y + 0.27) ** 2);
    const trough = 0.27 * Math.exp(-9.5 * (x + 0.48) ** 2 - 5.8 * (y - 0.40) ** 2);
    return ridge + shoulder - trough + 0.04 * Math.cos(3.1 * x - 1.4 * y);
  }

  function project(x, y, z) {
    return [centerX + plotWidth * (0.315 * x - 0.177 * y),
      centerY + plotHeight * (0.104 * x + 0.154 * y - 0.49 * z)];
  }

  function line(from, to) {
    ctx.beginPath();
    ctx.moveTo(...from);
    ctx.lineTo(...to);
    ctx.stroke();
  }

  // Faint floor and axes establish the surface's orientation.
  ctx.lineWidth = compact ? 0.45 : 0.7;
  ctx.strokeStyle = "rgba(184, 221, 179, 0.14)";
  for (let i = 0; i <= 8; i++) {
    const t = -1 + i / 4;
    line(project(t, -1, floor), project(t, 1, floor));
    line(project(-1, t, floor), project(1, t, floor));
  }
  ctx.strokeStyle = "rgba(198, 230, 190, 0.50)";
  line(project(-1, 1, floor), project(1.1, 1, floor));
  line(project(1, 1, floor), project(1, -1.14, floor));
  line(project(-1, 1, floor), project(-1, 1, 0.97));
  for (let i = 0; i <= 4; i++) {
    const t = -1 + i / 2;
    line(project(t, 1, floor), project(t, 1.045, floor));
    line(project(1, t, floor), project(1.036, t, floor));
    const z = floor + i * 0.25;
    line(project(-1, 1, z), project(-1, 1.035, z));
  }

  const strips = compact ? 27 : 44;
  const samples = compact ? 44 : 72;
  const rows = Array.from({length: strips + 1}, (_, j) => {
    const y = -1 + 2 * j / strips;
    return Array.from({length: samples + 1}, (_, i) => {
      const x = -1 + 2 * i / samples;
      return project(x, y, field(x, y));
    });
  });

  const fill = ctx.createLinearGradient(0, height * 0.12, 0, height * 0.95);
  fill.addColorStop(0, "#406345");
  fill.addColorStop(0.46, "#2a523e");
  fill.addColorStop(1, "#1b4136");
  const ink = ctx.createLinearGradient(0, height * 0.15, 0, height * 0.93);
  ink.addColorStop(0, "#dbffa6");
  ink.addColorStop(0.51, "#a3d98d");
  ink.addColorStop(1, "#629277");

  // Paint adjacent mesh strips from the far side towards the viewer.
  for (let j = 1; j < rows.length; j++) {
    const back = rows[j - 1];
    const front = rows[j];
    ctx.beginPath();
    ctx.moveTo(...back[0]);
    for (let i = 1; i <= samples; i++) ctx.lineTo(...back[i]);
    for (let i = samples; i >= 0; i--) ctx.lineTo(...front[i]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.lineWidth = compact ? 0.47 : 0.68;
    ctx.strokeStyle = ink;
    ctx.beginPath();
    ctx.moveTo(...back[0]);
    for (let i = 1; i <= samples; i++) ctx.lineTo(...back[i]);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= samples; i += 2) {
      ctx.moveTo(...back[i]);
      ctx.lineTo(...front[i]);
    }
    ctx.strokeStyle = "rgba(190, 229, 157, 0.53)";
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(...rows[strips][0]);
  for (let i = 1; i <= samples; i++) ctx.lineTo(...rows[strips][i]);
  ctx.strokeStyle = ink;
  ctx.stroke();

  if (!compact) {
    ctx.fillStyle = "rgba(203, 229, 199, 0.82)";
    ctx.font = 'italic 11px Georgia, serif';
    ctx.fillText("x", ...project(1.14, 1.04, floor));
    ctx.fillText("y", ...project(1.01, -1.23, floor));
    ctx.fillText("u", ...project(-1, 1.065, 1.035));
  }
};
