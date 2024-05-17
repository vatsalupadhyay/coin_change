
const btnDynamic = document.getElementById("btnDynamic");
const btnGreedy = document.getElementById("btnGreedy");
const btnPause = document.getElementById("btnPause");
const btnPlay = document.getElementById("btnPlay");
const btnReset = document.getElementById("btnReset");
const btnSkip = document.getElementById("btnSkip");

btnDynamic.onclick = () => {
  runSimulation();
};

btnGreedy.onclick = () => {
  runGreedy();
};

btnPause.onclick = () => {
  pause();
};

btnPlay.onclick = () => {
  play();
};

btnReset.onclick = () => {
  pause();
  btnPlay.style.display = "none";
  if (greedyRunning) {
    greedyRunning = false;
    played = 0;
    wasPausedGreedy = false;
    iGreedy = 0;
    runGreedy();
  } 
  else if (dynamicRunning) {
    dynamicRunning = false;
    iDynamic = 1;
    jDynamic = 1;
    wasPaused = false;
    runSimulation();
  } 
  else if (backtrackRunning) {
    backtrackRunning = false;
    wasPaused = false;
    runSimulation();
  }
};

btnSkip.onclick = () => {
  pause();
  btnPlay.style.display = "none";
  if (greedyRunning) {
    greedyRunning = false;
    tempAmount = 0;
    step = 1;
    played = 1;
    wasPausedGreedy = true;
    wasPaused = false;
    iGreedy = 0;
    const coinsInput = document.getElementById("coins").value;
    const amount = parseInt(document.getElementById("amount").value);
    let coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, coinSet } = coinChangeGreedy(coins, amount);

    displaySimulationGreedy(tempAmount, coins, result, coinSet, coins.length + 1);
  } 
  else if (dynamicRunning) {
    dynamicRunning = false;
    iDynamic = 1;
    jDynamic = 1;
    wasPaused = false;
    const amount = parseInt(document.getElementById("amount").value);
    const coinsInput = document.getElementById("coins").value;
    const coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, table } = coinChangeDynamic(amount, coins);
    const coinsUsed = findCoinsUsed(table);
    displayBacktracking(coinsUsed, table, result, 0, 0, 0);
  } 
  else if (backtrackRunning) {
    wasPaused = false;
    backtrackRunning = false;
    const amount = parseInt(document.getElementById("amount").value);
    const coinsInput = document.getElementById("coins").value;
    const coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, table } = coinChangeDynamic(amount, coins);
    const coinsUsed = findCoinsUsed(table);
    displayBacktracking(coinsUsed, table, result, 0, 0, 0);
  }
};

//loop variables
let iDynamic = 1;
let jDynamic = 1;
let iBacktrack;
let jBacktrack;
let iGreedy = 0;
let step;
let tempAmount;
let wasPausedGreedy = false;
let wasPaused = false;
let played = 0;


//interval variables
let greedyInterval;
let dynamicInterval;
let backtrackInterval;

//running variables
let dynamicRunning = false;
let greedyRunning = false;
let backtrackRunning = false;

function runSimulation() {
  if (dynamicRunning || greedyRunning || backtrackRunning) {
    // window.alert('Simulation already running. Please wait or end the Simulation.');
    return;
  }

  

  const amount = parseInt(document.getElementById("amount").value);
  const coinsInput = document.getElementById("coins").value;

  if (isNaN(amount)) {
    window.alert("Enter Amount");
    return;
  }
  if (isNaN(parseFloat(coinsInput))) {
    window.alert("Enter Coins");
    return;
  }

  btnPause.style.display = "block";
  btnReset.style.display = "block";
  btnSkip.style.display = "block";
  btnDynamic.style.display = "none";
  btnGreedy.style.display = "none";

  dynamicRunning = true;

  const input = document.getElementById("btnSpeed").innerText;
  const numberString = input.match(/[\d\.]+/)[0];
  const number = parseFloat(numberString);

  step = 1.75*(0-number) + 3.75;
  const coins = coinsInput.split(" ").map((coin) => parseInt(coin));
  const { result, table } = coinChangeDynamic(amount, coins);
  // console.log(table);
  const coinsUsed = findCoinsUsed(table);
  // console.log(coinsUsed);
  displaySimulationDynamic(result, table, 1, 1, coinsUsed, step);

  iBacktrack = table.length - 1;
  jBacktrack = table[0].length - 1;
}

