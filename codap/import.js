const fileInput = document.getElementById("csvfile");
const picker    = document.getElementById("variablePicker");
const colOut    = document.getElementById("columnOutput");
const copyCol   = document.getElementById("copyCol");
let headers     = [], rows = [];

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      // Escaped quote
      currentValue += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (currentValue.length > 0 || currentRow.length > 0) {
        currentRow.push(currentValue);
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  // Push final value
  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows;
}

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseCSV(reader.result);

    headers = parsed[0].map(h => h.trim());
    rows = parsed.slice(1);

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
  const column = rows
    .map(r => r[idx])
    .map(v => v ? v.trim() : "")     // remove line breaks and whitespace
    .filter(v => v !== "")           // remove empty rows
    .join(", ");

  colOut.value = column;
};

copyCol.onclick = () => {
  navigator.clipboard.writeText(colOut.value);
};
