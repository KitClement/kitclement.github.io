const tableBody = document.querySelector("#mixerTable tbody");
const output = document.getElementById("output");

let categories = [];

function render() {
  tableBody.innerHTML = "";

  categories.forEach((cat, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <input type="text" value="${cat.name}">
      </td>
      <td>
        <input type="number" min="0" value="${cat.count}" style="width:80px;">
      </td>
      <td>
        <button data-i="${i}">✕</button>
      </td>
    `;

    const [nameInput, countInput] = row.querySelectorAll("input");

    nameInput.oninput = e => {
      cat.name = e.target.value;
      updateOutput();
    };

    countInput.oninput = e => {
      cat.count = Number(e.target.value);
      updateOutput();
    };

    row.querySelector("button").onclick = () => {
      categories.splice(i, 1);
      render();
    };

    tableBody.appendChild(row);
  });

  updateOutput();
}

function updateOutput() {
  const values = [];
  categories.forEach(cat => {
    for (let i = 0; i < cat.count; i++) {
      if (cat.name.trim() !== "") {
        values.push(cat.name.trim());
      }
    }
  });
  output.value = values.join(", ");
}

document.getElementById("addCategory").onclick = () => {
  categories.push({ name: "", count: 1 });
  render();
};

document.getElementById("copyOutput").onclick = () => {
  navigator.clipboard.writeText(output.value);
};

// start with 2 categories by default
categories = [
  { name: "A", count: 5 },
  { name: "B", count: 5 }
];

render();
