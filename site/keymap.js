//manages button-presses for the game, later also responsible for remapping
keymap = {
    //functions that subscribed to receive key-presses
    //if function returns true = event resolved no going to next function
    commands:[],
    //adds a command if it doesn't exist yet
    addCommand:function(com){
        if(keymap.commands.indexOf(com) == -1)keymap.commands.push(com)
    },
    remCommand:function(com){
        var i = keymap.commands.indexOf(com)
        if(com != -1) keymap.commands.splice(i, 1)
    }

}
//code for handling the key press commands
window.onkeydown = function(e){
    for(i=keymap.commands.length - 1;i>=0;i--)if(keymap.commands[i](e))break
}