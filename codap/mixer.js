const chart = document.getElementById("chart");
const output = document.getElementById("output");
const catCountInput = document.getElementById("catCount");

let categories = [];
const MAX_VISIBLE_BLOCKS = 40;
const CHART_HEIGHT = 260;

let draggingIndex = null;
let dragStartY = 0;
let dragStartCount = 0;
let dragStartScale = 1;
let isDragging = false;

function syncCategoryCount(n) {
  while (categories.length < n) {
    categories.push({ name: `Cat ${categories.length + 1}`, count: 10 });
  }
  while (categories.length > n) {
    categories.pop();
  }
  render();
}

function sanitizeLabel(text) {
  return text.replace(/,/g, "");   // remove all commas
}

function drawBar(bar, count, scale, useDiscrete) {
  bar.innerHTML = "";
  bar.style.background = "";

  if (useDiscrete) {
    for (let j = 0; j < count; j++) {
      const block = document.createElement("div");
      block.style.height = `${scale - 1}px`;
      block.style.marginTop = "1px";
      block.style.background = "#4fa3d1";
      bar.appendChild(block);
    }
  } else {
    bar.style.background = "#4fa3d1";
  }

  bar.style.height = `${count * scale}px`;
}

function getBarIndexFromPointerX(clientX) {
  const wrappers = chart.children;
  let closestIndex = null;
  let closestDist = Infinity;

  for (let idx = 0; idx < wrappers.length; idx++) {
    const rect = wrappers[idx].getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const dist = Math.abs(clientX - centerX);

    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = idx;
    }
  }

  return closestIndex;
}

document.addEventListener("pointermove", e => {
  if (!isDragging) return;

  const newIndex = getBarIndexFromPointerX(e.clientX);
  if (newIndex === null) return;

  const cat = categories[newIndex];
  const wrappers = chart.children;
  const wrapper = wrappers[newIndex];
  if (!wrapper) return;

  const countLabel = wrapper.children[0];
  const bar = wrapper.children[1];

  // Compute current scale
  const currentMax = Math.max(...categories.map(c => c.count), 1);
  const currentScale = CHART_HEIGHT / currentMax;
  const currentUseDiscrete = categories.every(c => c.count <= MAX_VISIBLE_BLOCKS);

  // Compute new count using locked drag scale
  const delta = dragStartY - e.clientY;

  let newCount = Math.round(dragStartCount + delta / dragStartScale);

  // Soft limiter
  const MAX_REASONABLE = 5000;
  if (newCount > MAX_REASONABLE) {
    const excess = newCount - MAX_REASONABLE;
    newCount = MAX_REASONABLE + Math.sqrt(excess);
  }

  newCount = Math.max(0, Math.round(newCount));

  if (newCount !== cat.count) {
    const oldMax = Math.max(...categories.map(c => c.count), 1);
  
    cat.count = newCount;

    const newMax = Math.max(...categories.map(c => c.count), 1);
    const scaleChanged = newMax !== oldMax;

    if (!scaleChanged) {
      // Only redraw this bar
      countLabel.textContent = cat.count;
      drawBar(bar, cat.count, currentScale, currentUseDiscrete);
    } else {
      // Redraw ALL bars in place (no DOM rebuild)
      const wrappers = chart.children;

      categories.forEach((c, idx) => {
        const w = wrappers[idx];
        if (!w) return;

        const lbl = w.children[0];
        const b = w.children[1];
 
        lbl.textContent = c.count;
        drawBar(b, c.count, currentScale, currentUseDiscrete);
      });
    }

    updateOutput();
  }

  // Update drag anchor so horizontal moves stay smooth
  draggingIndex = newIndex;
});