function coinChangeDynamic(amount, coins) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  const table = [];
  const amt = [];
  for (let i = 0; i <= amount; i++) {
    amt.push(i);
  }
  table.push(amt);
  for (const coin of coins) {
    const row = [coin];
    for (let i = 1; i <= amount; i++) {
      const withoutCoin = dp[i];
      const withCoin = i >= coin ? dp[i - coin] + 1 : Infinity;

      dp[i] = Math.min(withoutCoin, withCoin);
      row.push(dp[i]);
    }
    table.push(row);
  }

  return { result: dp[amount] === Infinity ? -1 : dp[amount], table };
}

function displaySimulationDynamic(result, table, i, j, coinsUsed, step) {
  const outputDiv = document.getElementById("output");
  if (result === -1) {
    outputDiv.innerHTML = "No valid combination.";
    return;
  }
  if (iDynamic == 1 && jDynamic == 1)
    outputDiv.innerHTML =
      "Create a Table of size (No. of coins)x(Amount from 1)";

  const explainDiv = document.getElementById("explain");
  if (iDynamic == 1 && jDynamic == 1)
    explainDiv.innerHTML = "Calculate Minimum No. of coins required.";

  const valueDiv = document.getElementById("valueDisplay");
  if (iDynamic == 1 && jDynamic == 1)
    valueDiv.innerHTML = "";

  const tableContainer = document.getElementById("table-container");
  if (iDynamic == 1 && jDynamic == 1) tableContainer.innerHTML = "";

  if (iDynamic == 1 && jDynamic == 1)
    displayTableSim(tableContainer, table, -1, -1, 0);

  dynamicInterval = setInterval(() => {
    if (i >= table.length) {
      iDynamic = 1;
      jDynamic = 1;
      clearInterval(dynamicInterval);
      dynamicRunning = false;
      wasPaused = false;
      displayBacktracking(coinsUsed, table, result, step, iBacktrack, jBacktrack);
      valueDiv.innerHTML = "";
      return;
    }
    displayTableSim(tableContainer, table, i, j, step);

    if (j >= table[0].length) {
      j = 1;
      jDynamic = 1;
      i++;
      iDynamic++;
      return;
    }

    {
      //Output and Explain div rules
      //first row
      if (i == 1) {
        outputDiv.innerHTML = `Calculating number of coins for sum ${j} using denomination '${table[i][0]}'.`;
        explainDiv.innerHTML = `No. of denomination '${table[i][0]}' coins required for Sum ${j}`;
        valueDiv.innerHTML = "";
      }
      //Copying from above
      else if (j < table[i][0]) {
        outputDiv.innerHTML = `Calculating number of coins for sum ${j}, denomination '${table[i][0]}' can be used with above denomination(s)`;
        explainDiv.innerHTML = `Denomination greater than sum, take above value`;
        valueDiv.innerHTML = "";
      }
      //sum equal to coin
      else if (j == table[i][0]) {
        outputDiv.innerHTML = `Calculating number of coins for sum ${j}, denomination '${table[i][0]}' can be used with above denomination(s)`;
        explainDiv.innerHTML = `Only 1 coin required.`;
        valueDiv.innerHTML = "";
      } 
      else {
        outputDiv.innerHTML = `Calculating number of coins for sum ${j}, denomination '${table[i][0]}' can be used with above denomination(s)`;
        explainDiv.innerHTML = `Min(dp[row-1], dp[sum - coin] + 1 ) = `;
        valueDiv.innerHTML = `${table[i][j]}`;
      }
    }
    j++; // Move to the next column
    jDynamic++;
  }, step * 1000); 
}

