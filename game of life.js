/**** p5.js *****
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/p5.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/addons/p5.sound.js"></script>
<style>* {padding: 0; margin: 0}</style>
******************/

let body = document.querySelector('body');
if(body) body.innerHTML = "";

// ========== start ========== //
const s = (p) => {
    
let grad;
let isLoopping = false;
const BTN_SIZE = [60, 40], BTN_POS = [580, 70];
let fps = 10;
let fps_slider;
const FPS_SLIDER_SIZE = [120, 10], FPS_SLIDER_POS = [100, 80], FPS_SLIDER_TEXT_SIZE = 25;
const RUNNING_TEXT_SIZE = 25, RUNNING_TEXT_POS = [400, 100];

p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    grad = createGrad({
        xOff: 80,
        yOff: 120,
        rows: 50,
        cols: 75,
        cell_size: 10,
    });
    let start_btn = p.createButton("Start");
    start_btn.size(...BTN_SIZE);
    start_btn.position(...BTN_POS);
    start_btn.mouseClicked(()=>{
        isLoopping = true;
    });
    let stop_btn = p.createButton("Stop");
    stop_btn.size(...BTN_SIZE);
    stop_btn.position(BTN_POS[0] + BTN_SIZE[0] + 10, BTN_POS[1]);
    stop_btn.mouseClicked(()=>{
        isLoopping = false;
    });
    let reset_btn = p.createButton("Reset");
    reset_btn.size(...BTN_SIZE);
    reset_btn.position(BTN_POS[0] + (BTN_SIZE[0] + 10) * 2, BTN_POS[1]);
    reset_btn.mouseClicked(()=>{
        isLoopping = false;
        grad.reset();
    });
    let rand_btn = p.createButton("Random");
    rand_btn.size(...BTN_SIZE);
    rand_btn.position(BTN_POS[0] + (BTN_SIZE[0] + 10) * 3, BTN_POS[1]);
    rand_btn.mouseClicked(()=>{
        isLoopping = false;
        grad.rand(0.3);
    });
    fps_slider = p.createSlider(1, 59, 10);
    fps_slider.size(...FPS_SLIDER_SIZE);
    fps_slider.position(FPS_SLIDER_POS[0] + FPS_SLIDER_TEXT_SIZE * 4, FPS_SLIDER_POS[1]);
}

p.draw = function () {
    p.frameRate(fps_slider.value());
    p.background(255);
    p.textSize(FPS_SLIDER_TEXT_SIZE);
    p.text("fps: " + fps_slider.value(), FPS_SLIDER_POS[0], FPS_SLIDER_POS[1] + FPS_SLIDER_TEXT_SIZE / 2);
    p.textSize(RUNNING_TEXT_SIZE);
    p.text(isLoopping? "Running" : "Stoped", ...RUNNING_TEXT_POS);
    if(isLoopping) {
        grad.update();
    }
    p.push();
    grad.draw();
    p.pop();
}

p.mouseClicked = function () {
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
    o.states = new Array(rows * cols).fill(DEAD);

    const cellCount = (states) => {
        cnt = new Array(states.length).fill(0);
        for(let i = 1; i < rows + 1; i++) {
            for(let j = 1; j < cols + 1; j++) {
                cnt[cols * i + j] = (states[cols * (i-1) + (j-1)] == ALIVE) + 
                                    (states[cols * (i-1) + (j  )] == ALIVE) + 
                                    (states[cols * (i-1) + (j+1)] == ALIVE) + 
                                    (states[cols * (i  ) + (j-1)] == ALIVE) + 
                                    (states[cols * (i  ) + (j+1)] == ALIVE) + 
                                    (states[cols * (i+1) + (j-1)] == ALIVE) + 
                                    (states[cols * (i+1) + (j  )] == ALIVE) + 
                                    (states[cols * (i+1) + (j+1)] == ALIVE);
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
        let _states = [...o.states];
        cnt = cellCount(o.states);
        for(let i = 1; i < rows + 1; i++) {
            for(let j = 1; j < cols + 1; j++) {
                pos = cols * i + j;
                o.states[pos] = rule(_states[pos], cnt[pos]);
            }
        }
    }

    const draw_cell = (pos, state, size = CELL_SIZE) => {
        let y = pos[0] * size + yOff, x = pos[1] * size + xOff;
        p.noStroke();
        if(state == ALIVE) {
            p.fill(0);
        } else {
            p.fill(240);
        }
        p.beginShape();
        p.vertex(x, y);
        p.vertex(x+size, y);
        p.vertex(x+size, y+size);
        p.vertex(x, y+size);
        p.endShape(p.CLOSE);
    }
    
    o.draw = () => {
        for(let i = 1; i < rows + 1; i++) {
            for(let j = 1; j < cols + 1; j++) {
                draw_cell([i - 1, j - 1], o.states[cols * i + j]);
            }
        }
    }

    o.mouseClicked = () => {
        let x = p.mouseX - xOff, y = p.mouseY - yOff;
        let i = Math.floor(y / CELL_SIZE) + 1, j = Math.floor(x / CELL_SIZE) + 1;
        let pos = cols * i + j;
        if(i > 0 && i < rows + 1 && j > 0 && j < cols + 1) {
            if(o.states[pos] == ALIVE) {
                o.states[pos] = DEAD;
            } else {
                o.states[pos] = ALIVE;
            }
        }
    }

    o.reset = () => {
        o.states.fill(DEAD);
    }

    o.rand = (ratio) => {
        o.reset();
        for(let i = 1; i < rows + 1; i++) {
            for(let j = 1; j < cols + 1; j++) {
                o.states[cols * i + j] = p.random() < ratio? ALIVE: DEAD;   
            }
        }
    }
    
    return o;
}

} // end  const s = (p) => {

// ========== end ========== //
new p5(s);