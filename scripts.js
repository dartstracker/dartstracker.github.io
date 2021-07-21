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
    gametypes[gtindex].style.display = "none";
  }
  var gameselect = document.getElementById('game-select');
  gameselect.style.display = '';
}

function hideSelect(){
  var gameselect = document.getElementById('game-select');
  gameselect.style.display = 'none';
}

function loadCricket(){
  hideSelect();
  var cricketdiv = document.getElementById('cricket').style.display = '';
  updatePlayers();
}

var currentPlayerCount = 0;

function updatePlayers(){
  var playerCounter = document.getElementById('player-count');
  var playerTemplate = document.getElementById('player-template');
  var playerHolder = document.getElementById('player-holder');
  var newPlayerCount = parseInt(playerCounter.value);
  var playerCountChange = newPlayerCount - currentPlayerCount;
  if(newPlayerCount > currentPlayerCount){
    for(i = 0; i < playerCountChange; i++){
      newPlayerDiv = playerTemplate.cloneNode(true);
      currentPlayerIndex = currentPlayerCount + 1 + i;
      newPlayerDiv.id = "player-" + currentPlayerIndex;
      newPlayerDiv.style.display = "block";
      nameLabel = newPlayerDiv.getElementsByTagName('label')[0];
      nameLabel.innerHTML = "Player " + currentPlayerIndex;
      playerHolder.appendChild(newPlayerDiv);
    }
  } else if (newPlayerCount < currentPlayerCount){
    for(i = 0; i > playerCountChange; i--){
      playerHolder.removeChild(playerHolder.lastChild);
    }
  }
  currentPlayerCount = newPlayerCount;
}

function updateName(element){

}
