// -------------------Initial Setup------------------ //

console.log("Game");

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
//const pane = new Tweakpane.Pane();

const scoreEl = document.querySelector('#scoreEl');

setup();

function setup() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}


// ------------------Variables--------------------- //

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const default_colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66'];

// -------------Helper Functions------------------ //

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

// ------------Program--------------------------- //
const xCenter = canvas.width / 2;
const yCenter = canvas.height / 2;
const tweakable = {
    enemyVelocityMulti: 50,
    particleVelocityMulti: 50
}

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.strokeStyle = 'blue';
        c.stroke();
    }
    update() {
        this.draw();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.aplha = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.aplha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }
    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.aplha -= 0.01;
    }
}

const player = new Player(xCenter, yCenter, 20, "white");
const projectiles = [];
const enemies = [];
const particles = [];

function addProjectile(event) {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const speed = 5;
    const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    }
    projectiles.push(new Projectile(xCenter, yCenter, 5, "red", velocity));
}

function spawnEnemy() {
    setInterval(() => {
        //7-50
        const radius = Math.random() * (100 - 10) + 10;
        let x;
        let y;
        if(Math.random() < .5) {
            x = Math.random() < .5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = "rgba(" + randomIntFromRange(0, 255) + ", " + randomIntFromRange(0, 255) + ", " + randomIntFromRange(0, 255) + ", 1.0)";
        const angle = Math.atan2(canvas.height / 2 - y ,canvas.width / 2 - x);
        const velocity = {
            x: Math.cos(angle) * (((-3 * radius) + 150) / tweakable.enemyVelocityMulti),
            y: Math.sin(angle) * (((-3 * radius) + 150) / tweakable.enemyVelocityMulti)
        }
        if(radius)
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

function spawnParticles(projectile, enemy) {
    for (let i = 0; i < enemy.radius * 2; i++) {
        const velocity = {
            x: Math.random() - 0.5 * (Math.random() * 8),
            y: Math.random() - 0.5 * (Math.random() * 8)
        }
        const radius = Math.random() * 2;
        particles.push(new Particle(projectile.x, projectile.y, radius, enemy.color, velocity));
    }
}

function setupTweakpane() {
    // pane.addInput(tweakable, 'enemyVelocityMulti');
    // pane.addInput(tweakable, 'particleVelocityMulti');
}

let score = 0;
function updateScore(amt) {
    score += amt;
    scoreEl.innerHTML = score;
}

function adjustVelocity(enemy) {
    const angle = Math.atan2(canvas.height / 2 - y ,canvas.width / 2 - x);
    enemy.velocity.x = Math.cos(angle) * (((-3 * enemy.radius) + 150) / tweakable.enemyVelocityMulti),
    enemy.velocity.y = Math.sin(angle) * (((-3 * enemy.radius) + 150) / tweakable.enemyVelocityMulti)
}

// ----------------Main Methods-------------------- //

function init() {
    //main
    spawnEnemy();
    //setupTweakpane();
}

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    //c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "rgba(0, 0, 0, 0.3)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle, index) => {
        if(particle.aplha <= 0) {
            particles.splice(index, 1);
        }else {
            particle.update();
        }
    })
    projectiles.forEach((projectile, index) => {
            projectile.update();
            if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
                //remove offscreen projectiles
                setTimeout(() => {
                    projectiles.splice(index, 1);
                }, 0)
            }
        });
        enemies.forEach((enemy, eIndex) => {
            enemy.update();
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (dist - enemy.radius - player.radius < 1) {
                //end Game
                cancelAnimationFrame(animationId);
            }
            projectiles.forEach((projectile, pIndex) => {
                const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
                if (dist - enemy.radius - projectile.radius < 1) {
                    spawnParticles(projectile, enemy);
                    if(enemy.radius - 10 > 10) {
                        updateScore(100);
                        gsap.to(enemy, { radius: enemy.radius - 10});
                        setTimeout(() => {
                            projectiles.splice(pIndex, 1);
                        }, 0);
                    }else {
                        updateScore(1000);
                        setTimeout(() => {
                            enemies.splice(eIndex, 1);
                            projectiles.splice(pIndex, 1);
                        }, 0);
                    }
                    adjustVelocity(enemy);
                }
            })
        });
        player.update();
}
// ------------------Event Listeners----------------- //

addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
})

addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init();
})

addEventListener('click', (event) => {
    console.log(projectiles.length);
    addProjectile(event);
})

// ----------Starting Method-------------------- //
start();
function start() {
    init();
    animate();
}







