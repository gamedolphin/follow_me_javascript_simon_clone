/*  Created by Nambiar for Game Dolphin (gamedolph.in)
    Game - Follow Me - Simple Simon Clone 
*/

BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		
		this.bck = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBackground');
		this.bck.anchor.setTo(0.5,0.5);
		this.bck.scale.setTo(0.5,0.5);
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
		this.preloadBar.anchor.setTo(0,0.5);
		this.preloadBar.scale.setTo(0.5,1);
		this.preloadBar.x = this.world.centerX - this.preloadBar.width/2;
		
		
		this.load.setPreloadSprite(this.preloadBar);

		this.load.atlas('spriteset', 'assets/spriteset.png', 'assets/spriteset.jsona');
		this.load.image('tweet','assets/twit.png');
		this.load.audio('sfx', ['assets/sfx.mp3','assets/sfx.ogg','assets/sfx.wav','assets/sfx.m4a']);


	},

	create: function () {

		this.preloadBar.cropEnabled = false;

	},

	update: function () {

		
		
		if (this.cache.isSoundDecoded('sfx') && this.ready == false)
		{
			this.ready = true;
			this.state.start('Game');
		}

	}

};
