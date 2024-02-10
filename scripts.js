// variables to use later
var currentPlayerCount = 0;
var playerData = {
  hitcounts:{
    20: 0,
    19: 0,
    18: 0,
    17: 0,
    16: 0,
    15: 0,
    bull: 0
  },
  name: '',
  points: 0,
  rounds: [[]]
}
gameObject = {};
// add event listener for page load
window.addEventListener('load', eventWindowLoaded, false);
function eventWindowLoaded(){
  checkHash();
}
function checkHash(){
  var hash = window.location.hash.substr(1);
  if (hash != ''){
    addLoadingGif();
    connectSocket();
    joinGame(hash);
  } else {
    hideAll();
  }
}
function connectSocket(){
  window.socket = io('https://dartstrackerapp.onrender.com');
  socket.on('error', function(e) {
    console.log("Error: " + JSON.stringify(e));
  });
}
function joinGame(gameId){
  console.log('Attempting to join game ' + gameId)
  var joinResponse = socket.emit('join game', gameId);
  socket.on('player joined', function(playerId) {
    console.log("New player " + playerId + " joined!");
  });
  socket.on('player left', function(playerId) {
    console.log("Player " + playerId + " left!");
  });
  socket.on('game joined', function(gameObject) {
    console.log("Successfully joined game " + gameObject._id);
    window.gameObject = gameObject;
    if(gameObject.gameType == "cricket"){
      joinCricket();
    }
    removeLoadingGif();
  });
  socket.on('start loading', function() {
    addLoadingGif();
    console.log("Loading data from server...");
  });
  socket.on('game updated', function(gameObject) {
    window.gameObject = gameObject;
    updateFromServer();
  });
  socket.on('update successful', function(gameObject) {
    console.log("Server updated!");
    removeLoadingGif();
  });

}
function updateFromServer(){
  if("states" in window.gameObject){
    if(window.gameObject.states.length > 0){
      let undoButton = document.getElementById('undo-button');
      undoButton.disabled = false;
    }
  }
  playerDivs = document.getElementsByClassName('player');
  for(let p = 0; p < playerDivs.length; p++){
    let playerHolder = playerDivs[p];
    if(playerHolder.id !='cricket-template'){
      let playersIndex = playerHolder.getAttribute('players-index');
      if(playersIndex >= window.gameObject.players.length){
        playerHolder.parentNode.removeChild(playerHolder);
      }
    }
  }
  if("players" in window.gameObject){
    for(let p = 0; p < window.gameObject.players.length; p++){
      displayPlayerData(p);
    }
  }
  displayPoints();
  removeBlockers();
  checkGameEnd();
  removeLoadingGif();
}

function createNewGameDoc(gameType){
  var newGameResponse = socket.emit('new game', gameType);
  socket.on('game created', function(gameObject){
    removeLoadingGif();
    gameId = gameObject.insertedId;
    console.log("New game " + gameId + " created!");
    history.pushState(null, null, '#' + gameId);
    joinGame(gameId);
  });
}
function hideAll(){
  var gametypes = document.getElementsByClassName('game-type');
  for (gtindex = 0; gtindex < gametypes.length; gtindex++) {
    gametypes[gtindex].style.display = 'none';
  }
  var gameselect = document.getElementById('game-select');
  gameselect.style.display = '';
  playerHolder = document.getElementById('player-holder');
  playerHolder.innerHTML = '';
  window.gameObject.players = [];
}

function hideSelect(){
  var gameselect = document.getElementById('game-select');
  gameselect.style.display = 'none';
}

function showCricket(){
  hideSelect();
  var cricketdiv = document.getElementById('cricket').style.display = '';
  var newCricketDiv = document.getElementById('new-cricket');
  newCricketDiv.style.display = 'none';
  var cricketStartDiv = document.getElementById('cricket-start');
  cricketStartDiv.style.display = 'flex';
}

function newCricket() {
  addLoadingGif();
  connectSocket();
  createNewGameDoc("cricket");
}

function joinCricket() {
  hideSelect();
  var cricketdiv = document.getElementById('cricket').style.display = '';
  var newCricketDiv = document.getElementById('new-cricket');
  newCricketDiv.style.display = 'flex';
  var cricketStartDiv = document.getElementById('cricket-start');
  cricketStartDiv.style.display = 'none';
  if("players" in window.gameObject){
    updateFromServer();
  } else {
    window.gameObject.players = [];
    window.gameObject.states = [];
    window.gameObject.previousGames = [];
    addCricketPlayer();
  }
}

