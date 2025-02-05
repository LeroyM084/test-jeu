class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 50;
    this.color = "blue";
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravity = 0.4;
    this.isJumping = false;
    this.speed = 5;
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
  }

  update(platforms, doors) {
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

class AnimationManager {
  constructor(playerElement, totalFrames) {
    this.playerElement = playerElement;
    this.totalFrames = totalFrames;
    this.currentFrame = 0;
    this.isJumping = false;
    this.isWalking = false;
    this.isIdle = true;
  }

  updateAnimation() {
    if (this.isIdle) {
      this.playerElement.style.backgroundPosition = "0 0";
    } else if (this.isWalking) {
      let frameX = this.currentFrame * -50;
      this.playerElement.style.backgroundPosition = `${frameX}px 0`;
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
    } else if (this.isJumping) {
      this.playerElement.style.backgroundPosition = `-${
        this.currentFrame * 50
      }px -50px`;
      this.currentFrame = (this.currentFrame + 1) % 3;
    }
  }

  startWalking() {
    this.isWalking = true;
    this.isIdle = false;
    this.isJumping = false;
  }

  startJumping() {
    this.isJumping = true;
    this.isWalking = false;
    this.isIdle = false;
    this.currentFrame = 0;
  }

  stopWalking() {
    this.isWalking = false;
    this.isIdle = true;
  }
}

// Initialisation
let playerElement = document.getElementById("player");
let animationManager = new AnimationManager(playerElement, 4);

function gameLoop() {
  animationManager.updateAnimation();
  requestAnimationFrame(gameLoop);
}

gameLoop();

// Gestion des événements de clavier
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    animationManager.startWalking();
  }
  if (event.key === " ") {
    animationManager.startJumping();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowRight") {
    animationManager.stopWalking();
  }
});
