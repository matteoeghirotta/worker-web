importScripts("./dice.js");

onmessage = function (e) {
  // start calculation
  const cfg = e.data;
  const stat = diceRun(cfg.throws, cfg.dice, cfg.sides);

  // return to main thread
  postMessage(stat);
};
