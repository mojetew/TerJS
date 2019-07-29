//container for the functions that can happen in scenes
func = {
    //used for hide or show-if, returns boolean
    condition:{
        clicked:function(id){
            var i
            if(i = save.clicked[scene.character])
                if(i = i[scene.currP])
                    return i.includes(scene.choices[func.currP].text.hashCode())
            return false
        },
        index_is:function(name){
            return scene.pointer == name
        },
        player_sex:function(mf){
            return save['sex'] == mf
        },
//        //or has one if no number
        has_item:function(item, number){
            if(!number)return number == 1
            else return save['items'][item] >= number
        },
        no_item:function(item){
            return !save['items'][item]
        },
        has_krats:function(amount){
            return save.money.krats >= amount
        },
        has_adats:function(amount){
            return save.money.adats >= amount
        },
        has_flag:function(flag){
            return save.flags[flag]
        },
        no_flag:function(flag){
            return !save.flags[flag]
        },
        has_stat:function(att, val){
            return save.stats[att] >= val;
        },
        rape_filter:function(){
            return save['rape']
        },
        gore_filter:function(){
            return save['gore']
        },
        feral_filter:function(){
            return save['feral']
        },
        time_filter:function(more, less){
            return ((!more || save.time > (more * 2)) && (!less || save.time < (less * 2)))
        },
        counter:function(counter, min){
            return (save.counters[counter] && save.counters[counter] >= min)
        },
        has_discovered:function(location){
            return save.disLoc.includes(location)
        },
        has_a_save:function(){
            return true;
        },
        note:function(){
            return true;
        },
        debug:function(){
            if(window["debug"])return true;
            return false;
        }
    },
    //all other functions
    func:{
        //--Graphic Functions--
        //Loads a fullscreen image and displays it.
        pic:function(name){
            scene.pics.src = DB.asset("characters/" + scene.character + "/pictures/" + name + ".jpg")
            scene.pics.style.display = null
        },
        //Removes the image and returns to normal dialogue.
        remove_pic:function(){
            scene.pics.style.display = "none";
        },
        //Removes sprite
        hide_sprite:function(){
            scene.char.style.height = 0
        },
        //Removes sprite with animation
        character_leave:function(){
            scene.char.right = "-50px";
            scene.char.style.opacity = 0;
        },
        //Add sprite with animation
        character_return:function(name){
            scene.char.right = 0;
            scene.char.style.opacity = 1;
            scene.renderChar(name);
        },
        //changes stat and active file to new character
        change_character:function(name, sprite){
            scene.character = name;
            renderChar(sprite);
        },
        //Changes the environment
        change_environment:function(env){
            scene.environment = env
            scene.renderEnv()
        },
        //Allows you to change the current character's sprite
        change_sprite:function(sprite){
            scene.renderChar(sprite);
        },
        //overrides default sprite
        change_default_sprite:function(character, sprite){
            //change after a small delay so the same scene will use the old default sprite
            setTimeout(function(){save.default_sprite[character] = sprite}, 100)
        },
        //Changes the default background graphic for the environment.
        change_default_env_background:function(bg){
            save.default_background[scene.character] = bg;
        },
        //--Variables operations--
        //Changes the saved index for the current character
        save_index:function(index){
            save.saved_index[scene.character] = index;
        },
        //Changes the saved index for a character
        save_index_by_character:function(chr, index){
            save.saved_index[chr] = index;
        },
        //Changes the default dialog file that is read
        change_default_diag_file:function(chr, name){
            save.saved_diag[chr] = name;
        },
        add_flag:function(flag){
            save.flags[flag] = 1
        },
        remove_flag:function(flag){
            delete save.flags[flag]
        },
        //counts a number up down based on sign
        counter:function(name, sign, number){
            if(!save.counters[name])func.func.set_counter(name, 0)
            if(sign == "+")save.counters[name] += number
            else save.counters[name] -= number
        },
        set_counter:function(name, number){
            save.counters[name] = number
        },
        remove_counter:function(name){
            delete save.counters[name]
        },
//        add_timer:function(){
//            //todo
//        },
        //--Index branching--
        curated_list:function(type){
          if(type == "prioritized")setTimeout(function(){scene.choiceMade(scene.shownChoices[0])})
          else if(type == "random")setTimeout(function(){scene.choiceMade(scene.shownChoices[Math.floor(scene.shownChoices.length * Math.random())])})
          else console.log("weighted curated list found!")//todo find out how weighted curated lists work
        },
        //changes the diag file of the character currently read
        change_diag_file:function(name, pointer){
            scene.diag = pointer
        },
        change_to_default_diag:function(pointer){
            scene.diag = DB.readOrDefault(save.saved_diag[loc], scene.character, "diag")
        },
        check_flag:function(flag, no, yes){
            if(save.flags[flag]) scene.next(yes)
            else scene.next(no)
        },
        check_counter:function(counter, limit, under, over){
            if(save.counters[counter] && save.counters[name] >= limit)scene.next(over)
            else scene.next(under)
        },
//        check_discovery:function(place, no, yes){
//
//        },
//        //checks stats, values and pointers are delimited by -
        check_stat:function(att, val, pointers){
            if(typeof val == 'number') var checks = {val}
            else var checks = val.split('-')
            var ps = pointers.split('-')
            var i = 0
            while(checks.length > i && save.stats[att] < checks[index])i++
            scene.next(ps[i])
        },
        sex_gate:function(male, female){
            if(save.sex == "m")scene.next(male)
            else scene.next(female)
        },
        rape_filter:function(off, on){
            if(save['rape'])scene.next(on)
            else scene.next(off)
        },
        feral_filter:function(off, on){
            if(save['feral'])scene.next(on)
            else scene.next(off)
        },
        gore_filter:function(off, on){
            if(save['gore'])scene.next(on)
            else scene.next(off)
        },
//        chance:function(percent, win, loss){
//
//        },
//        //list of pointers delimited by -
//        random_pointer:function(pointers){
//
//        },
        day_night_gate:function(day, night){
            if(save.time > 50 && save.time < 150)scene.next(day)
            else scene.next(night)
        },
        morn_day_eve_night_gate:function(morn, day, eve, night){
            if(save.time < 50 || save.time >= 150)scene.next(night)
            else if(save.time < 100)scene.next(morn)
            else if(save.time < 150)scene.next(day)
            else scene.next(eve)
        },
//        //--Inventory functions--
        give_money:function(currency, amount){
            if(save.money[currency])save.money[currency]+=amount
            else save.money[currency] = amount
        },
        take_money:function(currency, amount){
            func.give_money(currency, -amount);
        },
        //if no amount, give 1
//        give_item:function(item, amount){
//
//        },
//        remove_item:function(item, amount){
//
//        },
//        give_card:function(card){
//
//        },
//        remove_card:function(card){
//
//        },
        //--Miscellaneous functions--
        auto_continue:function(pointer){
            //delay so people don't accidentally skip
            setTimeout(function(){
                func.contP = pointer
                keymap.addCommand(func.cont)
                scene.dScene.onclick = func.cont
            }, 500)
            //todo add animation to show the screen is clickable
        },
        end_encounter:function(){
            scene.dScene.onclick = null
            keymap.remCommand(func.cont)
            scene.dScene.style.visibility = "hidden"
            func.func.start_music("sejan/map", 90)
            //spawn player if they don't exist yet
            if(!map.loc)map.updateMap("default", 11, true)
            //set player back if environment is blocking
            else if(scene.block == "yes")setTimeout(function(){map.move(map.oldLoc, true)})
        },
        //pointer can be skipped to use saved pointer
        start_encounter:function(env, char, point){
            scene.startScene(char, env, null, point)
        },
        set_map_location:function(location){
            for(var i = map.array.length - 1; i >= 0; i--) {
                if(map.array[i][4] === location) {
                   map.move(i, true)
                   return
                }
            }
            alert('could not find location :' + location + " to set the player to")
        },
//        start_combat:function(lose, win){
//
//        },
//        combat_damage:function(receiver, hp){
//
//        },
//        combat_heal:function(receiver, hp){
//        },
//        player_death:function(){
//        },
        advance_time:function(time){
            map.advTime(time * 2)
        },
        //can also use words for time of day, has fadeout effect
        advance_time_to:function(time){
            //todo fadeout-effect
            map.advTime((time * 2) - save.time)
        },
        start_music:function(name, volume, fOut, fIn, noLoop){
            func.fade.clearFades()
            if(!noLoop){
                func.music.onended = function(){
                    func.music.currentTime = 0
                    func.music.play()
                }
            }
            else func.music.onended = null
            func.music.volume = 0
            func.fade.fIn = fIn
            func.fade.fOut = fOut
            func.fade.vol = volume / 100
            func.music.onplay = func.fade.start
            func.music.src = DB.asset("audio/music/" + name + ".mp3")
        },
        stop_music:function(fOut){
            func.music.onended = null
            func.fade.clearFades()
            if(fOut){
                var refTime = func.music.currentTime + fOut
                func.fade.iOut = setInterval(function(){
                    var newVol = (refTime - func.music.currentTime) / fOut
                    if(newVol <= 0){
                        func.music.volume = 0
                        func.music.pause()
                        clearInterval(func.fade.iOut)
                    }else func.music.volume = newVol * func.fade.vol
                })
            }else func.music.pause()
        },
        play_sound:function(name, vol, isEnv){
            var newAudio = document.createElement("audio")
            newAudio.autoplay = true;
            newAudio.volume = vol / 100
            if(isEnv){
                newAudio.loop = true
                newAudio.src = DB.asset("audio/environment/" + name + ".mp3")
                func.envSounds.appendChild(newAudio)
            }else{
                newAudio.onended = function(){
                    if(func.sounds.contains(newAudio))func.sounds.removeChild(newAudio)
                }
                newAudio.src = DB.asset("audio/sounds/" + name + ".mp3")
                func.sounds.appendChild(newAudio)
            }
        },
//        change_env_sounds:function(vol){
//            //todo 2.10 feature
//        },
//        //--Shop functions--
//        start_shop:function(ret){
//            //todo not doing that anytime soon
//        },
//        //--World map operations--
        discover_location:function(loc){
            if(!func.condition.has_discovered(loc))save.disLoc.push(loc)
        },
        remove_location:function(loc){
            for(var i = save.disLoc.length - 1; i >= 0; i--) {
                if(array[i] === loc) {
                   save.disLoc.splice(i, 1);
                }
            }
        }
    },
    //music fade manager
    fade:{
        //stops all pending audio changes
        clearFades:function(){
            clearTimeout(func.fade.tOut)
            clearInterval(func.fade.iIn)
            clearInterval(func.fade.iOut)
        },
        //creates the fade effects
        start:function(){
            if(func.fade.fIn){
                //fade-in effect
                func.fade.fIn = setInterval(function(){
                    var newVol = func.music.currentTime / func.fade.fIn
                    if(newVol > 1){
                        func.music.volume = func.fade.vol
                        clearInterval(func.fade.iIn)
                    }else func.music.volume = newVol * func.fade.vol
                })
            } else func.music.volume = func.fade.vol
            if(func.fade.fOut){
                //fade-out effect, has a timeout that waits until the start of the fade-out
                func.fade.tOut = setTimeout(function(){
                    func.fade.iOut = setInterval(function(){
                        var newVol = (func.music.duration - func.music.currentTime) / func.fade.fOut
                        if(newVol > 1.2 || newVol == 0){
                            func.music.volume = 0
                            clearInterval(func.fade.iOut)
                        }else if(newVol <= 1) func.music.volume = newVol * func.fade.vol
                    })
                }, ((func.music.duration - func.fade.fOut) - func.music.currentTime) * 1000)
            }
        }
    },
    //func.func.auto_continue button logic
    cont:function(){
        scene.dScene.onclick = null
        keymap.remCommand(func.cont)
        scene.next(func.contP)
        return true
    },
    onLoad:function(){
        //audio DOM
        func.audio = document.getElementById("audio")
        func.music = document.createElement("audio")
        func.music.autoplay = true
        func.audio.appendChild(func.music)
        func.sounds = document.createElement("div")
        func.audio.appendChild(func.sounds)
        func.envSounds = document.createElement("div")
        func.audio.appendChild(func.envSounds)
    }
}

//alternate function names
func.func.hide_character = func.func.hide_sprite