var lowestRound = 0;
cricketTargetList = ['20', '19', '18', '17', '16', '15', 'bull'];
// add cricket player template to player holder
function addCricketPlayer(name = ""){
  playerTemplate = document.getElementById('cricket-template');
  playerHolder = document.getElementById('player-holder');
  currentPlayerIndex = window.gameObject.players.length;
  playerNumber = currentPlayerIndex + 1;
  newPlayerData = JSON.parse(JSON.stringify(playerData));
  if(name == ""){
    newPlayerData.name = 'Player ' + playerNumber;
  } else {
    newPlayerData.name = name;
  }
  window.gameObject.players.push(newPlayerData);
  newPlayerDiv = playerTemplate.cloneNode(true);
  newPlayerDiv.id = 'player-' + playerNumber;
  newPlayerDiv.setAttribute('players-index', currentPlayerIndex);
  newPlayerDiv.style.display = 'block';
  nameLabel = newPlayerDiv.getElementsByTagName('label')[0];
  nameLabel.innerHTML = newPlayerData.name;
  playerHolder.appendChild(newPlayerDiv);
  checkAllTargets();
  if(name == ""){
    updateServer();
  }
  displayPoints();
}
function addBlocker(){
  blockerDiv = document.createElement('div');
  blockerDiv.classList.add('blocker');
  document.getElementsByTagName('body')[0].appendChild(blockerDiv);
  return blockerDiv;
}
function removePlayerConfirm(element){
  let playerHolder = element.parentNode;
  let playersIndex = playerHolder.getAttribute('players-index');
  let thisPlayer = window.gameObject.players[playersIndex];
  blockerDiv = addBlocker();
  confirmPopup = document.createElement('div');
  confirmPopup.classList.add('pop-up');
  centerDiv = document.createElement('div');
  confirmPopup.appendChild(centerDiv);
  popupH2 = document.createElement('h2')
  popupH2.innerHTML = 'Remove ' + thisPlayer.name + '?';
  centerDiv.appendChild(popupH2);
  okButton = document.createElement('button');
  okButton.classList.add('green-button');
  okButton.innerHTML = 'Yup';
  okButton.setAttribute("onclick", "removePlayer(" + playersIndex + ")");
  centerDiv.appendChild(okButton);
  cancelButton = document.createElement('button');
  cancelButton.classList.add('red-button');
  cancelButton.innerHTML = 'Oops';
  cancelButton.addEventListener("click", removeBlockers);
  centerDiv.appendChild(cancelButton);
  blockerDiv.appendChild(confirmPopup);
}

