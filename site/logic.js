//to provide unique code for onclick methods
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
//if browser is IE give includes definition
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, "includes", {
    enumerable: false,
    value: function(obj) {
        var newArr = this.filter(function(el) {
          return el == obj;
        });
        return newArr.length > 0;
      }
  });
}

function start(){
    //stand-in for the save feature
    save = {sex:'m', name:"john", stats:{charisma:7, will:7, intelligence:7, perception:7, agility:7, strength:7, endurance:7}, money: {}, time: 0, default_background:{}, default_sprite:{}, saved_index:{}, saved_diag:{}, disLoc:[], clicked:{}, flags: {}, counters:{}, items:{}}
    //load the "classes"
    DB.onLoad();
    map.onLoad();
    scene.onLoad();
    func.onLoad();

    //temp menu
    buttonLoc = document.getElementById("scene");
    button = document.createElement("button");
    button.innerHTML = "low budget content warning, it has sex and aliens<br>press to consent";
    map.advTime(0);
    button.onclick = function(){
        buttonLoc.removeChild(button);
        scene.startScene("intro")
    };
    buttonLoc.appendChild(button);
}

window.onload = function(){start()}