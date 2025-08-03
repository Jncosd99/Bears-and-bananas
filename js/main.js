let characters = [
    { name: "bear", x: 100, y: 450, size: 240, sprite: null, strength: 0.3, health: 25, hitTimer: 0, hitScale: 1, lastAngle: 45, lastPower: 50, throwLog: [] },
    { name: "squirrel", x: 900, y: 450, size: 150, sprite: null, strength: 0.2, health: 25, hitTimer: 0, hitScale: 1, lastAngle: 135, lastPower: 50, throwLog: [] }
];
let projectiles = [
    { name: "apple", size: 20, weight: 0.5, color: [255, 0, 0], sprite: null },
    { name: "banana", size: 25, weight: 0.4, color: [255, 255, 0], sprite: null },
    { name: "walnut", size: 10, weight: 0.2, color: [139, 69, 19], sprite: null },
    { name: "watermelon", size: 40, weight: 2.0, color: [0, 128, 0], sprite: null }
];
let currentProjectile = null;
let turn = 0;
let angle = 45;
let power = 50;
let projectileX, projectileY, velocityX, velocityY;
let isFiring = false;
let gravity = 0.5;
let gameOver = false;
let lastLanding = null;

function preload() {
    characters[0].sprite = loadImage('assets/bear.png');
    characters[1].sprite = loadImage('assets/squirrel.png');
    projectiles[0].sprite = loadImage('assets/apple.png');
    projectiles[1].sprite = loadImage('assets/banana.png');
    projectiles[2].sprite = loadImage('assets/walnut.png');
    projectiles[3].sprite = loadImage('assets/watermelon.png');
}

function setup() {
    createCanvas(1000, 600);
    currentProjectile = random(projectiles);
    angle = characters[turn].lastAngle;
    power = characters[turn].lastPower;
}

