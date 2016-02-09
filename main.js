var sb1 = 0;
var sb2 = 0;
var totalDistance = 0;
var maxX = 0;

var defaultGround = 705;
var defaultScroll = 250;
var defaultJumpHeight = 200;

var unlocked;
var bgmove;

var standLeft;
// platforms animation
function AnimationPlatform(image, frameWidth, frameHeight, imageX, imageY, imageScrolling) {
    this.image = image;
    this.width = frameWidth;
    this.height = frameHeight;
    this.imageX = imageX;
    this.imageY = imageY;
    this.scroll = imageScrolling;
    this.elapsedTime = 0;
}

AnimationPlatform.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;

    if (this.scroll) {
        ctx.drawImage(this.image,
                  sb2, 0,  // source from sheet
                  this.width, this.height,
                  this.imageX, this.imageY,
                  this.width, this.height
                  );

        ctx.drawImage(this.image,
                  sb1, 0,  // source from sheet
                  this.width, this.height,
                  this.imageX, this.imageY,
                  this.width, this.height
                  );
    } else if (maxX >= 250){
        ctx.drawImage(this.image,
            0, 0, this.width, this.height,
            this.imageX - maxX, this.imageY,
            this.width, this.height);
    } else {
        ctx.drawImage(this.image,
            0, 0, this.width, this.height,
            this.imageX, this.imageY,
            this.width, this.height);
    }
}
AnimationPlatform.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

AnimationPlatform.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// sprites animation
function AnimationSprite(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

AnimationSprite.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    ctx.drawImage(this.spriteSheet,
            index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
            this.frameWidth, this.frameHeight,
            locX, locY,
            this.frameWidth * scaleBy,
            this.frameHeight * scaleBy);
}

AnimationSprite.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

AnimationSprite.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
 }

function Platform(game, platformSprite, width, height, startX, startY, scroll) {
    this.animation = new AnimationPlatform(platformSprite, width, height, startX, startY, scroll);
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    Entity.call(this, game, startX, startY);
    this.radius = height / 2;
}

Platform.prototype = new Entity();

Platform.prototype.constructor = Platform;

Platform.prototype.beginingX = function () {
    return this.startX - maxX;
}

Platform.prototype.endingX = function () {
    return this.startX + this.width - maxX;
}

Platform.prototype.top = function () {
    return this.startY;
}

Platform.prototype.bottom = function () {
    return this.startY + this.height;
}

Platform.prototype.update = function () {

    Entity.prototype.update.call(this);
}

Platform.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, 0, 0, 0);
    Entity.prototype.draw.call(this);
}

/*
 * Minions
 */
function Minion(game, minionSprite, frameHeight, frameWidth, startX, startY,
    walking1, walking2, placeX, placeY, loop, speed, leftOffset, rightOffset) {

    if (walking1 > 0) {
        this.animationWalkingLeft1 = new AnimationSprite(minionSprite, startX, (startY * 0),
            frameWidth, frameHeight, speed, walking1, loop, false);
        this.animationWalkingRight1 = new AnimationSprite(minionSprite, startX, (startY * 1),
            frameWidth, frameHeight, speed, walking1, loop, false);
    }

    if (walking2 > 0) {
        this.animationWalkingLeft2 = new AnimationSprite(minionSprite, startX, (startY * 5),
            frameWidth, frameHeight, speed, walking2, loop, false);
        this.animationWalkingRight2 = new AnimationSprite(minionSprite, startX, (startY * 6),
            frameWidth, frameHeight, speed, walking2, loop, false);
    }
    this.index = 0;
    this.width = frameWidth;
    this.radius = frameHeight / 2;
    this.y = placeY;
    this.x = placeX;
    this.speed = speed;
    this.moveRight = false;
    this.use1 = (walking1 > 0);
    this.leftOffset = leftOffset;
    this.rightOffset = rightOffset;
    this.check = true;
    Entity.call(this, game, placeX, placeY);
}

Minion.prototype = new Entity();

Minion.prototype.constructor = Minion;

Minion.prototype.beginingX = function () {
    return this.x - maxX + this.leftOffset;
}

Minion.prototype.endingX = function () {
    return this.x + this.width - maxX + this.rightOffset;
}

Minion.prototype.top = function () {
    return this.y;
}

Minion.prototype.bottom = function () {
    return this.y + this.height;
}

Minion.prototype.update = function () {

    if (this.moveRight) {
        this.x += 1;
        if (this.check) {
            if (this.endingX() >= this.game.entities[this.index + 1].beginingX()) {
                this.moveRight = false;
                this.check = false;
            }
        } else {
            this.check = true;
        }
    } else {
        this.x -= 1;
        if (this.check) {
            if (this.beginingX() <= this.game.entities[this.index - 1].endingX()) {
                this.moveRight = true;
                this.check = false;
            }
        } else {
            this.check = true;
        }
    }

    Entity.prototype.update.call(this);
}