function removeBlockers(){
  blockerDivs = document.getElementsByClassName('blocker');
  for(bd = 0; bd < blockerDivs.length; bd++){
    thisBlocker = blockerDivs[bd]
    thisBlocker.parentNode.removeChild(thisBlocker);
  }
}
// remove player from player template and players.
function removePlayer(playersIndex){
  blockerDiv = document.getElementsByClassName('blocker')[0];
  blockerDiv.parentNode.removeChild(blockerDiv);
  let playerHolder = document.getElementById('player-' + (parseInt(playersIndex) + 1));
  if(playersIndex == 0){
    window.gameObject.players.shift();
  } else if(playersIndex == (window.gameObject.players.length -1)){
    window.gameObject.players.pop();
  } else {
    window.gameObject.players.splice(playersIndex, 1);
  }
  playerHolder.parentNode.removeChild(playerHolder);
  for(i = 0; i < window.gameObject.players.length; i++){
    if(i >= playersIndex){
      thisPlayerHolder = document.getElementById('player-' + (i + 2));
      thisPlayerHolder.id = 'player-' + (i + 1);
      thisPlayerHolder.setAttribute('players-index', i);
    }
  }
  updateServer();
}
// adding input to update player name
function addNameInput(element){
  currentName = element.innerHTML;
  nameHolder = element.parentNode;
  element.style.display = 'none';
  var nameInput = document.createElement('input');
  nameInput.classList.add('name-input');
  nameInput.value = currentName;
  nameInput.addEventListener('submit', function (e) {updateName(nameInput);});
  nameInput.addEventListener('keydown', function (e) {
    if (e.code === 'Enter') {
        updateName(nameInput);
    }
  });
  var doneButton = document.createElement('button');
  doneButton.innerHTML = '✓';
  doneButton.classList.add('name-button')
  doneButton.setAttribute('onclick','updateName(this)');
  nameHolder.appendChild(nameInput);
  nameHolder.appendChild(doneButton);
  nameInput.focus();
  nameInput.select();
}
// updating name and removing input
function updateName(element){
  nameHolder = element.parentNode;
  nameInput = nameHolder.getElementsByTagName('input')[0];
  nameLabel = nameHolder.getElementsByTagName('label')[0];
  nameButton = nameHolder.getElementsByTagName('button')[0];
  newName = nameInput.value;
  if(newName.length > 0){
    nameLabel.innerHTML = newName;
    playerHolder = nameHolder.parentNode;
    playersIndex = playerHolder.getAttribute('players-index');
    window.gameObject.players[playersIndex].name = newName;
  }
  nameLabel.style.display = '';
  nameHolder.removeChild(nameButton);
  nameHolder.removeChild(nameInput);
  updateServer();
}
// updating display for a hit in cricket
function cricketHit(element, target, count){
  addState();
  rowHolder = element.parentNode;
  targetDisplay = rowHolder.getElementsByTagName('input')[0];
  playerHolder = rowHolder.parentNode.parentNode;
  playersIndex = playerHolder.getAttribute('players-index');
  dartsCounter = playerHolder.getElementsByClassName('darts')[0];
  roundCounter = playerHolder.getElementsByClassName('round')[0];
  doneButton = playerHolder.getElementsByClassName('done-button')[0];
  currentPlayer = window.gameObject.players[playersIndex];
  currentRound = currentPlayer.rounds.length;
  if(currentRound == 0){
    currentPlayer.rounds.push([]);
    currentRound = currentPlayer.rounds.length;
  }
  currentRoundIndex = currentRound - 1;
  currentRoundArray = currentPlayer.rounds[currentRoundIndex];
  currentDart = currentRoundArray.length;
  if(currentDart == 3){
    currentPlayer.rounds.push([]);
    currentRound = currentPlayer.rounds.length;
    currentRoundIndex = currentRound - 1;
    currentRoundArray = currentPlayer.rounds[currentRoundIndex];
    currentDart = currentRoundArray.length;
  }
  dartsLeft = 3 - (currentDart + 1);
  doneButton.innerHTML = 'Done';
  dartsCounter.innerHTML = dartsLeft.toString();
  roundCounter.innerHTML = currentRound.toString();
  currentRoundArray.push(target.toString() + "_" + count.toString());
  oldHitCounts = currentPlayer.hitcounts[target];
  currentPlayer.hitcounts[target] += count;
  targetHitCount = currentPlayer.hitcounts[target];
  if(targetHitCount == 1){
    targetDisplay.value = '\\';
  } else if (targetHitCount == 2){
    targetDisplay.value = 'X';
  } else {
    targetDisplay.value = '0';
    targetClosed = checkTargetClosed(target);
    if(!targetClosed){
      if(targetHitCount > 3){
        if(oldHitCounts < 3){
          newCount = count - (3 - oldHitCounts);
        } else {
          newCount = count;
        }
        calculatePoints(playersIndex, target, newCount);
      }
    } else {
      currentPlayer.hitcounts[target] = 3;
    }
  }
  let gameEnded = checkGameEnd();
  if(dartsLeft == 0 && !gameEnded){
    disablePlayerButtons(playerHolder);
  }
  updateServer();
}
function checkGameEnd(){
  let gameEnded = false;
  let maxPoints = 0 - Number.MAX_VALUE;
  for(let i = 0; i < window.gameObject.players.length; i++){
    let pointsPlayer = window.gameObject.players[i];
    if(pointsPlayer.points > maxPoints){
      maxPoints = pointsPlayer.points;
      winningPlayer = pointsPlayer;
    }
  }
  for(let i = 0; i < window.gameObject.players.length; i++){
    let thisPlayer = window.gameObject.players[i];
    let allClosed = true;
    for(let l = 0; l < window.cricketTargetList.length; l++){
      if(thisPlayer.hitcounts[cricketTargetList[l]] < 3){
        allClosed = false;
      }
    }
    if(allClosed && thisPlayer.points == maxPoints){
      gameEnded = true;
      playerDivs = document.getElementsByClassName('player');
      for(let p = 0; p < playerDivs.length; p++){
        if(playerDivs[p].id !='cricket-template'){
          disablePlayerButtons(playerDivs[p], false);
        }
      }
      blockerDiv = addBlocker();
      gameEndedPopup = document.createElement('div');
      gameEndedPopup.classList.add('pop-up');
      centerDiv = document.createElement('div');
      gameEndedPopup.appendChild(centerDiv);
      winnerH2 = document.createElement('h2')
      winnerH2.innerHTML = thisPlayer.name + " Wins!";
      centerDiv.appendChild(winnerH2);
      rematchButton = document.createElement('button');
      rematchButton.classList.add('green-button');
      rematchButton.innerHTML = 'Rematch';
      rematchButton.addEventListener("click", restartCricket);
      centerDiv.appendChild(rematchButton);
      chooseButton = document.createElement('button');
      chooseButton.classList.add('green-button');
      chooseButton.innerHTML = 'Choose Game';
      chooseButton.addEventListener("click", hideAll);
      centerDiv.appendChild(chooseButton);
      statsButton = document.createElement('button');
      statsButton.classList.add('green-button');
      statsButton.innerHTML = 'View Stats';
      statsButton.addEventListener('click', showAllStats);
      centerDiv.appendChild(statsButton);
      blockerDiv.appendChild(gameEndedPopup);
    }
  }
  return gameEnded
}
function restartCricket(){
  blockerDiv = document.getElementsByClassName('blocker')[0];
  blockerDiv.parentNode.removeChild(blockerDiv);
  playerHolder = document.getElementById('player-holder');
  playerHolder.innerHTML = '';
  oldPlayerData = JSON.parse(JSON.stringify(window.gameObject.players));
  oldStates = JSON.parse(JSON.stringify(window.gameObject.states));
  oldGameObject = {
    players: oldPlayerData,
    states: oldStates
  }
  if("previousGames" in window.gameObject){
    window.gameObject.previousGames.push(oldGameObject);
  } else {
    window.gameObject.previousGames = [oldGameObject];
  }
  window.gameObject.states = [];
  document.getElementById('undo-button').disabled = true;
  let playerNames = [];
  for (let i = 0; i < window.gameObject.players.length; i++){
    playerNames.push(window.gameObject.players[i].name);
  }
  window.gameObject.players = [];
  for (let i = 0; i < playerNames.length; i++){
    addCricketPlayer(playerNames[i]);
  }
  updateServer();
}
function calculatePoints(playersIndex, target, newCount) {
  thisPlayer = window.gameObject.players[playersIndex];
    otherTargetsOpen = true;
    for(p = 0; p < window.gameObject.players.length; p++){
      if(p != playersIndex){
        otherPlayer = window.gameObject.players[p];
        if(otherPlayer.hitcounts[target] > 2){
          otherTargetsOpen = false;
        }
      }
    }
    if(target == 'bull'){
      pointsValue = 25;
    } else {
      pointsValue = parseInt(target);
    }
    if(otherTargetsOpen){
      thisPlayer.points += pointsValue * newCount;
    } else {
      for(p = 0; p < window.gameObject.players.length; p++){
        if(p != playersIndex){
          otherPlayer = window.gameObject.players[p];
          if(otherPlayer.hitcounts[target] < 3){
            otherPlayer.points -= pointsValue * newCount;
          }
        }
      }
    }
  displayPoints();
}

