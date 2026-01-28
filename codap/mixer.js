const chart = document.getElementById("chart");
const output = document.getElementById("output");
const catCountInput = document.getElementById("catCount");

let categories = [];

const MAX_COUNT = 50;
const BAR_SCALE = 5; // pixels per unit

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

  categories.forEach((cat, i) => {
    const wrapper = document.createElement("div");
    wrapper.style.textAlign = "center";

    const bar = document.createElement("div");
    bar.style.height = `${cat.count * BAR_SCALE}px`;
    bar.style.width = "60px";
    bar.style.background = "#4fa3d1";
    bar.style.cursor = "ns-resize";

    // Drag behavior
    let startY, startCount;
    bar.onmousedown = e => {
      startY = e.clientY;
      startCount = cat.count;

      document.onmousemove = e2 => {
        const delta = startY - e2.clientY;
        cat.count = Math.max(
          0,
          Math.min(MAX_COUNT, startCount + Math.round(delta / BAR_SCALE))
        );
        render();
      };

      document.onmouseup = () => {
        document.onmousemove = null;
      };
    };

    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.value = cat.count;
    countInput.style.width = "60px";
    countInput.oninput = e => {
      cat.count = Math.max(0, Number(e.target.value));
      render();
    };

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = cat.name;
    nameInput.style.width = "60px";
    nameInput.oninput = e => {
      cat.name = e.target.value;
      updateOutput();
    };

    const label = document.createElement("div");
    label.textContent = cat.count;

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
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

catCountInput.oninput = e => {
  syncCategoryCount(Number(e.target.value));
};

document.getElementById("copyOutput").onclick = () => {
  navigator.clipboard.writeText(output.value);
};

// Initialize
syncCategoryCount(Number(catCountInput.value));
