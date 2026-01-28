const categoriesEl = document.getElementById("categories");
const outputEl     = document.getElementById("output");
const addBtn       = document.getElementById("addCategory");
const copyBtn      = document.getElementById("copyOutput");

let categoryList = [];

function render() {
  categoriesEl.innerHTML = "";
  categoryList.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "stack";
    div.innerHTML = `
      <input type="text" value="${c.name}" placeholder="Category">
      <input type="number" value="${c.count}" min="0">
      <button data-i="${i}" class="remove">✕</button>
    `;
    categoriesEl.appendChild(div);

    div.querySelector("input[type=number]").onchange = e => {
      c.count = +e.target.value;
      updateOutput();
    };
    div.querySelector("input[type=text]").onchange = e => {
      c.name = e.target.value;
      updateOutput();
    };
    div.querySelector(".remove").onclick = e => {
      categoryList.splice(i, 1);
      render();
    };
  });
  updateOutput();
}

function updateOutput() {
  let values = [];
  categoryList.forEach(c => {
    for (let i=0; i<c.count; i++) values.push(c.name || "");
  });
  outputEl.value = values.join(", ");
}

addBtn.onclick = () => {
  categoryList.push({ name: "", count: 1 });
  render();
};

copyBtn.onclick = async () => {
  try {
    await navigator.clipboard.writeText(outputEl.value);
    alert("Copied!");
  } catch (err) {
    alert("Clipboard failed:");
    console.error(err);
  }
};

render();
