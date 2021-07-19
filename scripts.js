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
}