function displayTableSim(container, data, highlightRow, highlightColumn, step) {
  step += (step * 1000) / 2;
  const table = document.createElement("table");
  const header = table.createTHead();
  const body = table.createTBody();

  // Create header row
  const headerRow = header.insertRow();
  headerRow.insertCell().textContent = "Coins";

  for (let i = 1; i < data[0].length; i++) {
    headerRow.insertCell().textContent = `Sum ${i}`;
  }

  // Create data rows
  for (let j = 1; j < data.length; j++) {
    const dataRow = body.insertRow();
    for (let k = 0; k < data[j].length; k++) {
      const cellElement = dataRow.insertCell();

      //highlight border

      //on that cell
      if (highlightRow == -1 && highlightColumn == -1)
        cellElement.style.borderColor = "rgba(0, 0, 0, 0)";
      else if (j === highlightRow && k === highlightColumn)
        {cellElement.style.borderColor = "#ffffff";
        cellElement.style.color = "#51e358";}
      //one coin required
      else if (j === highlightRow && k === highlightColumn && data[j][k] == 1)
        cellElement.style.borderColor = "#ffffff";
      //copying from above
      else if (j === highlightRow - 1 && k === highlightColumn && data[highlightRow][0] > data[0][k]) {
        cellElement.style.borderColor = "#ffffff";
        setTimeout(() => {
          cellElement.style.borderColor = "rgba(0, 0, 0, 0)";
        }, step);
      }
      //comparing two values
      //upper value
      else if (j === highlightRow - 1 && k === highlightColumn && data[highlightRow][k] != 1) {
        cellElement.style.borderColor = "#ffffff";
        setTimeout(() => {
          cellElement.style.borderColor = "rgba(0, 0, 0, 0)";
        }, step);
      }
      //left value
      else if (j === highlightRow && k == data[0][highlightColumn] - data[j][0] && j != 1 && k != 0) {
        cellElement.style.borderColor = "#ffffff";
        setTimeout(() => {
          cellElement.style.borderColor = "rgba(0, 0, 0, 0)";
        }, step);
      }

      //values display

      const value = data[j][k] === Infinity ? "-" : data[j][k];

      //first column
      if (k == 0) cellElement.textContent = value;
      //previuos row
      else if (j < highlightRow) cellElement.textContent = value;
      //previous values, same row
      else if (j === highlightRow && k < highlightColumn)
        cellElement.textContent = value;
      //rest hidden
      else if (j != highlightRow || k != highlightColumn)
        cellElement.textContent = "";
      setTimeout(() => {
        if (j === highlightRow && k === highlightColumn)
          cellElement.textContent = value;
      }, step);
    }
  }

  container.innerHTML = "";
  container.appendChild(table);
}

function findCoinsUsed(table) {
  let i = table.length - 1;
  let j = table[0].length - 1;
  const coinsUsed = [];

  while (j != 0) {
    while (table[i][j] == table[i - 1][j] && i > 1) {
      i--;
    }
    coinsUsed.push(table[i][0]);
    j -= table[i][0];
  }

  return coinsUsed;
}

function displayTableBack(coinIndex, container, data, highlightRow, highlightColumn) {
  const table = document.createElement("table");
  const header = table.createTHead();
  const body = table.createTBody();

  // Create header row
  const headerRow = header.insertRow();
  headerRow.insertCell().textContent = "Coins";

  for (let i = 1; i < data[0].length; i++) {
    headerRow.insertCell().textContent = `Sum ${i}`;
  }

  // Create data rows
  for (let j = 1; j < data.length; j++) {
    const dataRow = body.insertRow();
    for (let k = 0; k < data[j].length; k++) {
      const cellElement = dataRow.insertCell();

      //highlight border
      //on that cell
      if (highlightColumn === k && k === 0 && coinIndex.includes(j))
        cellElement.style.borderColor = "#ffffff";
      else if (j === highlightRow && k === highlightColumn)
        cellElement.style.borderColor = "#ffffff";
      //above cell
      else if (j === highlightRow - 1 && k === highlightColumn && k != 0)
        cellElement.style.borderColor = "#ffffff";
      //this coin was used
      else if (
        j === highlightRow &&
        k === 0 &&
        data[highlightRow][highlightColumn] !=
          data[highlightRow - 1][highlightColumn]
      )
        cellElement.style.borderColor = "#ffffff";
      // console.log(highlightColumn);
      //values display
      const value = data[j][k] === Infinity ? "-" : data[j][k];
      cellElement.textContent = value;
    }
  }

  container.innerHTML = "";
  container.appendChild(table);
}

function displayBacktracking(coinsUsed, table, result, step, i, j) {
  backtrackRunning = true;

  const outputDiv = document.getElementById("output");
  const explainDiv = document.getElementById("explain");
  const tableContainer = document.getElementById("table-container");

  if (iBacktrack == table.length - 1 && jBacktrack == table[0].length - 1) {
    outputDiv.innerHTML = "Backtracking";
    explainDiv.innerHTML = "Finding which coins were used";
  }

  const coinIndex = [];
  for (let k = 0; k < table.length; k++) {
    if (coinsUsed.includes(table[k][0])) coinIndex.push(k);
  }
  // console.log(coinIndex);
  backtrackInterval = setInterval(() => {
    displayTableBack(coinIndex, tableContainer, table, i, j);
    if (i === 0 || j === 0) {
      outputDiv.innerHTML = `Therefore, ${
        table[table.length - 1][table[0].length - 1]
      } coins have been used.`;
      explainDiv.innerHTML = `Combination of coins is (${coinsUsed.reverse()}).`;
      console.log("Dynamic simulation complete.");
      displayTableBack(coinIndex, tableContainer, table, i, j);
      backtrackRunning = false;
      wasPaused = false;
      iBacktrack = table.length - 1;
      jBacktrack = table[0].length - 1;
      btnReset.style.display = "none";
      btnSkip.style.display = "none";
      btnPause.style.display = "none";
      btnDynamic.style.display = "block";
      btnGreedy.style.display = "block";
      clearInterval(backtrackInterval);
      
    } else {
      if (table[i][j] === table[i - 1][j] && table.length > 2) {
        i--;
        iBacktrack--;
        outputDiv.innerHTML = `Sum remaining =  ${j}.`;
        explainDiv.innerHTML = `Upper value is same, move up.`;
      } else {
        // coinsUsed.push(table[i][0]);
        j -= table[i][0];
        jBacktrack -= table[i][0];
        outputDiv.innerHTML = `Sum remaining = Sum - Coin = ${j}.`;
        explainDiv.innerHTML = `No. of coins decreased when coin ${table[i][0]} was used, add it in solution.`;
      }
    }
  }, step * 1000);
}