function displayPoints(){
  let maxPoints = 0 - Number.MAX_VALUE;
  for(dp = 0; dp < window.gameObject.players.length; dp++){
    pointsPlayer = window.gameObject.players[dp];
    if(pointsPlayer.points > maxPoints){
      maxPoints = pointsPlayer.points;
    }
  }
  secondPoints = 0 - Number.MAX_VALUE;
  secondFound = false;
  for(dp = 0; dp < window.gameObject.players.length; dp++){
    pointsPlayer = window.gameObject.players[dp];
    if(pointsPlayer.points > secondPoints && pointsPlayer.points < maxPoints){
      secondFound = true;
      secondPoints = pointsPlayer.points;
    }
  }
  for(dp = 0; dp < window.gameObject.players.length; dp++){
    pointsPlayer = window.gameObject.players[dp];
    pointsText = pointsPlayer.points.toString();
    if(secondFound){
      if(pointsPlayer.points < maxPoints){
        pointsDifference = maxPoints - pointsPlayer.points;
        pointsText += ' <span class="red">(-' + pointsDifference + ')</span>'
      } else {
        pointsDifference = maxPoints - secondPoints;
        pointsText += ' <span class="green">(+' + pointsDifference + ')</span>'
      }
    }
    pointsPlayerDiv = document.getElementById('player-' + (dp + 1));
    scoreSpan = pointsPlayerDiv.getElementsByClassName('score')[0];
    scoreSpan.innerHTML = pointsText;
  }
}

