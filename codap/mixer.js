const chart = document.getElementById("chart");
const output = document.getElementById("output");
const catCountInput = document.getElementById("catCount");

let categories = [];
const MAX_VISIBLE_BLOCKS = 40;
const CHART_HEIGHT = 260;

function syncCategoryCount(n) {
  while (categories.length < n) {
    categories.push({ name: `Cat ${categories.length + 1}`, count: 10 });
  }
  while (categories.length > n) {
    categories.pop();
  }
  render();
}

function render() {
  chart.innerHTML = "";

  const maxCount = Math.max(...categories.map(c => c.count), 1);
  const scale = CHART_HEIGHT / maxCount;

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


    // Discrete blocks vs smooth bar
    if (cat.count <= MAX_VISIBLE_BLOCKS) {
      for (let j = 0; j < cat.count; j++) {
        const block = document.createElement("div");
        block.style.height = `${scale - 1}px`;
        block.style.marginTop = "1px";
        block.style.background = "#4fa3d1";
        bar.appendChild(block);
      }
    } else {
      bar.style.background = "#4fa3d1";
    }

    // Drag behavior
    let startY = 0;
    let startCount = 0;

    bar.addEventListener("pointerdown", e => {
      bar.setPointerCapture(e.pointerId);
      startY = e.clientY;
      startCount = cat.count;
    });

    bar.addEventListener("pointermove", e => {
      if (!bar.hasPointerCapture(e.pointerId)) return;

      const delta = startY - e.clientY;
      const newCount = Math.max(
        0,
        Math.round(startCount + delta / scale)
      );

      if (newCount !== cat.count) {
        cat.count = newCount;
        render();
      }
    });

bar.addEventListener("pointerup", e => {
  bar.releasePointerCapture(e.pointerId);
});

bar.addEventListener("pointercancel", e => {
  bar.releasePointerCapture(e.pointerId);
});


    // Count input (updates on blur)
    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.value = cat.count;
    countInput.style.width = "40px";
    countInput.onblur = e => {
      cat.count = Math.max(0, Number(e.target.value));
      render();
    };

    // Name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = cat.name;
    nameInput.style.width = "40px";
    nameInput.onblur = e => {
      cat.name = e.target.value;
      updateOutput();
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
