var tick;
var autoPause;

//Grabbing character divs
var player;
var enemy;

//List of creatures
var creatures = {
    player: {},
    enemy: {}
};
var tribes = {
    "grassland":"",
    "frostbite":"saturate(4) hue-rotate(90deg)",
    "sunflower":"saturate(7) hue-rotate(305deg)",
};

var active = ["troll_1","troll_3"]; //The creatures on the battlefield

const images = "assets/images/";
var preloader = []; //Preloading all of the sprite animations
var debounce = false;
var entered = false; 

function addAnim(creature, animName, frames, size, bgX, bgY, wait, plays) {
    //Creating seperate character objects for both player and enemy
    for (var i = 0; i < 2; i++) {
    let user;
    if (i == 0) {
        user = "player";
    }
    else {
        user = "enemy";
    };
    //Checking for existing creature name
    let newCreature = creatures[user][creature];
    if (!newCreature) {
        newCreature = {};
    };
    
    newCreature.currFrame = 0; //FPS useage

    newCreature.currentAnim = "walk";   

    animName = animName.toLowerCase();
    newCreature[animName] = {};
    newCreature[animName].keyFrames = [];
    newCreature[animName].wait = wait; //How long to wait between keyFrames
    newCreature[animName].frame = 0; //Animation's current keyFrame
    newCreature[animName].plays = plays; //Amount of times to play animation

    //Background image sizing/positioning for different sized png animation tracks
    newCreature[animName].bgX = bgX;
    newCreature[animName].bgY = bgY;
    newCreature[animName].size = size;
    
    //Looping through current animation's keyFrames
    for (let i = 0; i < frames; i++) {
        //Checking how many 0's to place before keyFrame number
        let pos = i;
        if (i < 10) {
            pos = "00" + i;
        }
        else if (i < 100) {
            pos = "0" + i;
        }
        //Adding image location to the current animation's keyFrame list
        newCreature[animName].keyFrames.push(images + creature + "/" + animName + "_" + pos + ".png");
        if (user == "player") {
            //Preloading each image
            preloader.unshift(new Image());
            preloader[0].src = images + creature + "/" + animName + "_" + pos + ".png";
        }
    };
    
    creatures[user][creature] = newCreature; //To ensure the creature is up to date within the list of creatures
    };
    
};

function swapEnemy(newTroll) {
    if (!entered) {return};
    entered = false;
    if (enemy.css("opacity") == 0) {
        enemy.css({"opacity":"1","left":"185vh"});

        $("#" + active[1]).css("display","block");
        $("#enemy-health").find(".thumbnail").css("background-image",$("#" + newTroll).css("background-image"));
        $("#" + newTroll).css("display","none");
        active[1] = newTroll;
        enemy.parent().animate({"left":"80vh"},5000,"linear", function() {
            creatures.enemy[active[1]].currentAnim = "idle";
            entered = true;
        });
    }
    else {
        creatures.enemy[active[1]].currentAnim = "walk";
        enemy.css("transform","scaleX(1)");
        enemy.parent().animate({"left":"185vh"},5000,function(){
            enemy.css("transform","scaleX(-1)");
            $("#" + active[1]).css("display","block");
            $("#enemy-health").find(".thumbnail").css("background-image",$("#" + newTroll).css("background-image"));
            $("#" + newTroll).css("display","none");
            active[1] = newTroll;        
            enemy.parent().animate({"left":"80vh"},5000,"linear", function() {
                creatures.enemy[active[1]].currentAnim = "idle";
                entered = true;
            });
        });
    };
};

function damageDisplay(troll,dmg) {
    var newTag = $('<h2>');
    //Default styling for damage display
    var style = {
        "position":"absolute",
        "top":"40%",
        "color":"red",
        "font-size":"24px",
    }
    //Which side to base positioning on
    var dir = "right";
    if (troll == enemy) {
        dir = "left";
    };
    style[dir] = "53%";
    newTag.css(style);
    newTag.text("-" + dmg);
    newTag.insertBefore(troll); //So troll will display in the foreground
    newTag.animate({"top":"15%"},500);
    setTimeout(function() {
        newTag.animate({"opacity":0},350,function(){
            newTag.remove();
        });
    },200);
};

function attack(troll,user,name) {
    entered = false;
    $(".swapper").css({"background-color":"rgba(0,0,0,0.5)"});
    creatures[user][name].currentAnim = "walk";
    creatures[user][name].currFrame = 0;
    var originPos = parseInt(troll.parent().css("left").match(/\d+/)[0]); //Grabs number from string
    var moveTo = window.innerHeight*0.4; //40% of the window height or 40vh
    var newPos;
    var direction;
    if (troll == player) {
        newPos = originPos + moveTo + "px";
        direction = 1;
    }
    else {
        newPos = originPos - moveTo + "px";
        direction = -1;
    }
    originPos = originPos + "px";
    troll.parent().animate({"left":newPos},2000,function() {
        creatures[user][name].currentAnim = "attack";   
        setTimeout(function() {
            if (direction == 1) {
                creatures.enemy[active[1]].currentAnim = "hurt";
                enemy.css("filter",(enemy.tribe + "brightness(75%)"));
                damageDisplay(enemy,30);
            }
            else {
                creatures.player[active[0]].currentAnim = "hurt";
                player.css("filter",(player.tribe + "brightness(75%)"));
            };
            setTimeout(function(){
                creatures[user][name]['attack'].frame = 0;
                creatures[user][name].currentAnim = "walk";
                troll.css("transform","scaleX(" + -direction + ")");
                troll.parent().animate({"left":originPos},2000,function() {
                    creatures[user][name].currentAnim = "idle";
                    troll.css("transform","scaleX(" + direction + ")");
                    entered = true;
                    $(".swapper").css({"background-color":""});
                });
            },200);
        },400);
        
    });
};

