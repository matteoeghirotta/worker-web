// import script
const diceScript = document.createElement("script");
diceScript.src = "./src/dice.js";
document.head.appendChild(diceScript);

// constants
const time = document.getElementById("time"),
  diceSetup = document.getElementById("dicesetup"),
  output = document.getElementById("output"),
  intlTime = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3
  });

// start clock
showTime();

// start dice emulation
diceSetup.addEventListener("submit", startDiceRun);

let runStarted;
function startDiceRun(e) {
  e.preventDefault();

  if (runStarted) return;
  runStarted = performance.now();

  logMessage(`starting dice throw at ${timeFormat()}...`, true);

  const cfg = {};
  Array.from(diceSetup.elements).forEach((f) => {
    if (f.id) cfg[f.id] = f.type === "checkbox" ? f.checked : f.value;
  });

  // result
  if (cfg.worker) {
    // run on worker thread
    const worker = new Worker("./src/worker.js");

    // receive data from worker
    worker.onmessage = function (e) {
      endDiceRun(e.data);
    };

    // post data to worker
    worker.postMessage(cfg);
  } else {
    // run on main thread
    setTimeout(() => endDiceRun(diceRun(cfg.throws, cfg.dice, cfg.sides)), 10);
  }
}

// report dice run results
function endDiceRun(stat) {
  logMessage(`complete dice throw at ${timeFormat()}`);
  logMessage(
    `execution time: ${Math.ceil(performance.now() - runStarted)} ms `
  );
  runStarted = false;

  stat.forEach((s, i) => {
    if (s) logMessage(`${i} total: ${s} occurances`);
  });
}

// show clock
function showTime() {
  time.textContent = timeFormat();
  requestAnimationFrame(showTime);
}

// output to log
function logMessage(msg = "", clear) {
  output.textContent = (clear ? "" : output.textContent) + msg + "\n";
}

// format current time
function timeFormat() {
  return intlTime.format(new Date());
}