function checkAllTargets(){
  for(t = 0; t < window.cricketTargetList.length; t++){
    thisTarget = window.cricketTargetList[t];
    checkTargetClosed(thisTarget);
  }
}

function checkTargetClosed(target){
  targetClosed = true;
  for(i = 0; i < window.gameObject.players.length; i++){
    thisPlayer = window.gameObject.players[i];
    if(thisPlayer.hitcounts[target] < 3){
      targetClosed = false;
    }
  }
  if(targetClosed){
    disableTargetButtons(target);
  } else {
    enableTargetButtons(target);
  }
  return targetClosed;
}

function disableTargetButtons(target){
  hitCounters = document.getElementsByClassName('hitcounter');
  for(i = 0; i < hitCounters.length; i++){
    thisHitCounter = hitCounters[i];
    thisTarget = thisHitCounter.getAttribute('hitcounter');
    if(thisTarget == target){
      rowHolder = thisHitCounter.parentNode;
      let targetPlayerDiv = rowHolder.parentNode.parentNode;
      if(!targetPlayerDiv.id.includes("template")){
        targetButtons = rowHolder.getElementsByTagName('button');
        for(b = 0; b < targetButtons.length; b++){
          targetButtons[b].disabled = true;
        }
      }
    }
  }
}
function enableTargetButtons(target){
  let hitCounters = document.getElementsByClassName('hitcounter');
  for(let i = 0; i < hitCounters.length; i++){
    let thisHitCounter = hitCounters[i];
    let thisTarget = thisHitCounter.getAttribute('hitcounter');
    if(thisTarget == target){
      rowHolder = thisHitCounter.parentNode;
      let targetPlayerDiv = rowHolder.parentNode.parentNode;
      let targetPlayersIndex = targetPlayerDiv.getAttribute('players-index');
      if(targetPlayersIndex != null){
        let targetPlayer = window.gameObject.players[targetPlayersIndex];
        let targetPlayerRound = targetPlayer.rounds.length;
        let dartsCounter = targetPlayerDiv.getElementsByClassName('darts')[0];
        if(dartsCounter.innerHTML != '0' && targetPlayerRound == window.lowestRound){
          let targetButtons = rowHolder.getElementsByTagName('button');
          for(b = 0; b < targetButtons.length; b++){
            targetButtons[b].disabled = false;
          }
        }
      }
    }
  }
}
// add state to player
function addState(){
  newPlayersData = JSON.parse(JSON.stringify(window.gameObject.players));
  window.gameObject.states.push(newPlayersData);
  let undoButton = document.getElementById('undo-button');
  undoButton.disabled = false;
}
function updateServer(){
  socket.emit('save game', window.gameObject);
  addLoadingGif();
}
function addLoadingGif(){
  loadingDiv = document.createElement('div');
  loadingDiv.classList.add('loading');
  document.getElementsByTagName('body')[0].appendChild(loadingDiv);
  loadingGif = document.createElement('img');
  loadingGif.src = 'images/loading-buffering.gif'
  loadingGif.alt = "loading";
  loadingGif.id = "loading-gif"
  loadingDiv.appendChild(loadingGif);
}
function removeLoadingGif(){
  loadingDivs = document.getElementsByClassName('loading');
  for(let ld = 0; ld < loadingDivs.length; ld++){
    thisLoadingDiv = loadingDivs[ld]
    thisLoadingDiv.parentNode.removeChild(thisLoadingDiv);
  }
}
// undo last player state
function undoButton(){
  let undoButton = document.getElementById('undo-button');
  statesLength = window.gameObject.states.length;
  if(statesLength > 0){
    loadPreviousState();
    if(statesLength == 1){
      undoButton.disabled = true;
    }
  } else {
    undoButton.disabled = true;
  }
}
function loadPreviousState(){
  statesLength = window.gameObject.states.length;
  previousState = window.gameObject.states[statesLength - 1];
  for(let i = 0; i < window.gameObject.players.length; i++){
    if(i < previousState.length){
      let thisPlayer = window.gameObject.players[i];
      thisPlayer.hitcounts = previousState[i].hitcounts;
      thisPlayer.name = previousState[i].name;
      thisPlayer.points = previousState[i].points;
      thisPlayer.rounds = previousState[i].rounds;
      displayPlayerData(i);
    }
  }
  displayPoints();
  window.gameObject.states.pop();
  updateServer();
}
function displayPlayerData(playersIndex){
  displayPlayer = window.gameObject.players[playersIndex];
  if(!displayPlayer){
    console.error("player " + playersIndex + " does not exits...");
  }
  displayPlayerDiv = document.getElementById('player-' + (parseInt(playersIndex) + 1));
  if(!displayPlayerDiv){
    displayPlayerDiv = createPlayerDivFromIndex(playersIndex);
  }
  nameLabel = displayPlayerDiv.getElementsByTagName('label')[0];
  nameLabel.innerHTML = displayPlayer.name;
  currentRound = displayPlayer.rounds.length;
  if(currentRound == 0){
    displayPlayer.rounds.push([]);
    currentRound = displayPlayer.rounds.length;
  }
  roundCounter = displayPlayerDiv.getElementsByClassName('round')[0];
  roundCounter.innerHTML = currentRound;
  currentRoundIndex = currentRound - 1;
  currentRoundArray = displayPlayer.rounds[currentRoundIndex];
  currentDart = currentRoundArray.length;
  dartsLeft = 3 - (currentDart);
  dartsCounter = displayPlayerDiv.getElementsByClassName('darts')[0];
  dartsCounter.innerHTML = dartsLeft;
  scoreCounter = displayPlayerDiv.getElementsByClassName('score')[0];
  enablePlayerButtons(displayPlayerDiv);
  hitCounters = displayPlayerDiv.getElementsByClassName('hitcounter');
  for(i = 0; i < hitCounters.length; i++){
    thisHitCounter = hitCounters[i];
    thisTarget = thisHitCounter.getAttribute('hitcounter');
    targetHitCount = displayPlayer.hitcounts[thisTarget];
    if(targetHitCount == 0){
      thisHitCounter.value = '';
    } else if(targetHitCount == 1){
      thisHitCounter.value = '\\';
    } else if (targetHitCount == 2){
      thisHitCounter.value = 'X';
    } else {
      thisHitCounter.value = '0';
    }
  }
  checkAllTargets();
  if(dartsLeft == 0){
    disablePlayerButtons(displayPlayerDiv);
  }
}
function createPlayerDivFromIndex(playersIndex){
  createPlayer = window.gameObject.players[playersIndex];
  playerTemplate = document.getElementById('cricket-template');
  playerHolder = document.getElementById('player-holder');
  playerNumber = playersIndex + 1;
  newPlayerDiv = playerTemplate.cloneNode(true);
  newPlayerDiv.id = 'player-' + playerNumber;
  newPlayerDiv.setAttribute('players-index', playersIndex);
  newPlayerDiv.style.display = 'block';
  nameLabel = newPlayerDiv.getElementsByTagName('label')[0];
  nameLabel.innerHTML = createPlayer.name;
  playerHolder.appendChild(newPlayerDiv);
  return newPlayerDiv;
}
// updating display for a miss in cricket
function cricketMiss(element){
  addState();
  rowHolder = element.parentNode;
  targetDisplay = rowHolder.getElementsByTagName('input')[0];
  playerHolder = rowHolder.parentNode.parentNode;
  dartsCounter = playerHolder.getElementsByClassName('darts')[0];
  roundCounter = playerHolder.getElementsByClassName('round')[0];
  playersIndex = playerHolder.getAttribute('players-index');
  currentPlayer = window.gameObject.players[playersIndex];
  currentRound = currentPlayer.rounds.length;
  if(currentRound == 0){
    currentPlayer.rounds.push([]);
    currentRound = currentPlayer.rounds.length;
  }
  currentRoundIndex = currentRound - 1;
  currentRoundArray = currentPlayer.rounds[currentRoundIndex];
  currentDart = currentRoundArray.length;
  dartsLeft = 3 - (currentDart + 1);
  for(i = 0; i <= dartsLeft; i++){
    currentRoundArray.push("miss");
  }
  dartsCounter.innerHTML = 0;
  element.innerHTML = "Miss";
  disablePlayerButtons(playerHolder);
  updateServer();
}
// disable buttons when no darts are left
function disablePlayerButtons(element, checkEnd = true){
  playerButtons = element.getElementsByTagName('button');
  for(i = 0; i < playerButtons.length; i++){
    thisButton = playerButtons[i];
    if(!thisButton.classList.contains('undo-button') && !thisButton.classList.contains('x-button'))
    thisButton.disabled = true;
  }
  if(checkEnd){
    checkRoundEnd();
  }
}
// check if round is over
function checkRoundEnd(){
  // check if everyone is on the same round
  roundsEqual = checkPlayerRounds();
  if(roundsEqual){
    // everyone is on the same round, check if round complete
    roundComplete = true;
    for(i = 0; i < window.gameObject.players.length; i++){
      checkPlayer = window.gameObject.players[i];
      currentRound = checkPlayer.rounds.length - 1;
      if(checkPlayer.rounds[currentRound].length < 3){
        roundComplete = false;
      }
    }
    if(roundComplete){
      startNewCricketRound();
    }
  } else {
    // give players time to catch up
    for(j = 0; j < window.gameObject.players.length; j++){
      currentPlayerRound = window.gameObject.players[j].rounds.length;
      checkPlayerDiv = document.getElementById('player-' + (j + 1));
      if(currentPlayerRound == window.lowestRound){
        startCricketPlayerRound(j);
        checkDisabledPlayers();
      }
    }
  }
}
function checkDisabledPlayers(){
  let roundsEqual = checkPlayerRounds();
  if(roundsEqual){
    for(j = 0; j < window.gameObject.players.length; j++){
      let checkPlayerDiv = document.getElementById('player-' + (j + 1));
      enablePlayerButtons(checkPlayerDiv)
    }
  }
}
function checkPlayerRounds(){
  // check if everyone is on the same round
  roundsEqual = true;
  window.lowestRound = window.gameObject.players[0].rounds.length;
  for(i = 0; i < window.gameObject.players.length; i++){
    currentPlayerRound = window.gameObject.players[i].rounds.length;
    if(currentPlayerRound < window.lowestRound){
      roundsEqual = false;
      window.lowestRound = currentPlayerRound;
    }
  }
  if(!roundsEqual){
    // give players time to catch up
    for(j = 0; j < window.gameObject.players.length; j++){
      currentPlayerRound = window.gameObject.players[j].rounds.length;
      checkPlayerDiv = document.getElementById('player-' + (j + 1));
      if(currentPlayerRound > window.lowestRound){
        disablePlayerButtons(checkPlayerDiv, false);
      } else {
        enablePlayerButtons(checkPlayerDiv);
      }
    }
  }
  return roundsEqual;
}
// enable buttons for players that need to catch up
function enablePlayerButtons(element){
  playerButtons = element.getElementsByTagName('button');
  for(i = 0; i < playerButtons.length; i++){
    thisButton = playerButtons[i];
    thisButton.disabled = false;
  }
  checkAllTargets();
}

