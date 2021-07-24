window.addEventListener('load', eventWindowLoaded, false);
function eventWindowLoaded(){
  checkHash();
}
function checkHash(){
  var hash = window.location.hash.substr(1);
  if (hash != ''){
    //Do something with the hash here
  } else {
    hideAll();
  }
}
function hideAll(){
  var gametypes = document.getElementsByClassName('game-type');
  for (gtindex = 0; gtindex < gametypes.length; gtindex++) {
    gametypes[gtindex].style.display = 'none';
  }
  var gameselect = document.getElementById('game-select');
  gameselect.style.display = '';
}

function hideSelect(){
  var gameselect = document.getElementById('game-select');
  gameselect.style.display = 'none';
}

function showCricket(){
  hideSelect();
  var cricketdiv = document.getElementById('cricket').style.display = '';
}

function newCricket() {
  var newCricketDiv = document.getElementById('new-cricket');
  newCricketDiv.style.display = 'flex';
  var cricketStartDiv = document.getElementById('cricket-start');
  cricketStartDiv.style.display = 'none';
  addCricketPlayer();
}
// variables to use later
var currentPlayerCount = 0;
var players = [];
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
  rounds: [[]],
  states: []
}
// add cricket player template to player holder
function addCricketPlayer(){
  playerTemplate = document.getElementById('cricket-template');
  playerHolder = document.getElementById('player-holder');
  currentPlayerIndex = window.players.length;
  playerNumber = currentPlayerIndex + 1;
  newPlayerData = JSON.parse(JSON.stringify(playerData));
  newPlayerData.name = 'Player ' + playerNumber;
  window.players.push(newPlayerData);
  newPlayerDiv = playerTemplate.cloneNode(true);
  newPlayerDiv.id = 'player-' + playerNumber;
  newPlayerDiv.setAttribute('players-index', currentPlayerIndex);
  newPlayerDiv.style.display = 'block';
  nameLabel = newPlayerDiv.getElementsByTagName('label')[0];
  nameLabel.innerHTML = 'Player ' + playerNumber;
  playerHolder.appendChild(newPlayerDiv);
}
// remove player from player template and players.
function removePlayer(element){
  playerHolder = element.parentNode;
  playersIndex = playerHolder.getAttribute('players-index');
  if(playersIndex == 0){
    window.players.shift();
  } else if(playersIndex == (window.players.length -1)){
    window.players.pop();
  } else {
    window.players.splice(playersIndex, 1);
  }
  playerHolder.parentNode.removeChild(playerHolder);
  for(i = 0; i < window.players.length; i++){
    if(i >= playersIndex){
      thisPlayerHolder = document.getElementById('player-' + (i + 2));
      thisPlayerHolder.id = 'player-' + (i + 1);
      thisPlayerHolder.setAttribute('players-index', i);
    }
  }
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
    window.players[playersIndex].name = newName;
  }
  nameLabel.style.display = '';
  nameHolder.removeChild(nameButton);
  nameHolder.removeChild(nameInput);
}
// updating display for a hit in cricket
function cricketHit(element, target, count){
  rowHolder = element.parentNode;
  targetDisplay = rowHolder.getElementsByTagName('input')[0];
  playerHolder = rowHolder.parentNode.parentNode;
  playersIndex = playerHolder.getAttribute('players-index');
  addPlayerState(playersIndex);
  dartsCounter = playerHolder.getElementsByClassName('darts')[0];
  roundCounter = playerHolder.getElementsByClassName('round')[0];
  doneButton = playerHolder.getElementsByClassName('done-button')[0];
  currentPlayer = window.players[playersIndex];
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
    if(targetHitCount > 3){
      if(oldHitCounts < 3){
        newCount = count - (3 - oldHitCounts);
      } else {
        newCount = count;
      }
      calculatePoints(playersIndex, target, newCount);
    }
  }
  if(dartsLeft == 0){
    disablePlayerButtons(playerHolder);
  }
}