function draw() {
    background(135, 206, 235);
    fill(34, 139, 34);
    rect(100, 500, 800, 100);
    fill(139, 69, 19);
    rect(400, 400, 200, 100);

    // Draw trajectory preview
    if (!isFiring && !gameOver) {
        let tempX = characters[turn].x;
        let tempY = characters[turn].y;
        let radians = angle * PI / 180;
        let speed = power * characters[turn].strength * (currentProjectile.name === "watermelon" && characters[turn].name === "squirrel" ? 0.5 : 1);
        let vX = cos(radians) * speed;
        let vY = -sin(radians) * speed;
        stroke(255, 255, 255, 100);
        strokeWeight(2);
        for (let t = 0; t < 50; t++) {
            let x = tempX + vX * t * 0.1;
            let y = tempY + vY * t * 0.1 + 0.5 * gravity * (currentProjectile ? currentProjectile.weight : 0.5) * (t * 0.1) ** 2;
            point(x, y);
        }
        noStroke();
    }

    for (let char of characters) {
        if (char.hitTimer > 0) {
            char.hitTimer--;
            char.hitScale = 1 + 0.2 * sin(char.hitTimer * 0.2);
        } else {
            char.hitScale = 1;
        }
        if (char.sprite) {
            image(char.sprite, char.x - char.size * char.hitScale / 2, char.y - char.size * char.hitScale / 2, char.size * char.hitScale, char.size * char.hitScale);
        } else {
            fill(...char.color);
            ellipse(char.x, char.y, char.size * char.hitScale);
        }
    }

    if (isFiring && currentProjectile) {
        projectileX += velocityX;
        projectileY += velocityY;
        velocityY += gravity * currentProjectile.weight;

        if (currentProjectile.sprite) {
            image(currentProjectile.sprite, projectileX - currentProjectile.size / 2, projectileY - currentProjectile.size / 2, currentProjectile.size, currentProjectile.size);
        } else {
            fill(...currentProjectile.color);
            ellipse(projectileX, projectileY, currentProjectile.size);
        }

        if (projectileX > 400 && projectileX < 600 && projectileY > 400 && projectileY < 500) {
            isFiring = false;
            lastLanding = "S"; // Short
            characters[turn].throwLog[characters[turn].throwLog.length - 1].landing = lastLanding;
            characters[turn].lastAngle = angle;
            characters[turn].lastPower = power;
            turn = (turn + 1) % characters.length;
            angle = characters[turn].lastAngle;
            power = characters[turn].lastPower;
            currentProjectile = random(projectiles);
        }

        for (let i = 0; i < characters.length; i++) {
            if (i !== turn && dist(projectileX, projectileY, characters[i].x, characters[i].y) < (currentProjectile.size + characters[i].size / 2)) {
                characters[i].health -= 10 * currentProjectile.weight;
                characters[i].hitTimer = 20;
                isFiring = false;
                lastLanding = "H"; // Hit
                characters[turn].throwLog[characters[turn].throwLog.length - 1].landing = lastLanding;
                characters[turn].lastAngle = angle;
                characters[turn].lastPower = power;
                turn = (turn + 1) % characters.length;
                angle = characters[turn].lastAngle;
                power = characters[turn].lastPower;
                currentProjectile = random(projectiles);
            }
        }

        if (projectileY > 600 || projectileX < 100 || projectileX > 900) {
            isFiring = false;
            lastLanding = projectileX > 900 || projectileX < 100 ? "L" : "S"; // Long or Short
            characters[turn].throwLog[characters[turn].throwLog.length - 1].landing = lastLanding;
            characters[turn].lastAngle = angle;
            characters[turn].lastPower = power;
            turn = (turn + 1) % characters.length;
            angle = characters[turn].lastAngle;
            power = characters[turn].lastPower;
            currentProjectile = random(projectiles);
        }
    }

    let aliveCount = characters.filter(c => c.health > 0).length;
    if (aliveCount <= 1) {
        gameOver = true;
    }

    // Display stats
    fill(0);
    textSize(16);
    textAlign(LEFT);
    text(`Bear`, 10, 20);
    text(`Health: ${characters[0].health.toFixed(0)}`, 10, 40);
    if (turn === 0) {
        text(`Projectile: ${currentProjectile ? currentProjectile.name : "None"}`, 10, 60);
        text(`Angle: ${angle.toFixed(0)}°`, 10, 80);
        text(`Power: ${power.toFixed(0)}`, 10, 100);
    }
    text("Throw Log:", 10, 140);
    for (let i = 0; i < characters[0].throwLog.length; i++) {
        text(`${characters[0].throwLog[i].projectile}: Angle ${characters[0].throwLog[i].angle}°, Power ${characters[0].throwLog[i].power}, ${characters[0].throwLog[i].landing || "-"}`, 10, 160 + i * 20);
    }

    textAlign(RIGHT);
    text(`Squirrel`, 990, 20);
    text(`Health: ${characters[1].health.toFixed(0)}`, 990, 40);
    if (turn === 1) {
        text(`Projectile: ${currentProjectile ? currentProjectile.name : "None"}`, 990, 60);
        text(`Angle: ${angle.toFixed(0)}°`, 990, 80);
        text(`Power: ${power.toFixed(0)}`, 990, 100);
    }
    text("Throw Log:", 990, 140);
    for (let i = 0; i < characters[1].throwLog.length; i++) {
        text(`${characters[1].throwLog[i].projectile}: Angle ${characters[1].throwLog[i].angle}°, Power ${characters[1].throwLog[i].power}, ${characters[1].throwLog[i].landing || "-"}`, 990, 160 + i * 20);
    }

    if (gameOver) {
        fill(0, 150);
        rect(0, 0, 1000, 600);
        fill(255);
        textSize(32);
        textAlign(CENTER);
        let winner = characters.find(c => c.health > 0);
        text(winner ? `${winner.name} Wins!` : "Draw!", 500, 300);
        text("Press R to Restart", 500, 350);
    }
}

function keyPressed() {
    if (!isFiring && !gameOver) {
        if (keyCode === LEFT_ARROW) {
            angle = constrain(angle + 5, characters[turn].x < 500 ? 0 : 90, characters[turn].x < 500 ? 90 : 180);
        } else if (keyCode === RIGHT_ARROW) {
            angle = constrain(angle - 5, characters[turn].x < 500 ? 0 : 90, characters[turn].x < 500 ? 90 : 180);
        } else if (keyCode === UP_ARROW) {
            power = constrain(power + 5, 10, 100);
        } else if (keyCode === DOWN_ARROW) {
            power = constrain(power - 5, 10, 100);
        } else if (keyCode === 32) { // Space bar
            characters[turn].throwLog.push({ projectile: currentProjectile.name, angle: angle.toFixed(0), power: power.toFixed(0), landing: null });
            projectileX = characters[turn].x;
            projectileY = characters[turn].y;
            let radians = angle * PI / 180;
            let speed = power * characters[turn].strength * (currentProjectile.name === "watermelon" && characters[turn].name === "squirrel" ? 0.5 : 1);
            velocityX = cos(radians) * speed;
            velocityY = -sin(radians) * speed;
            isFiring = true;
        }
    }
    if (key === "r" && gameOver) {
        characters.forEach(c => {
            c.health = c.name === "bear" ? 100 : 100;
            c.hitTimer = 0;
            c.hitScale = 1;
            c.lastAngle = c.name === "bear" ? 45 : 135;
            c.lastPower = 50;
            c.throwLog = [];
        });
        gameOver = false;
        turn = 0;
        isFiring = false;
        currentProjectile = random(projectiles);
        angle = characters[turn].lastAngle;
        power = characters[turn].lastPower;
    }
}