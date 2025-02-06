//Fichier player.js
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 50;
    this.color = "blue";
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravity = 0.3;
    this.isJumping = false;
    this.speed = 2.5;
    this.coins = 0;
    this.deathCount = 0;
    this.startX = x;
    this.startY = y;
    this.clées = 0;

    // Points de spawn
    this.startX = x;
    this.startY = y;
    this.spawnX = x;
    this.spawnY = y;

    this.spriteSheet = new Image();
    this.spriteSheet.src = 'chemin/vers/votre/spritesheet.png';
    
    // Initialiser le gestionnaire d'animations
    this.animationManager = new SpriteAnimationManager(this.spriteSheet, {
        frameWidth: 32,  // Ajustez selon la taille de vos sprites
        frameHeight: 32, // Ajustez selon la taille de vos sprites
        idleFrames: 4,   // Nombre de frames pour l'animation idle
        walkFrames: 6,   // Nombre de frames pour l'animation de marche
        jumpFrames: 2,   // Nombre de frames pour l'animation de saut
        idleRow: 0,      // Ligne pour l'animation idle dans le spritesheet
        walkRow: 1,      // Ligne pour l'animation de marche
        jumpRow: 2,      // Ligne pour l'animation de saut
        idleSpeed: 200,  // Vitesse de l'animation idle
        walkSpeed: 100,  // Vitesse de l'animation de marche
        jumpSpeed: 150   // Vitesse de l'animation de saut
    });

  }

  update(platforms, doors, timestamp) {
    // Ajouter doors comme paramètre
    this.velocityY += this.gravity;
  
    const oldX = this.x;
    const oldY = this.y;
  
    let newY = this.y + this.velocityY;
    let newX = this.x + this.velocityX;
  
    let isOnGround = false;
  
    // Vérifier les collisions avec les plateformes
    for (let platform of platforms) {
      if (platform instanceof DisappearingPlatform && !platform.isVisible) {
        continue;
      }
  
      if (this.checkCollision(newX, this.y, platform)) {
        if (this.velocityX > 0) {
          newX = platform.x - this.width;
        } else if (this.velocityX < 0) {
          newX = platform.x + platform.width;
        }
        this.velocityX = 0;
      }
  
      if (this.checkCollision(newX, newY, platform)) {
        if (oldY + this.height <= platform.y) {
          newY = platform.y - this.height;
          this.velocityY = 0;
          isOnGround = true;
          this.isJumping = false;
  
          if (platform instanceof DisappearingPlatform) {
            platform.handleCollision(this);
            if (!platform.isVisible) {
              newY = oldY + this.velocityY;
              isOnGround = false;
              this.isJumping = true;
            }
          }
        } else if (oldY >= platform.y + platform.height) {
          newY = platform.y + platform.height;
          this.velocityY = 0;
        }
      }
    }
  
    // Vérifier les collisions avec les portes fermées
    for (let door of doors) {
      if (!door.isOpen) {
        // Seulement vérifier les portes fermées
        if (this.checkCollision(newX, this.y, door)) {
          if (this.velocityX > 0) {
            newX = door.x - this.width;
          } else if (this.velocityX < 0) {
            newX = door.x + door.width;
          }
          this.velocityX = 0;
        }
  
        if (this.checkCollision(newX, newY, door)) {
          if (oldY + this.height <= door.y) {
            newY = door.y - this.height;
            this.velocityY = 0;
            isOnGround = true;
            this.isJumping = false;
          } else if (oldY >= door.y + door.height) {
            newY = door.y + door.height;
            this.velocityY = 0;
          }
        }
      }
    }
  
    this.x = newX;
    this.y = newY;
    
    if (this.isJumping) {
      this.animationManager.setAnimation('jump', this.velocityX >= 0);
    } else if (Math.abs(this.velocityX) > 0) {
      this.animationManager.setAnimation('walk', this.velocityX >= 0);
    } else {
      this.animationManager.setAnimation('idle', this.animationManager.facingRight);
    }
  
    this.animationManager.update(timestamp);
  } // Fin de la méthode update
  
  draw(ctx) {
    this.animationManager.draw(ctx, this.x, this.y, this.width, this.height);
  }
  

  // Ajouter une méthode helper pour vérifier les collisions
  checkCollision(x, y, platform) {
    return (
      x + this.width > platform.x &&
      x < platform.x + platform.width &&
      y + this.height > platform.y &&
      y < platform.y + platform.height
    );
  }

  jump() {
    if (!this.isJumping) {
      this.velocityY = -10;
      this.isJumping = true;
    }
  }

  moveLeft() {
    this.velocityX = -this.speed;
  }

  moveRight() {
    this.velocityX = this.speed;
  }

  stop() {
    this.velocityX = 0;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  collectCoin() {
    this.coins++;
  }

  collectclée() {
    this.clées++;
  }

  die(enemies, triggerZones, canvas) {
    this.deathCount++;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.clées = 0;

    // Réinitialiser les zones de déclenchement
    if (triggerZones) {
      triggerZones.forEach((zone) => {
        zone.reset();
        if (
          zone.enemy instanceof TriggerEnemy ||
          zone.enemy instanceof SpikeEnemy
        ) {
          const index = enemies.indexOf(zone.enemy);
          if (index > -1) {
            enemies.splice(index, 1);
          }
        }
      });
    }
  }

  setSpawnPoint(x, y) {
    this.spawnX = x;
    this.spawnY = y;
  }
}
class SpriteAnimationManager {
  constructor(spriteSheet, options) {
      this.spriteSheet = spriteSheet;
      this.frameWidth = options.frameWidth;
      this.frameHeight = options.frameHeight;
      this.animations = {
          idle: {
              frames: options.idleFrames || 1,
              row: options.idleRow || 0,
              speed: options.idleSpeed || 100
          },
          walk: {
              frames: options.walkFrames || 1,
              row: options.walkRow || 0,
              speed: options.walkSpeed || 100
          },
          jump: {
              frames: options.jumpFrames || 1,
              row: options.jumpRow || 0,
              speed: options.jumpSpeed || 100
          }
      };
      
      this.currentAnimation = 'idle';
      this.currentFrame = 0;
      this.lastFrameTime = 0;
      this.facingRight = true;
  }

  update(timestamp) {
      const animation = this.animations[this.currentAnimation];
      if (!this.lastFrameTime) this.lastFrameTime = timestamp;

      const deltaTime = timestamp - this.lastFrameTime;
      if (deltaTime >= animation.speed) {
          this.currentFrame = (this.currentFrame + 1) % animation.frames;
          this.lastFrameTime = timestamp;
      }
  }

  draw(ctx, x, y, width, height) {
      const animation = this.animations[this.currentAnimation];
      
      ctx.save();
      if (!this.facingRight) {
          ctx.translate(x + width, y);
          ctx.scale(-1, 1);
          x = 0;
      }

      ctx.drawImage(
          this.spriteSheet,
          this.currentFrame * this.frameWidth,
          animation.row * this.frameHeight,
          this.frameWidth,
          this.frameHeight,
          x,
          y,
          width,
          height
      );
      ctx.restore();
  }

  setAnimation(animationName, faceRight = true) {
      if (this.currentAnimation !== animationName) {
          this.currentAnimation = animationName;
          this.currentFrame = 0;
          this.lastFrameTime = 0;
      }
      this.facingRight = faceRight;
  }
}