function render() {
  chart.innerHTML = "";

  const maxCount = Math.max(...categories.map(c => c.count), 1);
  const scale = CHART_HEIGHT / maxCount;
  const useDiscrete = categories.every(c => c.count <= MAX_VISIBLE_BLOCKS);

  categories.forEach((cat, i) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";

    // Count label (top)
    const countLabel = document.createElement("div");
    countLabel.textContent = cat.count;
    countLabel.style.fontWeight = "bold";
    countLabel.style.marginBottom = "4px";

    // Bar container
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = "36px";
    bar.style.height = `${cat.count * scale}px`;
    bar.style.display = "flex";
    bar.style.flexDirection = "column-reverse";
    bar.style.cursor = "ns-resize";
    bar.onselectstart = () => false;
    
    drawBar(bar, cat.count, scale, useDiscrete);

    // Drag behavior
    let startY = 0;
    let startCount = 0;

    bar.addEventListener("pointerdown", e => {
      document.body.classList.add("noselect");

      draggingIndex = i;
      dragStartY = e.clientY;
      dragStartCount = cat.count;

      const currentMax = Math.max(...categories.map(c => c.count), 1);
      dragStartScale = CHART_HEIGHT / currentMax || 1;

      isDragging = true;  

      bar.setPointerCapture(e.pointerId);
    });


    bar.addEventListener("pointerup", e => {
      document.body.classList.remove("noselect");

      draggingIndex = null;
      isDragging = false;   // ⬅ ADD THIS

      bar.releasePointerCapture(e.pointerId);
      render();
    });

    bar.addEventListener("pointercancel", e => {
      document.body.classList.remove("noselect");

      draggingIndex = null;
      isDragging = false;   // ⬅ ADD THIS

      bar.releasePointerCapture(e.pointerId);
    });

    bar.addEventListener("pointerdown", () => {
      bar.style.opacity = "0.85";
    });

    bar.addEventListener("pointerup", () => {
      bar.style.opacity = "1";
    });


    // Count input (updates on blur)
    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.value = cat.count;
    countInput.style.width = "40px";
    function commitCountChange() {
      const newVal = Math.max(0, Number(countInput.value));
      if (newVal === cat.count) return;

      const oldMax = Math.max(...categories.map(c => c.count), 1);

      cat.count = newVal;

      const newMax = Math.max(...categories.map(c => c.count), 1);
      const scaleChanged = newMax !== oldMax;

      const newScale = CHART_HEIGHT / newMax;
      const newUseDiscrete = categories.every(c => c.count <= MAX_VISIBLE_BLOCKS);

      if (!scaleChanged) {
        // Only redraw this bar
        countLabel.textContent = cat.count;
        drawBar(bar, cat.count, newScale, newUseDiscrete);
      } else {
        // Redraw ALL bars in place (no DOM rebuild → tab stays stable)
        const wrappers = chart.children;

        categories.forEach((c, idx) => {
          const wrapper = wrappers[idx];
          if (!wrapper) return;

          const label = wrapper.children[0];
          const barDiv = wrapper.children[1];

          label.textContent = c.count;
          drawBar(barDiv, c.count, newScale, newUseDiscrete);
        });
      }

      updateOutput();
    }

    countInput.onblur = commitCountChange;

    countInput.onkeydown = e => {
      if (e.key === "Enter") {
        countInput.blur();   // triggers onblur → commitCountChange()
      }
    };

    countInput.onfocus = () => {
      countInput.select();
    };
    
    // Name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = cat.name;
    nameInput.style.width = "40px";
    nameInput.onblur = () => {
      const cleaned = sanitizeLabel(nameInput.value);

      if (cleaned !== nameInput.value) {
        // briefly highlight to show correction
        nameInput.style.borderColor = "red";
        setTimeout(() => nameInput.style.borderColor = "", 600);
      }

      nameInput.value = cleaned;
      cat.name = cleaned;
      updateOutput();
    };
    nameInput.oninput = () => {
      const pos = nameInput.selectionStart;
      nameInput.value = sanitizeLabel(nameInput.value);
      nameInput.setSelectionRange(pos, pos); // keep cursor stable
    };

    wrapper.appendChild(countLabel);
    wrapper.appendChild(bar);
    wrapper.appendChild(countInput);
    wrapper.appendChild(nameInput);

    chart.appendChild(wrapper);
  });

  updateOutput();
}

function updateOutput() {
  const values = [];
  categories.forEach(cat => {
    for (let i = 0; i < cat.count; i++) {
      values.push(cat.name);
    }
  });
  output.value = values.join(", ");
}

// Controls
document.getElementById("addCat").onclick = () => {
  catCountInput.value++;
  syncCategoryCount(Number(catCountInput.value));
};

document.getElementById("removeCat").onclick = () => {
  catCountInput.value = Math.max(1, catCountInput.value - 1);
  syncCategoryCount(Number(catCountInput.value));
};

catCountInput.onblur = e => {
  syncCategoryCount(Number(e.target.value));
};

document.getElementById("copyOutput").onclick = () => {
  navigator.clipboard.writeText(output.value);
};

// Initialize
syncCategoryCount(Number(catCountInput.value));
