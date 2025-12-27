// adds pixels
const pixelContainer = document.querySelector(".pixel-container");
for (i = 0; i < 100; i++) {
  const pixel = document.createElement("div");
  pixel.className = "pixel";
  pixel.id = i.toString();
  pixelContainer.appendChild(pixel);
}

// add keydown logic
document.addEventListener('keydown', function(event) {
    handleInput(event.key)
});

// wasd logic
wasd = document.querySelectorAll(".wasd button")
wasd.forEach(element => {
   element.addEventListener('click', ()=> {
        handleInput(element.innerText.toLowerCase())
    }) 
});

// global funcs
function sleep(time) { // How do promises work?
  return new Promise((resolve) => setTimeout(resolve, time));
}

function handleInput(keydown) {
    if ((keydown == "w" || keydown =="ArrowUp") && prevDirection != "s"){
        direction = "w"
    }
    else if ((keydown == "a" || keydown =="ArrowLeft") && prevDirection != "d"){
        direction = "a"
    }
    else if ((keydown == "s" || keydown =="ArrowDown") && prevDirection != "w"){
        direction = "s"
    }
    else if ((keydown == "d" || keydown =="ArrowRight") && prevDirection != "a"){
        direction = "d"
    }
}

// Game
// global vars 
let direction = "";
let prevDirection = "";

function gridToIdx(x, y, width) {
  return x + y * width;
}

class Display { // 0 for blank  1 for snake  2 for apple
    constructor(width, height) {
        this.width = width
        this.height = height
        this.pixels = new Array(width * height).fill(0);
    }

    clearDisplay() {
        for(let i=0;i<this.width*this.height;i++) {
            this.pixels[i] = 0
        }
    }
    
    displaySnake(segments) {
        for (i=0;i<segments.length;i++) {
            const [x, y] = segments[i]
            this.pixels[gridToIdx(x, y, this.width)] = 1
        }
    }

    displayApple(appleIdx) {
        this.pixels[appleIdx] = 2
    }

    printDisplay() {
        for (let i=0;i<(this.width*this.height);i++) {
            const curPixel = document.getElementById(i.toString())
            if (this.pixels[i] == 1) {
                curPixel.className = "pixel snake"
            }
            else if (this.pixels[i] == 2) {
                curPixel.className = "pixel apple"
            }
            else {
                curPixel.className = "pixel"
            }
        }
    }
}

class Snake {
    constructor() {
        this.segments = [[2, 5]]
        this.length = 1;
    }

    handleMovement() {
        if (direction == "w"){
            this.segments[0][1] -= 1
        }
        else if (direction == "s"){
            this.segments[0][1] += 1
        }
        else if (direction == "a"){
            this.segments[0][0] -= 1
        }
        else if (direction == "d"){
            this.segments[0][0] += 1
        }
    }

    updateSegments() {
        if (this.segments.length<this.length) {
            this.segments.push([-1, -1])
        }
        for (let i=this.segments.length-1;i>0;i--) {
            this.segments[i] = [this.segments[i-1][0], this.segments[i-1][1]] // avoids them pointing become same reference
        }
    }
}

class Game {
    constructor(width, height) {
        this.height = height
        this.width = width
        this.display = new Display(width, height)
        this.snake = new Snake()
        this.appleIdx = 55
        this.running = true
    }

    placeApple() {
        let validIdx = []
        for (let i=0;i<this.display.pixels.length-1;i++) {
            if (this.display.pixels[i] == 0) {
                validIdx.push(i)
            }
        }
        this.appleIdx = validIdx[Math.floor(Math.random()*validIdx.length)]
    }

    handleEating() {
        const [x, y] = this.snake.segments[0] // this is the head
        if (gridToIdx(x, y, this.width)==this.appleIdx) {
            this.placeApple()
            this.snake.length+=1
        }
    }

    handleGameOver() {
        const [x, y] = this.snake.segments[0]
        if ((0>x || x>this.width-1) || 0>y || y>this.height-1) {
            this.running = false
        }
        for (let i=1;i<this.snake.segments.length;i++) {
            if (x == this.snake.segments[i][0] && y == this.snake.segments[i][1]) {
                this.running = false
            }
        }
    }

    handleSnake() {
        this.snake.updateSegments()
        this.snake.handleMovement()
        this.handleGameOver()
        this.handleEating()
    }

    handleDisplay() {
        this.display.clearDisplay()
        this.display.displaySnake(this.snake.segments)
        this.display.displayApple(this.appleIdx)
        this.display.printDisplay()
    }

    afterGameOver() {
        let gameOverContainer = document.getElementsByClassName("gameover")[0]
        pixelContainer.classList.add("d-none")
        gameOverContainer.classList.remove("d-none")

    }
    async run() {
        let score = document.getElementById("score")
        while (this.running) {
            prevDirection = direction
            this.handleSnake()
            this.handleDisplay()
            score.textContent = "Score: " + this.snake.length.toString()
            await sleep(500)
        }  
        this.afterGameOver()
    }
}

let g = new Game(10, 10)
g.run()