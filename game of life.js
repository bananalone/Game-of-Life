let root = document.querySelector('body');
if (root) root.innerHTML = "";

// ========== start ========== //

let grad;
let isLoopping = false;
const BTN_SIZE = [60, 40], BTN_POS = [580, 70];
let fps = 10;
let fps_slider;
const FPS_SLIDER_SIZE = [120, 10], FPS_SLIDER_POS = [100, 80], FPS_SLIDER_TEXT_SIZE = 25;
const RUNNING_TEXT_SIZE = 25, RUNNING_TEXT_POS = [400, 100];

function setup() {
    createCanvas(windowWidth, windowHeight);
    grad = createGrad({
        xOff: 80,
        yOff: 120,
        rows: 50,
        cols: 75,
        cell_size: 10,
    });
    let start_btn = createButton("Start");
    start_btn.size(...BTN_SIZE);
    start_btn.position(...BTN_POS);
    start_btn.mouseClicked(()=>{
        isLoopping = true;
    });
    let stop_btn = createButton("Stop");
    stop_btn.size(...BTN_SIZE);
    stop_btn.position(BTN_POS[0] + BTN_SIZE[0] + 10, BTN_POS[1]);
    stop_btn.mouseClicked(()=>{
        isLoopping = false;
    });
    let reset_btn = createButton("Reset");
    reset_btn.size(...BTN_SIZE);
    reset_btn.position(BTN_POS[0] + (BTN_SIZE[0] + 10) * 2, BTN_POS[1]);
    reset_btn.mouseClicked(()=>{
        isLoopping = false;
        grad.reset();
    });
    let rand_btn = createButton("Random");
    rand_btn.size(...BTN_SIZE);
    rand_btn.position(BTN_POS[0] + (BTN_SIZE[0] + 10) * 3, BTN_POS[1]);
    rand_btn.mouseClicked(()=>{
        isLoopping = false;
        grad.rand(0.3);
    });
    fps_slider = createSlider(1, 59, 10);
    fps_slider.size(...FPS_SLIDER_SIZE);
    fps_slider.position(FPS_SLIDER_POS[0] + FPS_SLIDER_TEXT_SIZE * 4, FPS_SLIDER_POS[1]);
}

function draw() {
    frameRate(fps_slider.value());
    background(255);
    textSize(FPS_SLIDER_TEXT_SIZE);
    text("fps: " + fps_slider.value(), FPS_SLIDER_POS[0], FPS_SLIDER_POS[1] + FPS_SLIDER_TEXT_SIZE / 2);
    textSize(RUNNING_TEXT_SIZE);
    text(isLoopping? "Running" : "Stoped", ...RUNNING_TEXT_POS);
    if(isLoopping) {
        grad.update();
    }
    push();
    grad.draw();
    pop();
}

function mouseClicked() {
    grad.mouseClicked();
}

function createGrad(params) {
    const rows = params.rows + 2; // 上下边界
    const cols = params.cols + 2; // 左右边界

    const ALIVE = 1, DEAD = 0;
    const CELL_SIZE = params.cell_size;

    let xOff = params.xOff, yOff = params.yOff;
    
    let o = {};
    o.alive = ALIVE, o.dead = DEAD;
    o.data = new Array(rows * cols).fill(DEAD);

    const cellCount = (data) => {
        cnt = new Array(data.length).fill(0);
        for(let i = 1; i < rows + 1; i++) {
            for(let j = 1; j < cols + 1; j++) {
                cnt[cols * i + j] = (data[cols * (i-1) + (j-1)] == ALIVE) + 
                                    (data[cols * (i-1) + (j  )] == ALIVE) + 
                                    (data[cols * (i-1) + (j+1)] == ALIVE) + 
                                    (data[cols * (i  ) + (j-1)] == ALIVE) + 
                                    (data[cols * (i  ) + (j+1)] == ALIVE) + 
                                    (data[cols * (i+1) + (j-1)] == ALIVE) + 
                                    (data[cols * (i+1) + (j  )] == ALIVE) + 
                                    (data[cols * (i+1) + (j+1)] == ALIVE);
            }
        }
        return cnt;
    }

    const rule = (cell_state, neighbour_cnt) => {
        if(cell_state == ALIVE) {
            if(neighbour_cnt < 2 || neighbour_cnt >= 4) {
                return DEAD;
            }
            return ALIVE;
        } else if(cell_state == DEAD) {
            if(neighbour_cnt == 3) {
                return ALIVE;
            }
            return DEAD;
        }
        return null;
    }
    
    o.update = () => {
        let _data = [...o.data];
        cnt = cellCount(o.data);
        for(let i = 1; i < rows + 1; i++) {
            for(let j = 1; j < cols + 1; j++) {
                pos = cols * i + j;
                o.data[pos] = rule(_data[pos], cnt[pos]);
            }
        }
    }

    const draw_cell = (pos, state, size = CELL_SIZE) => {
        let y = pos[0] * size + yOff, x = pos[1] * size + xOff;
        noStroke();
        if(state == ALIVE) {
            fill(0);
        } else {
            fill(240);
        }
        beginShape();
        vertex(x, y);
        vertex(x+size, y);
        vertex(x+size, y+size);
        vertex(x, y+size);
        endShape(CLOSE);
    }
    
    o.draw = () => {
        for(let i = 1; i < rows + 1; i++) {
            for(let j = 1; j < cols + 1; j++) {
                draw_cell([i - 1, j - 1], o.data[cols * i + j]);
            }
        }
    }

    o.mouseClicked = () => {
        let x = mouseX - xOff, y = mouseY - yOff;
        let i = Math.floor(y / CELL_SIZE) + 1, j = Math.floor(x / CELL_SIZE) + 1;
        let pos = cols * i + j;
        if(i > 0 && i < rows + 1 && j > 0 && j < cols + 1) {
            if(o.data[pos] == ALIVE) {
                o.data[pos] = DEAD;
            } else {
                o.data[pos] = ALIVE;
            }
        }
    }

    o.reset = () => {
        o.data.fill(DEAD);
    }

    o.rand = (ratio) => {
        o.reset();
        for(let i = 1; i < rows + 1; i++) {
            for(let j = 1; j < cols + 1; j++) {
                o.data[cols * i + j] = random() < ratio? ALIVE: DEAD;   
            }
        }
    }
    
    return o;
}


// ========== end ========== //

new p5();