function startNewCricketRound(){
  playerHolder = document.getElementById('player-holder');
  for(i = 0; i < window.gameObject.players.length; i++){
    startCricketPlayerRound(i);
  }
  playerButtons = playerHolder.getElementsByTagName('button');
  for(i = 0; i < playerButtons.length; i++){
    thisButton = playerButtons[i];
    thisButton.disabled = false;
  }
  checkAllTargets();
}
function startCricketPlayerRound(playersIndex){
  let roundPlayer = window.gameObject.players[playersIndex];
  let currentRound = roundPlayer.rounds.length;
  let roundIndex = currentRound - 1;
  let roundPlayerDarts = roundPlayer.rounds[roundIndex].length;
  if(roundPlayerDarts == 3){
    roundPlayer.rounds.push([]);
    let roundPlayerDiv = document.getElementById('player-' + (playersIndex + 1));
    let roundCounter = roundPlayerDiv.getElementsByClassName('round')[0];
    roundCounter.innerHTML = roundPlayer.rounds.length.toString();
    let dartsCounter = roundPlayerDiv.getElementsByClassName('darts')[0];
    dartsCounter.innerHTML = '3';
    let doneButton = roundPlayerDiv.getElementsByClassName('done-button')[0];
    doneButton.innerHTML = 'Miss';
  }
}
function showPlayerStats(element){
  centerDiv = createStatsPopup();
  let playerHolder = element.parentNode;
  let playersIndex = playerHolder.getAttribute('players-index');
  let thisPlayer = window.gameObject.players[playersIndex];
  addPlayerStatsTable(thisPlayer, centerDiv);
}

