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

var currentPlayerCount = 0;
var players = [];
var playerData = {
  name: '',
  points: 0,
  rounds: [[]],
  hitcounts:{
    20: 0,
    19: 0,
    18: 0,
    17: 0,
    16: 0,
    15: 0,
    bull: 0
  }
}
//
function addCricketPlayer(){
  var playerTemplate = document.getElementById('cricket-template');
  var playerHolder = document.getElementById('player-holder');
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
  console.log(window.players);
}
// adding input to update player name
function addNameInput(element){
  currentName = element.innerHTML;
  nameHolder = element.parentNode;
  element.style.display = 'none';
  var nameInput = document.createElement('input');
  nameInput.classList.add('name-input');
  nameInput.value = currentName;
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
  dartsCounter = playerHolder.getElementsByClassName('darts')[0];
  roundCounter = playerHolder.getElementsByClassName('round')[0];
  doneButton = playerHolder.getElementsByClassName('done-button')[0];
  playersIndex = playerHolder.getAttribute('players-index');
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
  currentPlayer.hitcounts[target] += count;
  targetHitCount = currentPlayer.hitcounts[target];
  if(targetHitCount == 1){
    targetDisplay.value = '\\';
  } else if (targetHitCount == 2){
    targetDisplay.value = 'X';
  } else {
    targetDisplay.value = '0';
  }
  if(dartsLeft == 0){
    disablePlayerButtons(playerHolder);
  }
}
// updating display for a miss in cricket
function cricketMiss(element){
  rowHolder = element.parentNode;
  targetDisplay = rowHolder.getElementsByTagName('input')[0];
  playerHolder = rowHolder.parentNode.parentNode;
  dartsCounter = playerHolder.getElementsByClassName('darts')[0];
  roundCounter = playerHolder.getElementsByClassName('round')[0];
  playersIndex = playerHolder.getAttribute('players-index');
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
function disablePlayerButtons(element){
  playerButtons = element.getElementsByTagName('button');
  for(i = 0; i < playerButtons.length; i++){
    thisButton = playerButtons[i];
    thisButton.disabled = true;
  }
  checkRoundEnd();
}

function checkRoundEnd(){
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
