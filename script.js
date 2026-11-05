/*
  Google Sheet columns (first row is a header):
  Desktop | Image URL
  Example:
  Office  | https://example.com/office-wallpaper.jpg
  Home    | https://example.com/home-wallpaper.jpg

  Pick a row with:
  https://YOUR-USERNAME.github.io/YOUR-REPO/?desktop=Office
  or ?desktop=Home
  You can also use ?desktop=1 to select the first data row, ?desktop=2 for second, etc.
*/

const SHEET_ID = "1jdVmccsR1wfN1PmkuF9TOVhXsiHO5aF7I3MgNNC5T8Q";
const SHEET_TAB = "Sheet1"; // Change this to the exact tab name at the bottom of your Google Sheet.
const REFRESH_EVERY_MINUTES = 15;

const wallpaper = document.getElementById("wallpaper");
const message = document.getElementById("message");
const desktopLabel = document.getElementById("desktop-label");
const reloadButton = document.getElementById("reload");

function showMessage(text) { message.textContent = text || ""; }

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  document.getElementById("date").textContent =
    now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
updateClock();
setInterval(updateClock, 1000);

function getCell(row, index) {
  const cell = row.c && row.c[index];
  return cell && (cell.f ?? cell.v) != null ? String(cell.f ?? cell.v).trim() : "";
}

function loadSheetJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = "__wallpaperSheetCallback";
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheet did not respond. Check that it is shared publicly."));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = data => {
      cleanup();
      if (!data || !data.table) {
        reject(new Error("The sheet returned no table data."));
        return;
      }
      resolve(data.table);
    };

    const script = document.createElement("script");
    script.onerror = () => {
      cleanup();
      reject(new Error("Could not load the Google Sheet."));
    };
    const params = new URLSearchParams({
      tqx: `out:json;responseHandler:${callbackName}`,
      sheet: SHEET_TAB
    });
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?${params}`;
    document.head.appendChild(script);
  });
}

function findImageRow(table) {
  const rows = table.rows || [];
  const headers = (table.cols || []).map(col => String(col.label || "").trim().toLowerCase());
  let desktopColumn = headers.findIndex(h => ["desktop", "device", "name", "screen"].includes(h));
  let imageColumn = headers.findIndex(h => ["image url", "image", "wallpaper", "background", "link", "url"].includes(h));

  // If headers are not named as expected, use the first two columns.
  if (desktopColumn < 0) desktopColumn = 0;
  if (imageColumn < 0) imageColumn = 1;

  const dataRows = rows.map(row => ({
    name: getCell(row, desktopColumn),
    url: getCell(row, imageColumn)
  })).filter(row => row.url);

  const requested = new URLSearchParams(location.search).get("desktop");
  if (!dataRows.length) throw new Error("No image links found. Add Desktop and Image URL columns to the sheet.");

  let selected;
  if (requested && /^\d+$/.test(requested)) {
    selected = dataRows[Number(requested) - 1];
  } else if (requested) {
    selected = dataRows.find(row => row.name.toLowerCase() === requested.toLowerCase());
  } else {
    selected = dataRows[0];
  }

  if (!selected) throw new Error(`No wallpaper row found for desktop "${requested}".`);
  return selected;
}

async function loadWallpaper() {
  showMessage("Loading wallpaper…");
  try {
    const table = await loadSheetJsonp();
    const selected = findImageRow(table);
    if (!/^https?:\/\//i.test(selected.url)) {
      throw new Error("The selected image link must start with http:// or https://.");
    }

    // Preload the image before applying it, so a broken URL does not replace the current wallpaper.
    const image = new Image();
    image.onload = () => {
      wallpaper.style.backgroundImage = `url("${selected.url.replace(/["\\]/g, "\\$&")}")`;
      desktopLabel.textContent = selected.name || "Wallpaper";
      showMessage("");
    };
    image.onerror = () => showMessage("The image link could not be opened. Use a direct, publicly accessible image URL.");
    image.src = selected.url;
  } catch (error) {
    showMessage(error.message || "Unable to load the wallpaper.");
    console.error(error);
  }
}

reloadButton.addEventListener("click", loadWallpaper);
loadWallpaper();
setInterval(loadWallpaper, REFRESH_EVERY_MINUTES * 60 * 1000);
