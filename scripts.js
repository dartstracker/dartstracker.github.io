window.addEventListener('load', eventWindowLoaded, false);
function eventWindowLoaded(){
  window.bodyTag = document.getElementsByTagName("body")[0];
  showSlides(1, 0);
  showSlides(1, 1);
  showSlides(1, 2);
  showSlides(1, 3);
  imgs = document.getElementsByTagName('img')
  for (i = 0; i < imgs.length; i++) {
    imgs[i].addEventListener("contextmenu", rightClick);
  }
}
function rightClick(e) {
  newA = document.createElement("a");
  newA.href = "https://ko-fi.com/matchajoejoe/gallery";
  newA.className = "ko-fi";
  newA.innerHTML = "Download full-res image from my ko-fi!";
  newA.target = "_blank";
  newA.style.position = "fixed";
  newA.style.top = e.clientY+"px";
  newA.style.left = e.clientX+"px";
  blockerDiv = document.createElement("div");
  blockerDiv.id = "blocker";
  blockerDiv.appendChild(newA);
  bodyTag.appendChild(blockerDiv);
  blockerDiv.addEventListener("click", removeBlocker);
  blockerDiv.addEventListener("contextmenu", removeBlocker);
  newA.addEventListener("contextmenu", removeBlocker);
  newA.addEventListener("click", openKofi);
  e.preventDefault();
};
function openKofi(){
  window.open('https://ko-fi.com/matchajoejoe/gallery', '_blank');
}
function removeBlocker(e){
  console.log("blocker clicked");
  e.preventDefault();
  blockerDiv = document.getElementById("blocker");
  if(blockerDiv != null){
    blockerDiv.remove();
  }
}


function showTab(e, tabID) {
  var i;
  var x = document.getElementsByClassName("tab");
  for (i = 0; i < x.length; i++) {
    if(tabID == "All"){
      x[i].style.display = "block";
    }else{
      x[i].style.display = "none";
    }
  }
  tablinks = document.getElementsByClassName("tab-button");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  e.target.className += " active";
  if(tabID != "All"){
    document.getElementById(tabID).style.display = "block";
    document
  }
}

var bodyTag;
var slideIndex = [1,1,1,1];
var slideId = ["illustration-slides", "pixel-art-slides", "model-slides","game-slides"]

function plusSlides(n, no) {
  showSlides(slideIndex[no] += n, no);
}

function showSlides(n, no) {
  var i;
  var x = document.getElementsByClassName(slideId[no]);
  if (n > x.length) {slideIndex[no] = 1}
  if (n < 1) {slideIndex[no] = x.length}
  for (i = 0; i < x.length; i++) {
     x[i].style.display = "none";
  }
  x[slideIndex[no]-1].style.display = "flex";
}

function displayGame(gameID){
  gameFrame = document.getElementById(gameID);
  gamePoster = document.getElementById(gameID+"-poster");
  gameFrame.style.display = "block";
  gamePoster.style.display = "none";
  if(gameID == "garden"){
    gameFrame.src="../games/garden-life/index.html";
  } else if(gameID == "bar"){
    gameFrame.src="../games/the-bar/index.html";
  } else if(gameID == "scrappers"){
    gameFrame.src="../games/scrappers/index.html";
  }
}

function unloadGames(){
  gameFrames = document.getElementsByClassName("game-frame");
  for (i = 0; i < gameFrames.length; i++) {
     gameFrames[i].style.display = "none";
     gameFrames[i].src = "";
  }
  gamePosters = document.getElementsByClassName("game-poster");
  for (i = 0; i < gamePosters.length; i++) {
     gamePosters[i].style.display = "block";
  }
}