function calculatePoints(playersIndex, target, newCount) {
  console.log("points not implemented yet...");
}
// add state to player
function addPlayerState(playersIndex){
  thisPlayer = window.players[playersIndex];
  newPlayerData = JSON.parse(JSON.stringify(thisPlayer));
  newPlayerData.states = [];
  thisPlayer.states.push(newPlayerData);
  thisPlayerDiv = document.getElementById('player-' + (parseInt(playersIndex) + 1));
  thisUndoButton = thisPlayerDiv.getElementsByClassName('undo-button')[0];
  thisUndoButton.disabled = false;
}
function undoButton(element){
  rowHolder = element.parentNode;
  playerHolder = rowHolder.parentNode.parentNode;
  playersIndex = playerHolder.getAttribute('players-index');
  playerStatesLength = window.players[playersIndex].states.length;
  if(playerStatesLength > 0){
    loadPreviousState(playersIndex);
    if(playerStatesLength == 1){
      element.disabled = true;
    }
  } else {
    element.disabled = true;
  }
}
function loadPreviousState(playersIndex){
  thisPlayer = window.players[playersIndex];
  playerStatesLength = thisPlayer.states.length;
  previousState = thisPlayer.states[playerStatesLength-1];
  thisPlayer.hitcounts = previousState.hitcounts;
  thisPlayer.name = previousState.name;
  thisPlayer.points = previousState.points;
  thisPlayer.rounds = previousState.rounds;
  thisPlayer.states.pop();
  displayPlayerData(playersIndex);
}
function displayPlayerData(playersIndex){
  thisPlayer = window.players[playersIndex];
  if(!thisPlayer){
    console.error("player " + playersIndex + " does not exits...");
  }
  thisPlayerDiv = document.getElementById('player-' + (parseInt(playersIndex) + 1));
  if(!thisPlayerDiv){
    thisPlayerDiv = createPlayerDivFromIndex(playersIndex);
  }
  nameLabel = thisPlayerDiv.getElementsByTagName('label')[0];
  nameLabel = thisPlayer.name;
  currentRound = thisPlayer.rounds.length;
  if(currentRound == 0){
    thisPlayer.rounds.push([]);
    currentRound = thisPlayer.rounds.length;
  }
  roundCounter = thisPlayerDiv.getElementsByClassName('round')[0];
  roundCounter.innerHTML = currentRound;
  currentRoundIndex = currentRound - 1;
  currentRoundArray = thisPlayer.rounds[currentRoundIndex];
  currentDart = currentRoundArray.length;
  dartsLeft = 3 - (currentDart);
  dartsCounter = thisPlayerDiv.getElementsByClassName('darts')[0];
  dartsCounter.innerHTML = dartsLeft;
  enablePlayerButtons(thisPlayerDiv);
  hitCounters = thisPlayerDiv.getElementsByClassName('hitcounter');
  for(i = 0; i < hitCounters.length; i++){
    thisHitCounter = hitCounters[i];
    thisTarget = thisHitCounter.getAttribute("hitcounter");
    targetHitCount = thisPlayer.hitcounts[thisTarget];
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
}
function createPlayerDivFromIndex(playersIndex){
  thisPlayer = window.players[playersIndex];
  playerTemplate = document.getElementById('cricket-template');
  playerHolder = document.getElementById('player-holder');
  playerNumber = playersIndex + 1;
  newPlayerDiv = playerTemplate.cloneNode(true);
  newPlayerDiv.id = 'player-' + playerNumber;
  newPlayerDiv.setAttribute('players-index', playersIndex);
  newPlayerDiv.style.display = 'block';
  nameLabel = newPlayerDiv.getElementsByTagName('label')[0];
  nameLabel.innerHTML = thisPlayer.name;
  playerHolder.appendChild(newPlayerDiv);
  return newPlayerDiv;
}
// updating display for a miss in cricket
function cricketMiss(element){
  rowHolder = element.parentNode;
  targetDisplay = rowHolder.getElementsByTagName('input')[0];
  playerHolder = rowHolder.parentNode.parentNode;
  dartsCounter = playerHolder.getElementsByClassName('darts')[0];
  roundCounter = playerHolder.getElementsByClassName('round')[0];
  playersIndex = playerHolder.getAttribute('players-index');
  addPlayerState(playersIndex);
  currentPlayer = window.players[playersIndex];
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
  roundsEqual = true;
  lowestRound = window.players[0].rounds.length;
  for(i = 0; i < window.players.length; i++){
    currentPlayerRound = window.players[i].rounds.length;
    if(currentPlayerRound < lowestRound){
      roundsEqual = false;
      lowestRound = currentPlayerRound;
    }
  }
  if(roundsEqual){
    //TODO: this is broken, need to fix it

    // everyone is on the same round, check if round complete
    roundComplete = true;
    for(i = 0; i < window.players.length; i++){
      thisPlayer = window.players[i];
      currentRound = thisPlayer.rounds.length - 1;
      if(thisPlayer.rounds[currentRound].length < 3){
        roundComplete = false;
      }
    }
    if(roundComplete){
      startNewCricketRound();
    }
  } else {
    // give players time to catch up
    for(j = 0; j < window.players.length; j++){
      currentPlayerRound = window.players[j].rounds.length;
      thisPlayerDiv = document.getElementById('player-' + (j + 1));
      if(currentPlayerRound > lowestRound){
        disablePlayerButtons(thisPlayerDiv, false);
      } else {
        enablePlayerButtons(thisPlayerDiv);
      }
    }
  }
}
// enable buttons for players that need to catch up
function enablePlayerButtons(element){
  playerButtons = element.getElementsByTagName('button');
  for(i = 0; i < playerButtons.length; i++){
    thisButton = playerButtons[i];
    thisButton.disabled = false;
  }
}

function startNewCricketRound(){
  playerHolder = document.getElementById('player-holder');
  for(i = 0; i < window.players.length; i++){
    thisPlayer = window.players[i];
    thisPlayer.rounds.push([]);
    thisPlayerDiv = document.getElementById('player-' + (i + 1));
    roundCounter = thisPlayerDiv.getElementsByClassName('round')[0];
    roundCounter.innerHTML = thisPlayer.rounds.length.toString();
    dartsCounter = thisPlayerDiv.getElementsByClassName('darts')[0];
    dartsCounter.innerHTML = '3';
    doneButton = thisPlayerDiv.getElementsByClassName('done-button')[0];
    doneButton.innerHTML = 'Miss';
  }
  playerButtons = playerHolder.getElementsByTagName('button');
  for(i = 0; i < playerButtons.length; i++){
    thisButton = playerButtons[i];
    thisButton.disabled = false;
  }
}