function runGreedy() {
  if (dynamicRunning || greedyRunning || backtrackRunning) {
    // window.alert('Simulation already running. Please wait or end the Simulation.');
    return;
  }

  const coinsInput = document.getElementById("coins").value;
  const amount = parseInt(document.getElementById("amount").value);

  if (isNaN(amount)) {
    window.alert("Enter Amount");
    return;
  }
  if (isNaN(parseFloat(coinsInput))) {
    window.alert("Enter Coins");
    return;
  }

  btnPause.style.display = "block";
  btnReset.style.display = "block";
  btnSkip.style.display = "block";
  btnDynamic.style.display = "none";
  btnGreedy.style.display = "none";

  greedyRunning = true;

  const input = document.getElementById("btnSpeed").innerText;
  const numberString = input.match(/[\d\.]+/)[0];
  const number = parseFloat(numberString);

  step = 1.5*(0-number) + 3.5;

  let coins = coinsInput.split(" ").map((coin) => parseInt(coin));
  tempAmount = amount;

  const { result, coinSet } = coinChangeGreedy(coins, amount);

  displaySimulationGreedy(amount, coins, result, coinSet, 0, step);
}

function coinChangeGreedy(coins, amount) {
  let coinSet = [];
  let i = coins.length - 1;
  while (amount != 0) {
    if (amount >= coins[i]) {
      amount -= coins[i];
      coinSet.push(coins[i]);
    } else i--;
  }
  return { result: amount != 0 ? -1 : coinSet.length, coinSet };
}

function displaySimulationGreedy(amount, coins, result, coinSet, i, step) {
  const outputDiv = document.getElementById("output");
  const explainDiv = document.getElementById("explain");
  const tableContainer = document.getElementById("table-container");

  const table = document.createElement("table");
  const coinsSorted = coins.slice().sort((a, b) => b - a);
  if (result === -1) {
    outputDiv.innerHTML = "No valid combination.";
    return;
  } 
  else {
    if (i == 0) {
      outputDiv.innerHTML = "Coins Given";
      explainDiv.innerHTML = `Sum = ${amount}`;
      tableContainer.innerHTML = "";
      table, step = displayUnsorted(coins, table, tableContainer, step);
      iGreedy++;
      i++;
    }

    if (i == 1) {
      setTimeout(() => {
        table.deleteRow(0);
        const sorted = table.insertRow();
        for (coin of coinsSorted) {
          const cellElement = sorted.insertCell();
          cellElement.textContent = coin;
        }
        outputDiv.innerHTML = "Sort from highest to lowest";
        tableContainer.innerHTML = "";
        tableContainer.appendChild(table);
      }, step * 1000);
      step += step;;
      iGreedy++;
      i++;
    }

    if (i >= 2) {
      i = i - 2;
      greedyInterval = setInterval(() => {
        displayRow(tableContainer, coinsSorted, i, table, amount, coinSet);
        if (amount === 0 && tempAmount === 0) {
          outputDiv.innerHTML = `Therefore, ${result} coins have been used.`;
          explainDiv.innerHTML = `Combination of coins is (${coinSet}).`;
          console.log("Greedy simulation complete.");
          greedyRunning = false;
          wasPausedGreedy = false;
          iGreedy = 0;
          played = 0;
          i = 0;
          step = 1;
          btnPause.style.display = "none";
          btnReset.style.display = "none";
          btnSkip.style.display = "none";
          btnDynamic.style.display = "block";
          btnGreedy.style.display = "block";
          clearInterval(greedyInterval);
        } 
        else {
          if (amount >= coinsSorted[i]) {
            outputDiv.innerHTML = `Take coin ${coinsSorted[i]}.`;
            explainDiv.innerHTML = `Sum left = ${amount - coinsSorted[i]}`;
            amount -= coinsSorted[i];
            tempAmount -= coinsSorted[i];
          } 
          else {
            iGreedy++;
            i++;
            outputDiv.innerHTML = `Denomination greater than sum. Move to next`;
            explainDiv.innerHTML = `Sum left = ${amount}`;
          }
        }
      }, step * 1000);
    }
  }
}