//Adding each set of animation tracks
addAnim("troll_1","Idle", 10, "65%", "65%", "60%", Math.floor(Math.random()*3)+3, "loop");
addAnim("troll_1","Walk", 10, "72%", "73%", "60%", 4, "loop");
addAnim("troll_1","Dead", 10, "73%", "88%", "79%", 4, 1);
addAnim("troll_1","Hurt", 10, "73%", "43%", "50%", 4, 1);
addAnim("troll_1","Attack", 10, "100%", "", "", 4, 1);

addAnim("troll_2","Idle", 10, "65%", "65%", "60%", Math.floor(Math.random()*3)+3, "loop");
addAnim("troll_2","Walk", 9, "72%", "73%", "60%", 4, "loop");
addAnim("troll_2","Dead", 10, "73%", "88%", "79%", 4, 1);
addAnim("troll_2","Hurt", 10, "73%", "43%", "50%", 4, 1);
addAnim("troll_2","Attack", 10, "100%", "", "", 4, 1);

addAnim("troll_3","Idle", 10, "65%", "65%", "60%", Math.floor(Math.random()*3)+3, "loop");
addAnim("troll_3","Walk", 9, "72%", "73%", "60%", 4, "loop");
addAnim("troll_3","Dead", 10, "73%", "88%", "79%", 4, 1);
addAnim("troll_3","Hurt", 10, "73%", "43%", "50%", 5, 1);
addAnim("troll_3","Attack", 10, "100%", "", "", 4, 1);

$(document).ready(function(){

player = $("#player");
player.tribe = tribes["grassland"];
enemy = $("#enemy");
enemy.tribe = tribes["sunflower"];

player.parent().css("left","-85vh");
enemy.parent().css("left","185vh");


player.css("filter",player.tribe);
$("#player-health").find(".thumbnail").css("filter",player.tribe);

$(".swapper").css("filter",enemy.tribe);
$("#" + active[1]).css("display","none");
$("#enemy-health").find(".thumbnail").css("filter",enemy.tribe);
enemy.css("filter",enemy.tribe);
enemy.css("transform","scaleX(-1)");



enemy.parent().animate({"left":"80vh"},5000,"linear", function() {
    creatures.enemy[active[1]].currentAnim = "idle";
});

player.parent().animate({"left":"20vh"},5000,"linear", function() {
    creatures.player[active[0]].currentAnim = "idle";
    entered = true;
});

function update(){ 
    for (var i = 0; i < active.length; i++) {
        let troll;
        let user;
        if (i == 0) {
            troll = player;
            user = "player";
        }
        else {
            troll = enemy;
            user = "enemy";
        };
        let creature = creatures[user][active[i]];
        let anim = creature[creature.currentAnim];

        if (anim && creature.currFrame % anim.wait == 0) {
            troll.css("background-image","url(" + anim.keyFrames[anim.frame] + ")");
            troll.css("background-size",anim.size);
            troll.css("background-position-x",anim.bgX);
            troll.css("background-position-y",anim.bgY);
            if (creature.currentAnim == "attack") {
                troll.parent().css("z-index",5); 
            }
            else {
                troll.parent().css("z-index",1); 
            };
            anim.frame++;
            if (anim.frame >= anim.keyFrames.length ) {
                anim.frame = 0;
                if (creature.currentAnim == "dead") {
                    anim.frame = anim.keyFrames.length-1;
                }
                else if (anim.plays != "loop") {
                    if (creature.currentAnim == "hurt") {
                        troll.css("filter",troll.tribe);
                    };
                    creature.currentAnim = "idle";
                    creature.currFrame = 0;
                };
            };
        };
        creature.currFrame++;
    };
};
tick = setInterval(update,17);

$(".swapper").on("click", function(event) {
    if (active[1] != this.id) {
        swapEnemy(this.id);
    }
});

$(document).on("keyup", function(event) {
    if (entered != true) {
        return;
    };
    var key = event.key.toLowerCase();
    switch (key) {
        case " ":
            attack(player,"player",active[0]);
        break;
        case "b":
            creatures.player[active[0]].currentAnim = "break";
        break;
    };
    creatures.player[active[0]].currFrame = 0;
});

//Resume when the user returns to the game window
$(window).focus(function(){
    console.log(tick);
    if (tick){return};
    clearTimeout(autoPause);
    autoPause = undefined;
    //Reloading images to fix flickering issues
    var newPreloader = [];
    for (var i = 0; i < preloader.length; i++) {
        let newImg = new Image();
        newImg.src = preloader[i].src;
        newPreloader.push(newImg);
    }
    preloader = newPreloader;
    newPreloader = null;
    //Resume fps handler
    tick = setInterval(update,17);
});

//Pause when the user leaves game window
$(window).blur(function(){
    if (autoPause){return};
    autoPause = setTimeout(function(){
        clearInterval(tick);
        tick = undefined;
    },1000*60);
});

});