function showAllStats(){
  centerDiv = createStatsPopup();
  for(p = 0; p < window.gameObject.players.length; p++){
    let thisPlayer = window.gameObject.players[p];
    addPlayerStatsTable(thisPlayer, centerDiv);
  }
}

function createStatsPopup(){
  blockerDiv = addBlocker();
  blockerDiv.id = "stats";
  statsPopup = document.createElement('div');
  statsPopup.classList.add('pop-up');
  xButton = document.createElement('button');
  blockerDiv.appendChild(statsPopup);
  xButton.classList.add('x-button');
  xButton.innerHTML = 'X';
  xButton.addEventListener('click', removeStats);
  statsPopup.appendChild(xButton);
  centerDiv = document.createElement('div');
  statsPopup.appendChild(centerDiv);
  return centerDiv;
}

function removeStats(){
  statsElement = document.getElementById('stats');
  statsElement.parentNode.removeChild(statsElement);
}

function addPlayerStatsTable(thisPlayer, centerDiv){
  popupH2 = document.createElement('h2')
  popupH2.innerHTML = thisPlayer.name + "'s Stats";
  centerDiv.appendChild(popupH2);
  averageList = [];
  totalHits = 0
  rolling3DA = 0;
  let roundsTable = document.createElement('table');
  headerRow = document.createElement("tr");
  roundsTable.appendChild(headerRow);
  roundHeaderCell = document.createElement('th');
  roundHeaderCell.innerHTML = 'Round';
  headerRow.appendChild(roundHeaderCell);
  dart1HeaderCell =  document.createElement('th');
  dart1HeaderCell.innerHTML = 'Dart&#160;1';
  headerRow.appendChild(dart1HeaderCell);
  dart2HeaderCell =  document.createElement('th');
  dart2HeaderCell.innerHTML = 'Dart&#160;2';
  headerRow.appendChild(dart2HeaderCell);
  dart3HeaderCell =  document.createElement('th');
  dart3HeaderCell.innerHTML = 'Dart&#160;3';
  headerRow.appendChild(dart3HeaderCell);
  hitsHeaderCell =  document.createElement('th');
  hitsHeaderCell.innerHTML = 'Hits';
  headerRow.appendChild(hitsHeaderCell);
  rollingHeaderCell =  document.createElement('th');
  rollingHeaderCell.innerHTML = 'Average';
  headerRow.appendChild(rollingHeaderCell);
  for(let r = 0; r < thisPlayer.rounds.length; r++){
    thisRound = thisPlayer.rounds[r];
    roundCount = r + 1;
    thisRoundHits = 0;
    if(thisRound.length > 0){
      let roundRow = document.createElement('tr');
      roundsTable.appendChild(roundRow);
      roundLabelCell = document.createElement('td');
      roundLabelCell.innerHTML = roundCount;
      roundRow.appendChild(roundLabelCell);
      for(let d = 0; d < thisRound.length; d++){
        thisDart = thisRound[d];
        if(thisDart.includes("_")){
          dartElements = thisDart.split("_");
          targetText = dartElements[0];
          targetCount = parseInt(dartElements[1]);
          thisRoundHits += targetCount;
          totalHits += targetCount;
          cellText = targetText + "(" + targetCount +")";
        } else {
          cellText = thisDart;
        }
        thisDartCell = document.createElement('td');
        thisDartCell.innerHTML = cellText;
        roundRow.appendChild(thisDartCell);
      }
      if(thisRound.length < 3){
        dartsLeft = 3 - thisRound.length;
        for(let dl = 0; dl < dartsLeft; dl++){
          thisDartCell = document.createElement('td');
          thisDartCell.innerHTML = "N/A";
          roundRow.appendChild(thisDartCell);
        }
      }
      roundHitsCell = document.createElement('td');
      roundHitsCell.innerHTML = thisRoundHits;
      roundRow.appendChild(roundHitsCell);
      rolling3DA = totalHits / (roundCount);
      rolling3DACell = document.createElement('td');
      rolling3DACell.innerHTML = rolling3DA.toFixed(2);
      roundRow.appendChild(rolling3DACell);
    }
  }
  let totalsRow = document.createElement('tr');
  roundsTable.appendChild(totalsRow);
  totalsCell =  document.createElement('th');
  totalsCell.colSpan = '7';
  totalsCell.innerHTML = 'Total Hits: ' + totalHits + ' | 3 Dart Average: ' + rolling3DA.toFixed(2);
  totalsRow.appendChild(totalsCell);
  centerDiv.appendChild(roundsTable);
}

// safely handles circular references
JSON.safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
};
