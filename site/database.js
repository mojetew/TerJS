//handles the reading of the files so that later mods can be implemented more easily
//todo add mod support here
DB = {
    mods:[],
    //returns a string that can be used in an image or audio src
    //url = location of the asset
    asset:function(url){
            return url;
    },
    //retrieves the contents of a JS file
    //url = location of the asset
    //func = what to do with the asset
    get:function(url, func){
        DB.script = document.createElement("script");
        DB.DB.appendChild(DB.script);
        DB.script.onload = function(){func($)};
        DB.script.src = url + ".js";
        DB.DB.removeChild(DB.script);
    },
    //help function to allow a default if there is no data in the container
    //dir = directory
    //val = value to read from directory
    //def = what to return if it doesn't have data
    readOrDefault:function(dir, val, def){
        if(dir && dir[val])return dir[val];
        else return def;
    },
    onLoad:function(){
        DB.DB = document.getElementById("DB");
    }
}