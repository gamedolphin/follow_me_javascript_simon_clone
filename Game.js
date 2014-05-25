/*  Created by Nambiar for Game Dolphin (gamedolph.in)
    Game - Follow Me - Simple Simon Clone 
*/

BasicGame.Game = function (game) {
};

BasicGame.Game.prototype = {

	create: function () {
        //declare a few 'global' variables here
        this.score = 0;
        this.tapCount = 0;
        this.playSound = true;
        this.compDelay = 900;
        this.gameState = 'comp';
        this.counter = 0;

        //initialize the 4 boxes
        this.initBoxes();

        //create the rest of the interface - title image, instructions, etc
        this.titleimage = this.add.sprite(this.world.centerX,100,'spriteset');
        this.titleimage.frameName = 'title.png';
        this.titleimage.anchor.setTo(0.5,0.5);
        this.titleimage.scale.setTo(0.5,0.5);

        this.mask = this.add.sprite(0,0,'spriteset');
        this.mask.frameName = 'mask.png'
        this.mask.width = this.world.width;
        this.mask.height = this.world.height;
        this.mask.inputEnabled = true;
        this.mask.events.onInputDown.add(this.startGame,this);

        this.tapText = this.add.text(this.world.centerX, this.world.centerY, "Double Tap Screen\nto start!", { font: "30px Arial", fill: "#ffffff", align: "center" });
        this.tapText.anchor.setTo(0.5,0.5);
        this.instructionText = this.add.text(this.world.centerX, this.world.centerY+180, "Follow the pattern\nset by the computer.\nTap the same boxes\nin the same order.", { font: "20px Arial", fill: "#ffffff", align: "center" })
        this.instructionText.anchor.setTo(0.5,0.5);

        this.scoreText = this.add.text(this.world.centerX, this.world.centerY-150, "0", { font: "30px Arial", fill: "#ffffff", align: "center" });
        this.scoreText.anchor.setTo(0.5,0.5);
        this.scoreText.alpha = 0;

        this.playerText = this.add.text(this.world.centerX, this.world.centerY-190, "Computer", { font: "30px Arial", fill: "#ffffff", align: "center" });
        this.playerText.anchor.setTo(0.5,0.5);
        this.playerText.alpha = 0;

        this.musicButton = this.add.sprite(this.world.width-60,this.world.height-10,'spriteset');
        this.musicButton.frameName = 'music_on.png';
        this.musicButton.anchor.setTo(0,1);
        this.musicButton.scale.setTo(0.5,0.5);
        this.musicButton.inputEnabled = true;
        this.musicButton.input.useHandCursor = true;
        this.musicButton.events.onInputDown.add(this.musicToggle,this);

        this.tweetButton = this.add.sprite(this.world.centerX,this.world.height-10,'tweet');
        this.tweetButton.anchor.setTo(0.5,1);
        this.tweetButton.scale.setTo(0.5,0.5);
        this.tweetButton.inputEnabled = true;
        this.tweetButton.input.useHandCursor = true;
        this.tweetButton.events.onInputDown.add(this.tweetScore,this);
        this.tweetButton.alpha = 0;
        this.tweetButton.kill();
    },

    startGame : function(){
        if(this.tapCount==1){
            /* Tap count ensures that the user clicks/taps twice. Sometimes when the user clicks the boxes twice, 
            it may be a wrong click and hence the game over screen comes up BUT since he clicked twice, this startGame screen 
            is dismissed too. Hence the double click */

            //tween the interface.. .show some (alpha:1), hide some (alpha : 0)
            var temp = this.add.tween(this.mask).to({alpha : 0},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.tapText).to({alpha : 0},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.instructionText).to({alpha : 0},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.scoreText).to({alpha : 1},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.titleimage).to({y:50},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.playerText).to({alpha:1},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.tweetButton).to({alpha:0},500, Phaser.Easing.Sinusoidal.InOut, true);

            this.scoreText.setText('0');
            temp.onComplete.add(function(){
                this.mask.kill();
                this.tweetButton.kill();
            },this);

            this.tapCount=0;

            //start the computer turn
            this.compPlay();

        }
        else{
            this.tapCount++;
        }
    },

    initBoxes : function(){
        //initialize the sounds, and boxes
        this.fx = this.add.audio('sfx');
        this.fx.addMarker('death',4,0.5);
        this.playOrder = [];                //stores the computer's order
        this.boxes = this.add.group();
        this.initOneBox(0,-1,-1);
        this.initOneBox(1,1,-1);
        this.initOneBox(2,1,1);
        this.initOneBox(3,-1,1);

        this.playOrder.push(this.rnd.integerInRange(0,3)); // start the series with a choice between [0,3]

    },

    initOneBox : function(no,x,y){
        //initialize individual boxes
        var temp = this.add.sprite(this.world.centerX+60*x,this.world.centerY+60*y,'spriteset');
        this.fx.addMarker('box'+no,no, 0.5);
        temp.no = no+1;
        temp.frameName = 'box'+(no+1)+'.png';
        temp.anchor.setTo(0.5,0.5);
        temp.scale.setTo(0.5,0.5);
        temp.inputEnabled = true;
        temp.defaultFr = function(){
            this.frameName = 'box'+(this.no)+'.png';
        };
        temp.glowFrame = function(){
            this.frameName = 'box'+(this.no)+'glow.png';
        };
        temp.events.onInputDown.add(function(){
            //only respond to input if its the player's turn
            if(this.gameState=='player'){
                this.chooseShape(temp);
            }
        }, this);
        this.boxes.add(temp);
    },

    compPlay : function(){
        //computer's turn
        this.gameState = 'comp';  
        this.playerText.setText('Computer\'s Turn');
        var i=0;
        for(i=1;i<=this.playOrder.length;i++){
            var temp = this.boxes.getAt(this.playOrder[i-1]); 
            //add events to timer at regular intervals
            this.time.events.add(this.compDelay*i, this.chooseShape,this,temp);
        }
        this.time.events.add(this.compDelay*i,function(){
            this.counter = 0;
            this.gameState = 'player';
            this.playerText.setText('Your Turn');
            //after final turn of the computer, start player's turn
        },this);
    },

    chooseShape : function(a){
        //function that actually makes the boxes blink
        this.sound.stopAll();
        this.boxes.callAll('defaultFr');
        this.boxes.setAll('inputEnabled',false);
        a.glowFrame();
        if(this.playSound==true){
            //sounds played only if toggle set to true - controlled by musicToggle function
            this.fx.play('box'+(a.no-1));
        }
        this.time.events.add(400, this.resetFrames, this,a);
        
    },

    resetFrames : function(a){
        //function that resets the boxes
        this.sound.stopAll();
        this.boxes.callAll('defaultFr');
        this.boxes.setAll('inputEnabled',true);
        if(this.gameState=='player'&&this.counter<this.playOrder.length){
            //check for lose condition 
            if(this.playOrder[this.counter]!=a.no-1){
                this.resetGame();
                return;
            }
            this.counter++;  //keeps track of the player's number of moves
            //check if the player has completed all the steps
            if(this.counter>=this.playOrder.length){
                this.score++;
                this.scoreText.setText(this.score);
                this.playOrder.push(this.rnd.integerInRange(0,3));
                this.time.events.removeAll();
                if(this.compDelay>500){
                    this.compDelay-=50;
                }
                this.compPlay();
            }
        }
    },

    resetGame : function(){
        //reset the UI and global variables after a lose condition
        this.sound.stopAll();
        this.instructionText.setText('You have\n'+this.score+' units\nof memory storage!');
        this.score = 0;
        this.playOrder.length = 0;
        this.playOrder.push(this.rnd.integerInRange(0,3));

        this.mask.visible = true;
        this.tweetButton.visible = true;

        if(this.playSound==true){
            this.fx.play('death');
        }

        var temp = this.add.tween(this.mask).to({alpha : 1},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.tapText).to({alpha : 1},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.instructionText).to({alpha : 1},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.scoreText).to({alpha : 0},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.titleimage).to({y:100},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.playerText).to({alpha:0},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.tweetButton).to({alpha:1},500, Phaser.Easing.Sinusoidal.InOut, true);

        temp.onComplete.add(function(){
            this.mask.reset(0,0);
            this.tweetButton.reset(this.world.centerX,this.world.height-10);
        },this);
    },

	musicToggle : function(){
        //toggle the sound effects flag
        if(this.playSound==true){
            this.musicButton.frameName = 'music_off.png';
            this.playSound = false;
        }
        else{
            this.musicButton.frameName = 'music_on.png';
            this.playSound = true;
        }
    },

    tweetScore : function(){
        //share score on twitter
        var tweetbegin = 'http://twitter.com/home?status=';
        var tweettxt = 'This game - '+window.location.href+'- says I have '+this.score+' units of memory!';
        var finaltweet = tweetbegin +encodeURIComponent(tweettxt);
        window.open(finaltweet,'_blank');
    }
};
