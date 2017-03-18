window.onload = function() {	
	var game = new Phaser.Game(640, 640, Phaser.CANVAS);
	var critter;
	var critterGravity = 800;
    var cloudGravity = -150;
	var critterJumpPower;    
	var score=0;
	var scoreText;
     var topScore;
     var powerBar;
     var powerTween;
     var placedPoles;
	var poleGroup; 
     var minPoleGap = 100;
     var maxPoleGap = 300; 
     var critterJumping;
     var critterFallingDown;     
     var play = function(game){}     
     play.prototype = {
		preload:function(){
			game.load.image("critter", "critter.png"); 
			game.load.image("pole", "cloud.png");
               game.load.image("powerbar", "powerbar.png");
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;game.scale.setScreenSize( true );
		},
		create:function(){
			critterJumping = false;
			critterFallingDown = false;
			score = 0;
			placedPoles = 0;
			poleGroup = game.add.group();
			topScore = localStorage.getItem("topFlappyScore")==null?0:localStorage.getItem("topFlappyScore");
			scoreText = game.add.text(10,10,"-",{
				font:"bold 16px Arial"
			});
			updateScore();
			game.stage.backgroundColor = "#2979FF";
			game.physics.startSystem(Phaser.Physics.ARCADE);
			critter = game.add.sprite(80,0,"critter");
			critter.anchor.set(0.5);
			critter.lastPole = 1;
			game.physics.arcade.enable(critter);              
			critter.body.gravity.y = critterGravity;
			game.input.onDown.add(prepareToJump, this);
			addPole(80);
		},
		update:function(){
			game.physics.arcade.collide(critter, poleGroup, checkLanding);
			if(critter.y>game.height){
				die();
			}
		}
	}     
     game.state.add("Play",play);
     game.state.start("Play");
	function updateScore(){
		scoreText.text = "Score: "+score+"\nBest: "+topScore;	
	}     
	function prepareToJump(){
		
	          powerBar = game.add.sprite(critter.x,critter.y-50,"powerbar");
	          powerBar.width = 0;
	          powerTween = game.add.tween(powerBar).to({
			   width:100
			}, 1000, "Linear",true); 
	          game.input.onDown.remove(prepareToJump, this);
	          game.input.onUp.add(jump, this);
                	
	}     
     function jump(){
          critterJumpPower= -powerBar.width*3-100
          powerBar.destroy();
          game.tweens.removeAll();
          critter.body.velocity.y = critterJumpPower*2.2;
          critterJumping = true;
          powerTween.stop();
          game.input.onUp.remove(jump, this);
     }     
     function addNewPoles(){
     	var maxPoleX = 0;
		poleGroup.forEach(function(item) {
			maxPoleX = Math.max(item.x,maxPoleX)			
		});
		var nextPolePosition = maxPoleX + game.rnd.between(minPoleGap,maxPoleGap);
		addPole(nextPolePosition);			
	}
	function addPole(poleX){
		if(poleX<game.width*2){
			placedPoles++;
			var pole = new Pole(game,poleX,game.rnd.between(250,380));
			game.add.existing(pole);
	          pole.anchor.set(0.5,0);
			poleGroup.add(pole);
			var nextPolePosition = poleX + game.rnd.between(minPoleGap,maxPoleGap);
			addPole(nextPolePosition);
		}
	}	
	function die(){
		localStorage.setItem("topFlappyScore",Math.max(score,topScore));	
		game.state.start("Play");
	}
	function checkLanding(n,p){
		if(p.y>=n.y+n.height/2){
			var border = n.x-p.x
			if(Math.abs(border)>20){
				n.body.velocity.x=border*2;
				n.body.velocity.y=-100;	
			}
			var poleDiff = p.poleNumber-n.lastPole;
			if(poleDiff>0){
				score+= Math.pow(2,poleDiff);
				updateScore();	
				n.lastPole= p.poleNumber;
			}
			if(critterJumping){
               	critterJumping = false;              
               	game.input.onDown.add(prepareToJump, this);
          	}
		}
		else{
			critterFallingDown = true;
			poleGroup.forEach(function(item) {
				item.body.velocity.x = 0;			
			});
		}			
	}
	Pole = function (game, x, y) {
		Phaser.Sprite.call(this, game, x, y, "pole");
		game.physics.enable(this, Phaser.Physics.ARCADE);
          //this.body.immovable = true;
          this.poleNumber = placedPoles;
          this.body.drag.setTo(9000);    
	};
	Pole.prototype = Object.create(Phaser.Sprite.prototype);
	Pole.prototype.constructor = Pole;
	Pole.prototype.update = function() {
          if(critterJumping && !critterFallingDown){
               this.body.velocity.x = critterJumpPower;
          }
          else{
               this.body.velocity.x = 0
          }
		if(this.x<-this.width){
			this.destroy();
			addNewPoles();
		}
	}	
}