function displayUnsorted(coins, table, container, step) {
  const unsorted = table.insertRow();
  for (coin of coins) {
    const cellElement = unsorted.insertCell();
    cellElement.textContent = coin;
    // console.log(coins);
  }
  container.innerHTML = "";
  
  container.appendChild(table);
  
  

  return table, step;
}

function displayRow(tableContainer, coinsSorted, i, table, amount, coinSet) {
  const row = table.insertRow();

  if (!wasPausedGreedy || played > 1 || wasPaused) {
    table.deleteRow(0);
  }

  for (let j = 0; j < coinsSorted.length; j++) {
    const cellElement = row.insertCell();
    cellElement.textContent = coinsSorted[j];
    if (i === j) cellElement.style.borderColor = "#ffffff";
    if (amount === 0 && coinSet.includes(coinsSorted[j]))
      cellElement.style.borderColor = "#ffffff";
  }
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
  played++;
}

function pause() {
  btnPlay.style.display = "block";
  btnPause.style.display = "none";
  if (greedyRunning) {
    wasPausedGreedy = true;
    clearInterval(greedyInterval);
  } 
  else if (dynamicRunning) {
    wasPaused = true;
    clearInterval(dynamicInterval);
  } 
  else if (backtrackRunning) {
    wasPaused = true;
    clearInterval(backtrackInterval);
  }
}

function play() {
  if (greedyRunning) played = 1;
  else played = 0;
  btnPlay.style.display = "none";
  btnPause.style.display = "block";
  if (greedyRunning) {
    const coinsInput = document.getElementById("coins").value;
    const amount = parseInt(document.getElementById("amount").value);
    let coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, coinSet } = coinChangeGreedy(coins, amount);

    displaySimulationGreedy(tempAmount, coins, result, coinSet, iGreedy, step);
  } 
  else if (dynamicRunning) {
    const amount = parseInt(document.getElementById("amount").value);
    const coinsInput = document.getElementById("coins").value;
    const coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, table } = coinChangeDynamic(amount, coins);
    const coinsUsed = findCoinsUsed(table);
    displaySimulationDynamic(result, table, iDynamic, jDynamic, coinsUsed, step);
  } 
  else if (backtrackRunning) {
    const amount = parseInt(document.getElementById("amount").value);
    const coinsInput = document.getElementById("coins").value;
    const coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, table } = coinChangeDynamic(amount, coins);
    const coinsUsed = findCoinsUsed(table);
    displayBacktracking(coinsUsed, table, result, step, iBacktrack, jBacktrack);
  }
}

function toggleDropdown() {
  var dropdown = document.getElementById("speedDropdown");
  dropdown.classList.toggle("show");
  document.addEventListener("click", function (event) {
    var isClickInside = dropdown.contains(event.target);
    var isButton = event.target.classList.contains("speed-control-btn");
    if (!isClickInside && !isButton) {
      dropdown.classList.remove("show");
    }
  });
}

function setSpeed(speed) {
  if (greedyRunning || dynamicRunning || backtrackRunning) pause();
  document.querySelector(".speed-control-btn").innerText = `${speed}x`;
  var dropdown = document.getElementById("speedDropdown");
  dropdown.classList.remove("show");
  if(dynamicRunning || backtrackRunning) step = 1.75*(0-speed) + 3.75;
  else if(greedyRunning) step = 1.5*(0-speed) + 3.5;
  
  if (greedyRunning || dynamicRunning || backtrackRunning) play();
  // Here you can set the speed of your player or do whatever you want with the selected speed
}

var tl = gsap.timeline()

tl.from("#loader h3",{
    x:40,
    opacity:0,
    duration:1,
    stagger:0.1
})
tl.to("#loader h3", {
    opacity:0,
    x:-40,
    duration:1,
    stagger:0.1

}) 
tl.to("#loader", {
opacity:0,
})
tl.to("#loader", {
    display:"none"
})
tl.from("h1,label, input, button",{
    y:100,
    opacity:0,
    duration:1,
    stagger:0.2
})