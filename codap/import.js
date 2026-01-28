const fileInput = document.getElementById("csvfile");
const picker    = document.getElementById("variablePicker");
const colOut    = document.getElementById("columnOutput");
const copyCol   = document.getElementById("copyCol");
let headers     = [], rows = [];

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result.split("\n");
    headers = text.shift().split(",");
    rows = text.map(r => r.split(","));
    populatePicker();
  };
  reader.readAsText(file);
};

function populatePicker() {
  picker.innerHTML = "";
  headers.forEach((h, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = h;
    picker.appendChild(opt);
  });
}

picker.onchange = () => {
  const idx = +picker.value;
  const column = rows.map(r => r[idx]).join("\n");
  colOut.value = column;
};

copyCol.onclick = () => {
  navigator.clipboard.writeText(colOut.value);
};
