const validIds = ["256791", "PCVU2567913", "3665828"];

const input = document.getElementById("lookupInput");
const pullBtn = document.getElementById("pullBtn");
const statusBox = document.getElementById("statusBox");
const bookingResult = document.getElementById("bookingResult");
const emptyState = document.getElementById("emptyState");
const resultLog = document.getElementById("resultLog");
const driverDemo = document.getElementById("driverDemo");
const photoBtn = document.getElementById("photoBtn");

const clean = (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function setStatus(message, good) {
  statusBox.textContent = message;
  statusBox.className = `status-box ${good ? "ok" : "warn"}`;
}

function resetActionPanels() {
  resultLog.classList.remove("show");
  driverDemo.classList.remove("show");
}

function pullBooking() {
  const found = validIds.includes(clean(input.value));

  bookingResult.classList.toggle("show", found);
  emptyState.style.display = found ? "none" : "grid";
  resetActionPanels();

  if (found) {
    setStatus("Booking matched. Gateman can now confirm tanker, customer and product.", true);
  } else {
    setStatus("No booking found. Use manual fallback or ask supervisor to check the booking paperwork.", false);
  }
}

pullBtn.addEventListener("click", pullBooking);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") pullBooking();
});

document.querySelectorAll("[data-fill]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.fill || "";
    pullBooking();
  });
});

photoBtn.addEventListener("click", () => {
  setStatus("Plate photo demo selected. Real camera/OCR is not connected in this frontend prototype.", true);
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    resultLog.textContent = button.dataset.action || "";
    resultLog.classList.add("show");

    if (button.dataset.driver === "1") {
      driverDemo.classList.add("show");
    }
  });
});