Minion.prototype.draw = function (ctx) {

    if (this.moveRight) {
        if (this.use1) {
            this.animationWalkingRight1.drawFrame(this.game.clockTick, ctx, this.x - maxX, this.y, 2);
        } else {
            this.animationWalkingRight2.drawFrame(this.game.clockTick, ctx, this.x - maxX, this.y, 2);
        }
    } else {
        if (this.use1) {
            this.animationWalkingLeft1.drawFrame(this.game.clockTick, ctx, this.x - maxX, this.y, 2);
        } else {
            this.animationWalkingLeft2.drawFrame(this.game.clockTick, ctx, this.x - maxX, this.y, 2);
        }
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/skybg2.png");
ASSET_MANAGER.queueDownload("./img/groundbg2.png");
ASSET_MANAGER.queueDownload("./img/koopa2.png");
ASSET_MANAGER.queueDownload("./img/Pipe.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var world1 = ASSET_MANAGER.getAsset("./img/skybg2.png");
    var ground1 = ASSET_MANAGER.getAsset("./img/groundbg2.png");
    var Koopa = ASSET_MANAGER.getAsset("./img/koopa2.png");
    var pipe = ASSET_MANAGER.getAsset("./img/Pipe.png");

    var pipeWidth = prompt("How much distance between pipes from 150 to 700?");
    if (pipeWidth < 150) pipeWidth = 150;
    if (pipeWidth > 700) pipeWidth = 700;

    var gameEngine = new GameEngine();
    var bg = new Platform(gameEngine, world1, 800, defaultGround, 0, 0, true);
    var gr = new Platform(gameEngine, ground1, 800, 95, 0, defaultGround, true);
    var t1 = new Platform(gameEngine, pipe, 98, 150, 0, 555, false);
    var t2 = new Platform(gameEngine, pipe, 98, 150, pipeWidth, 555, false);

    gameEngine.addEntity(gr);
    gameEngine.addEntity(bg);
    gameEngine.addEntity(t1);

    //var koopaSpeed = prompt("How fast should the koopa be walking?");

    var m1 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        6, 8, 100, 595, true, .2, 25, 10);
    var m2 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        0, 8, 150, 595, true, .2, 25, 10);
    var m3 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        6, 8, 200, 595, true, .2, 25, 10);
    var m4 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        0, 8, 250, 595, true, .2, 25, 10);
    var m5 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        6, 8, 300, 595, true, .2, 25, 10);
    var m6 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        0, 8, 350, 595, true, .2, 25, 10);
    var m7 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        6, 8, 400, 595, true, .2, 25, 10);
    var m8 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        0, 8, 450, 595, true, .2, 25, 10);
    var m9 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        6, 8, 500, 595, true, .2, 25, 10);
    var m10 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        0, 8, 550, 595, true, .2, 25, 10);
    var m11 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        6, 8, 600, 595, true, .2, 25, 10);
    var m12 = new Minion(gameEngine, Koopa, 55.968, 40.032, 0, 55.968,
        0, 8, 650, 595, true, .2, 25, 10);

    var maxKoopa = Math.floor((pipeWidth - 100) / 50);
    var koopaNum = prompt("How many koopa's do you want? Choose from 1 to " + maxKoopa + ".")
    if (koopaNum < 1) koopaNum = 1;
    if (koopaNum > maxKoopa) koopaNum = maxKoopa;

    gameEngine.addEntity(m1);
    m1.index = gameEngine.numOf - 1;
    if (koopaNum >= 2) {
        gameEngine.addEntity(m2);
        m2.index = gameEngine.numOf - 1;
        if (koopaNum >= 3) {
            gameEngine.addEntity(m3);
            m3.index = gameEngine.numOf - 1;
            if (koopaNum >= 4) {
                gameEngine.addEntity(m4);
                m4.index = gameEngine.numOf - 1;
                if (koopaNum >= 5) {
                    gameEngine.addEntity(m5);
                    m5.index = gameEngine.numOf - 1;
                    if (koopaNum >= 6) {
                        gameEngine.addEntity(m6);
                        m6.index = gameEngine.numOf - 1;
                        if (koopaNum >= 7) {
                            gameEngine.addEntity(m7);
                            m7.index = gameEngine.numOf - 1;
                            if (koopaNum >= 8) {
                                gameEngine.addEntity(m8);
                                m8.index = gameEngine.numOf - 1;
                                if (koopaNum >= 9) {
                                    gameEngine.addEntity(m9);
                                    m9.index = gameEngine.numOf - 1;
                                    if (koopaNum >= 10) {
                                        gameEngine.addEntity(m10);
                                        m10.index = gameEngine.numOf - 1;
                                        if (koopaNum >= 11) {
                                            gameEngine.addEntity(m11);
                                            m11.index = gameEngine.numOf - 1;
                                            if (koopaNum === 12) {
                                                gameEngine.addEntity(m12);
                                                m12.index = gameEngine.numOf - 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    gameEngine.addEntity(t2);
    gameEngine.init(ctx);
    gameEngine.start();
    console.log(gameEngine.numOf);
});