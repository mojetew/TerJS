//Feedback:
//Its not clear where the player is, rotation and offset can cause further confusion.
//Its not clear where the player can go
//solutions:
//outline on the footprints, maybe different color?
//custom graphics to replace the old svg method
//make the footprint trail more fleeting
//replace footprint with slightly animated character?
//allow discovering sites and one-blimp events in neighbouring blimps, the marker it sets can then guide them to it next time
//put white dots where the player can go
//make the map more clear on where the player can move(isn't it already?)
//maybe a higher def map that allows players spot locations of interest better?(wouldn't help the game's already big size)
//somehow generate roads or arrows that tell the player where they can go

//this class manages all map related actions
//variables:
//array = the array of locations on the map, initialised in updateMap
//close = an array of indexes made using 'array' that show the legal moves
//loc = current location of the player, initialised in move
//oldLoc = previous location of the player, initialised in move
//leftFoot = boolean about which foot to draw on the map, initialised in move
//DOM variables: (created in onLoad)
//img = image that holds the visual map
//markers = divider holding all the discovered landmarks
//steps = divider holding the footprints
map = {
	//moves player to new location
	//loc = new location number on array
	//noEvent = skip event check
	move:function(loc, noEvent){
	    //find blimps the player is allowed to go to
	    map.close = [];
        //this is faster then asking length every time
        var length = map.array.length;
        var hereX = map.array[loc][0] + map.array[loc][2] / 2
        var hereY = map.array[loc][1] + map.array[loc][2] / 2
        for(var i = 0;i < length;i++){
            if(i != loc){
                var newX = map.array[i][0] + map.array[i][2] / 2
                var newY = map.array[i][1] + map.array[i][2] / 2
                if(Math.sqrt(Math.pow(hereX - newX,2) + Math.pow(hereY - newY,2)) < (map.array[i][2] + map.array[loc][2]) * 0.5){
                    map.close.push(i);
                }
            }
        }
		//make previous feet more transparent
		var children = map.steps.childNodes;
		var length = children.length;
		for(var i = 0;i < length;i++){
		    children[i].style.opacity = children[i].style.opacity - 0.5;
            //get rid of gone footsteps
            if(children[i].style.opacity == 0)setTimeout(function(){map.steps.removeChild(children[0]);}, 1000);
		}
		//draw new foot
		var step = document.createElement("img");
		step.src = DB.asset("images/footstep.png");
        step.style.left = map.array[loc][0] + "px";
        step.style.top = map.array[loc][1] + "px";
        step.style.opacity = 1;
        if(map.loc){
            //set step to rotate away from previous step
            step.style.transform = "rotate(" + (Math.atan2((map.array[loc][1] - map.array[map.loc][1]), (map.array[loc][0] - map.array[map.loc][0])) * 180 / Math.PI + 90) + "deg)";
        }
        if(map.leftFoot){
            step.style.transform += "scaleX(-1)";
            map.leftFoot = false;
        }else map.leftFoot = true;
        map.steps.appendChild(step);
        map.oldLoc = map.loc;
		map.loc = loc;
		map.advTime(2)
		if(!noEvent){
            //check for events
            switch(map.array[loc][3]){
                case 1://named
                case 2://place
                case 3://encounter
                case 4://special
                    scene.startEnv(map.array[loc][4]);
            }
		}
	},
	//updates the map to use a new image + array
	//url = location to find new image
	//array = new array for the map
	//loc = place where to put the player
	//noEvent = skip event check
	updateMap:function(url, loc, noEvent){
		//get rid of all footprints
		while(map.steps.firstChild)map.steps.removeChild(map.steps.firstChild);
		//load new image
		map.img.src = DB.asset("maps/" + url + ".jpg");
        DB.get("maps/" + url + "_data",function($){
            map.array = $;
            //Debug: draws the nodes to find out if the path finding is wrong
//            var canvas = document.createElement("canvas")
//            canvas.style.width = "100%"
//            canvas.style.height = "100%"
//            canvas.width = map.img.offsetWidth
//            canvas.height = map.img.offsetHeight
//            map.dMap.appendChild(canvas)
//            var context = canvas.getContext("2d")
//            for(var i = 0; map.array.length > i;i++){
//                context.beginPath();
//                context.arc(map.array[i][0] + map.array[i][2] / 2, map.array[i][1] + map.array[i][2] / 2, map.array[i][2] / 2, 0, 2 * Math.PI);
//                context.stroke();
//            }

            //move cam to start location
            map.dMap.style.left = -$[loc][0] + (window.innerWidth / 2) + "px";
            map.dMap.style.top = -$[loc][1] + (window.innerHeight / 2) + "px";
            map.move(loc, noEvent);
        });
        //set up keys
        if(!keymap.commands.contains)keymap.commands.push(map.keyPress)
	},
	//advances time and makes a new background image for it
	//amount = amount of time passed
	advTime:function(amount){
	    save.time += amount;
	    while(save.time < 0)save.time += 199;
	    while(save.time > 199)save.time -= 199;
	    var img1 = document.createElement("img");
	    var img2 = document.createElement("img");
	    var ctx = map.tod.getContext("2d");
	    img1.onload = function(){
                ctx.drawImage(img1, 0, 0);
                ctx.globalAlpha = save.time % 50 / 50;
        };
        img2.onload = function(){ctx.drawImage(img2, 0, 0)};
	    if(save.time < 50){
	        img1.src = DB.asset("images/overlay_night.jpg");
	        img2.src = DB.asset("images/overlay_morning.jpg");
	    }else if(save.time < 100){
            img1.src = DB.asset("images/overlay_morning.jpg");
            img2.src = DB.asset("images/overlay_day.jpg");
	    }else if(save.time < 150){
            img1.src = DB.asset("images/overlay_day.jpg");
            img2.src = DB.asset("images/overlay_sundown.jpg");
	    }else{
            img1.src = DB.asset("images/overlay_sundown.jpg");
            img2.src = DB.asset("images/overlay_night.jpg");
	    }
	},
    //handles what to do if a key is pressed on the map
    //key = the key pressed by the player
    keyPress:function(key){
        //decider on which function to use to find the best blimp for the button press
        var func;
        switch(key.key){
            case "w":
            case "ArrowUp":
            func = function(i){return (map.array[map.loc][1] + map.array[map.loc][2] / 2) - (map.array[i][1] + map.array[i][2] / 2)}
            break;
            case "d":
            case "ArrowRight":
            func = function(i){return (map.array[i][0] + map.array[i][2] / 2) - (map.array[map.loc][0] + map.array[map.loc][2] / 2)}
            break;
            case "s":
            case "ArrowDown":
            func = function(i){return (map.array[i][1] + map.array[i][2] / 2) - (map.array[map.loc][1] + map.array[map.loc][2] / 2)}
            break;
            case "a":
            case "ArrowLeft":
            func = function(i){return (map.array[map.loc][0] + map.array[map.loc][2] / 2) - (map.array[i][0] + map.array[i][2] / 2)}
            break;
            default:
            return false;
        }
        var best = map.close[0];
        var score = func(map.close[0]);
        var length = map.close.length;
        for(var i = 1;i < length;i++){
            var newScore = func(map.close[i]);
            if(newScore > score){
                score = newScore;
                best = map.close[i];
            }
        }
        map.move(best);
        return true;
    },
    //handles what to do if the map is clicked:
    //finds closest match to click location, checks if close enough, then move there
    //x, y = coordinates in pixels where the map was clicked
    clicked:function(x, y){
        var best;
        var bestDist;
        //this is faster then asking length every time
        var length = map.close.length;
        //choose closest blimp to click if less then 200 pixels away
        for(var i = 0;i < length;i++){
            var curr = map.close[i]
            var dist = Math.sqrt(Math.pow((map.array[curr][0] + map.array[curr][2] / 2) - x,2) + Math.pow((map.array[curr][1] + map.array[curr][2] / 2) - y,2));
            if(dist < 300 &&(!bestDist || bestDist > dist)){
                bestDist = dist;
                best = i;
            }
        }
        if(bestDist)map.move(map.close[best]);
    },
    //trigger on dragging the map, used to change the map's position
    //x, y = current coordinates of mouse
    dragged:function(x, y){
        if(map.drags){
            //check for out of bounds
            var left = map.dMap.style.left;
            left = map.dMap.style.left.substring(0, left.length - 2) - (map.currX - x);
            var top = map.dMap.style.top;
            top = map.dMap.style.top.substring(0, top.length - 2) - (map.currY - y);
            if(left > 0)left = 0;
            else if(left < -map.img.offsetWidth)left = map.img.offsetWidth;
            if(top > 0)top = 0;
            else if(top < -map.img.offsetHeight)top = map.img.offsetHeight;
            //set view to new x and y
            map.dMap.style.left = left + "px";
            map.dMap.style.top = top + "px";
            map.drags += 1;
        }else map.drags = 1;
        map.currX = x;
        map.currY = y;
    },
	//runs when html is loaded, creates necessary DOM elements, its done here so we can call them again later
	onLoad:function(){
	    map.dMap = document.getElementById("map");
	    map.img = document.createElement("img");
	    //make the map grow with the image once its loaded
	    map.img.onload = function(){
            map.dMap.style.width = map.img.offsetWidth + "px";
            map.dMap.style.height = map.img.offsetHeight + "px";
        }
	    map.dMap.appendChild(map.img);
	    //container for map markers
	    map.markers = document.createElement("div");
	    map.dMap.appendChild(map.markers);
	    //container for footsteps
	    map.steps = document.createElement("div");
	    map.steps.id = "steps";
	    map.dMap.appendChild(map.steps);
	    //time of day overlay;
	    map.tod = document.createElement("canvas");
	    map.tod.width = 5;
        map.tod.height = 5;
        map.tod.style.width = "100%";
        map.tod.style.height = "100%";
        map.tod.style.mixBlendMode = "multiply";
	    map.dMap.appendChild(map.tod);
	    //onclick events:
	    //user drags the map on mobile
	    map.dMap.ontouchmove = function(e){map.dragged(e.touches[0].screenX, e.touches[0].screenY)}
	    map.dMap.ontouchend = function(){map.drags = null}
	    //user moves mouse over map
	    map.dMap.onmousemove = function(e){if(map.hold)map.dragged(e.screenX, e.screenY)}
	    //user is holding the map
	    map.dMap.onmousedown = function(){map.hold = true}
	    //user released the map
	    map.dMap.onmouseup = function(e){
	        map.drags = null;
	        map.hold = false;
	        //cancel click if moved too much
	        if(map.drags < 2)map.clicked(e.offsetX, e.offsetY);
	    }
	}
}