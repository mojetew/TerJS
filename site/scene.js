//handles the scenes
scene = {
    //starts an environment
    //url = environment
    startEnv:function(url){
        func.func.hide_sprite()
        scene.character = url
        scene.diag = "stats"
        scene.next("encounters", "environments")
        DB.get("environments/" + url + "/stats",function($){
            scene.block = $.blocking
        });
    },
    //renders an environment
    //done = optional function that runs when width and height of background have been determined
    renderEnv:function(done){
        DB.get("environments/" + scene.environment + "/stats",function($){
            scene.envStat = $
            var ctx = scene.bGround.getContext("2d");
            var countD = 6;
            var load = function(){
                if(countD == 0){
                    scene.bGround.width = env.width;
                    scene.bGround.height = env.height;
                    if(done)done();
                    ctx.drawImage(bgStuff[4], 0, 0, env.width, env.height);
                    ctx.globalAlpha = save.time % 50 / 50;
                    ctx.drawImage(bgStuff[5], 0, 0, env.width, env.height);
                    for(var i=0;i < 4;i++){
                        ctx.globalAlpha = Math.random()
                        ctx.drawImage(bgStuff[i], 0, 0, env.width, env.height);
                    }
                    ctx.globalAlpha = 1;
                    ctx.drawImage(env, 0, 0);
                    ctx.globalCompositeOperation = "multiply";
                    if(ctx.globalCompositeOperation == "multiply"){
                        ctx.drawImage(map.tod, 0, 0, env.width, env.height);
                    }
                    ctx.globalCompositeOperation = "source-over";
                    if($.mask)ctx.drawImage(mask, 0, 0);
                }else countD--;
            }
            //define optional parts first
            if($.mask){
                countD++;
                var mask = document.createElement("img");
                mask.onload = load;
                mask.src = DB.asset("environments/" + scene.environment + "/env_mask.png");
            }
            //define required assets
            var env = document.createElement("img");
            env.onload = load;
            env.src = DB.asset("environments/" + scene.environment + "/env.png");
            //backgroundStuff
            var bgStuff = []
            for (var i=0; i < 6;i++){
                var bg = document.createElement("img")
                bg.onload = load
                if(i < 4)bg.src = DB.asset("images/clouds" + i + ".jpg")
                bgStuff.push(bg)
            }
            if(save.time < 50){
                bgStuff[4].src = DB.asset("images/sky_night.jpg");
                bgStuff[5].src = DB.asset("images/sky_sundown.jpg");
            }else if(save.time < 100){
                bgStuff[4].src = DB.asset("images/sky_sundown.jpg");
                bgStuff[5].src = DB.asset("images/sky_day.jpg");
            }else if(save.time < 150){
                bgStuff[4].src = DB.asset("images/sky_day.jpg");
                bgStuff[5].src = DB.asset("images/sky_sundown.jpg");
            }else{
                bgStuff[4].src = DB.asset("images/sky_sundown.jpg");
                bgStuff[5].src = DB.asset("images/sky_night.jpg");
            }
            //soundStuff
            if($.SOUNDS){
                var sndLen = $.SOUNDS.length
                for(var i = 0; i < sndLen; i++){
                    var args = $.SOUNDS[i].split('.')
                    args.push(true)
                    func.func.play_sound.apply(null, args)
                }
            }
        });
        //mute already playing sounds
        while(func.envSounds.firstChild)func.envSounds.removeChild(func.envSounds.firstChild)
        while(func.sounds.firstChild)func.sounds.removeChild(func.sounds.firstChild)
    },
    //renders the character in the scene
    //name = sprite to draw(optional)
    renderChar:function(name){
        var ctx = scene.char.getContext("2d");
        var img = document.createElement("img");
        img.onload = function(){
            scene.char.width = img.width;
            scene.char.height = img.height;
            scene.char.style.width = img.width / scene.bGround.width * 100 + "%";
            scene.char.style.height = img.height / scene.bGround.height * 100 + "%";
            ctx.globalCompositeOperation = "multiply";
            //skip multiplication step if browser doesn't support it
            if(ctx.globalCompositeOperation == "multiply" && scene.envStat.interior != "yes"){
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx2 = canvas.getContext("2d");
                ctx2.filter = "brightness(0.8) opacity(0.9)";
                ctx2.drawImage(img, 0, 0);
                ctx2.globalCompositeOperation = "source-in";
                ctx2.drawImage(map.tod, 0, 0, img.width, img.height);
                ctx.drawImage(img, 0, 0);
                ctx.drawImage(canvas, 0, 0);
            }else ctx.drawImage(img, 0, 0);
            scene.char.style.opacity = 1
        }
        if(!name)name = DB.readOrDefault(save.default_sprite, scene.character, "character")
        img.src = DB.asset("characters/" + scene.character + "/" + name + ".png")
    },
    //starts the described scene
    //loc = event name
    //env = the new environment it takes place in(optional, gotten from stats otherwise)
    //diag = specification on which diag file to read(optional, works like: diag_<diag>.js)
    //pointer = where in the scene we currently are(optional, defaults to the pointer 'start')
    startScene:function(loc, env, diag, pointer){
        scene.pics.style.display = "none";
        scene.character = loc;
        DB.get("characters/" + loc + "/stats", function($){
           scene.stats = $;
           if(typeof $.text_color == "number"){
                scene.txtHex = $.text_color.toString()
           }else scene.txtHex = $.text_color
           if(typeof $.bubble_color == "number"){
               scene.bubHex = $.bubble_color.toString()
          }else scene.bubHex = $.bubble_color
           if(env)scene.environment = env;
           else scene.environment = $.default_env;
           if($.charPng)scene.renderEnv(scene.renderChar)
           else{
                func.func.hide_sprite()
                scene.renderEnv()
           }
           scene.dScene.style.visibility = "visible"
           scene.char.style.opacity = 1
        });
        if(diag) scene.diag = "diag_" + diag;
        else scene.diag = DB.readOrDefault(save.saved_diag[loc], scene.character, "diag");
        if(pointer) scene.next(pointer);
        else scene.next(DB.readOrDefault(save.saved_index, scene.character, "start"));
    },
    //moves conversation to a new pointer
    //pointer = the new pointer to load
    //path = path to the diag file (optional, defaults to "characters")
    next:function(pointer, path){
        if(pointer == 0)return
        if(!path) path = "characters"
        scene.pointer = pointer
        DB.get(path + "/" + scene.character + "/" + scene.diag, function($){
            var p = $['p' + pointer];
            var texts = p.text.split("\"")
            //get rid of old sounds
            while(func.sounds.firstChild)func.sounds.removeChild(func.sounds.firstChild)
            //perform all the functions of the pointer
            for(var i = 0; i < p.funcs.length;i++){
                if(func.func[p.funcs[i][0]])func.func[p.funcs[i][0]].apply(null, p.funcs[i][1]);
                else alert("function: \"" + p.funcs[i][0] + "\" does not exist!");
            }
            //replace chat
            while(scene.chatBox.firstChild)scene.chatBox.removeChild(scene.chatBox.firstChild)
            for(var i = 0; i < texts.length;i++){
                if(texts[i]){
                    var dom = document.createElement("div");
                    //odd numbers are said by the character
                    if(Math.abs(i % 2) == 1){
                        dom.style.color = "#" + scene.txtHex;
                        dom.style.background = "#" + scene.bubHex;
                    }
                    dom.innerHTML = texts[i].replace("-name-", save.name);
                    scene.chatBox.appendChild(dom);
                }
            }
            //replace choices
            while(scene.choiceBox.firstChild)scene.choiceBox.removeChild(scene.choiceBox.firstChild)
            scene.currP = p.p
            scene.choices = $.cArr[p.p]
            scene.shownChoices = []
            cLoop: for(var i = 0; i < scene.choices.length;i++){
                var choice = scene.choices[i];
                //check if the choice should be drawn
                if(choice.ifs){
                    for(var o = 0; o < choice.ifs.length;o++){
                        var ifs = choice.ifs[o]
                        for(var l = 0; l < ifs[o].length;l++){
                        var IF = choice.ifs[l].split(".")
                            if(func.condition[IF[1]]){
                                func.currP = i
                                var bool = func.condition[IF[1]].apply(null, IF.splice(2));
                                if(IF[0] == "showif")bool = !bool
                                if(bool)continue cLoop
                            }else if(save.stats[IF[1]]){
                                var bool = func.condition.has_stat.apply(null, IF.splice(1));
                                if(IF[0] == "showif")bool = !bool
                                if(bool)continue cLoop
                            }
                            else alert("condition: \"" + IF[1] + "\" does not exist!")
                        }
                    }
                }
                var dom = document.createElement("div");
                dom.innerHTML = choice.text.replace("-name-", save.name);
                dom.choice = i
                dom.setAttribute("onclick", "scene.choiceMade(" + i + ")")
                scene.shownChoices.push(i)
                scene.choiceBox.appendChild(dom);
            }
        });
    },
    //interprets the decision from the player since not all options are always available
    //id = the number of the clicked option
    choiceMade:function(id){
        var choice = scene.choices[id]
        //save clicked
        if(choice.ifs && (choice.ifs.includes("hideif.clicked") || choice.ifs.includes("showif.clicked"))){
            var i
            var o
            var hash = scene.choices[id].text.hashCode()
            if(i = save.clicked[scene.character]){
                if(o = i[scene.currP]){
                    if(!o.includes(hash))o.push(hash)
                } else i[scene.currP] = [hash]
            }else{
                var dict = {}
                dict[scene.currP] = [hash]
                save.clicked[scene.character] = dict
            }
        }

        for(var i = 0; i < choice.funcs.length;i++){
            if(func.func[choice.funcs[i][0]])func.func[choice.funcs[i][0]].apply(null, choice.funcs[i][1])
            else alert("function: \"" + choice.funcs[i][0] + "\" does not exist!")
        }
        if(choice.to)scene.next(choice.to)
    },
    //runs when html is loaded, creates necessary DOM elements, its done here so we can call them again later
    onLoad:function(){
        scene.dScene = document.getElementById("scene");
        //environment background
        scene.bGround = document.createElement("canvas");
        scene.dScene.appendChild(scene.bGround);
        //char picture
        scene.char = document.createElement("canvas");
        scene.char.id = "character";
        scene.dScene.appendChild(scene.char);
        //pictures that fill the scene
        scene.pics = document.createElement("img");
        scene.dScene.appendChild(scene.pics);
        //the chat box that holds dialogue boxes
        scene.chatBox = document.createElement("div");
        scene.chatBox.id = "chatBox";
        scene.dScene.appendChild(scene.chatBox);
        //box for holding the choices
        scene.choiceBox = document.createElement("div");
        scene.choiceBox.id = "choiceBox";
        scene.dScene.appendChild(scene.choiceBox);
    }
}