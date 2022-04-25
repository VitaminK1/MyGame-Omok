/*references
check33 - https://medium.com/@cldhfleks2/java-%EC%98%A4%EB%AA%A9-%EA%B8%88%EC%88%98-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-b88d349a0553
checkGameEnd - https://github.com/wangguibao/gomokuJS/blob/master/gomokuJS.js
drawBoard = https://github.com/5HARK/domoku/blob/master/9_domoku.html
*/


const main = () => {
    let rows = [];
    let currentTurn = null;
    let playTime = 0;
    let startTimer;
    let history = [];
    const initForm = () => {
        // get data from initForm
        const formDom = document.getElementById('map-initializer-form');
        formDom.addEventListener('submit' , function (e) {
            e.preventDefault();
            const width = formDom.querySelector('[name="width"]').value;
            const height = formDom.querySelector('[name="height"]').value;
            const first = formDom.querySelector('[name="first"]:checked').value;

            //ready for game
            rows = createMap(width, height);
            resetTimer(first);
            drawBoard(width,height);
            startGame(first);

            //restart button enabled
            document.getElementById('restart').addEventListener("click", function() {
                rows = createMap(width, height);
                resetTimer(first);
                startGame(first);
            })
        })
    }
    const createMap = (width, height) => {
        const _cells = []

        //init mapDom
        const mapDom = document.getElementById('map');
        mapDom.innerHTML = '';

        //make marker
        const marker = document.createElement('div')
        marker.id = 'marker';
        mapDom.appendChild(marker);

        //make every cells and add blank img
        for (let i = 0; i <height; i++) {
            const row = [];
            const rowDom = document.createElement('div');
            rowDom.className = 'row';
            for (let j = 0; j <width; j++) {
                const cellDom = document.createElement('div');
                cellDom.className = 'cell';
                rowDom.appendChild(cellDom);
                const cell = {
                    x: j,
                    y: i,
                    dom: cellDom,
                    stone: null,
                }
                const img = document.createElement('img');
                img.src = 'assets/blank.png'
                img.width = 50;
                img.height = 50;
                cellDom.appendChild(img);
                mapDom.appendChild(rowDom);
                row.push(cell);

            }
            _cells.push(row);
        }
        return _cells;
    }
    //make every setting when game start
    const startGame = (turn) => {

        let round = 1;
        currentTurn = turn;
        history = [];

        rows.forEach(row => {
            row.forEach(cell => {
                let cellHover;
                let cellHoverOut;
                let cellClick;
                //add hover effects
                cell.dom.addEventListener('mouseover', cellHover = () => {
                    cell.dom.style.boxShadow = 'inset 0 0 0 1000px rgba(0,0,0,.2)';
                })
                cell.dom.addEventListener('mouseout', cellHoverOut = () => {
                    cell.dom.style.boxShadow = null;
                })

                //add click events
                cell.dom.addEventListener('click', cellClick = () => {
                    if (cell.stone === null){
                        if (check33(cell,currentTurn)) {
                            changeGameMsg("Can't place stone there. - Open33");
                            setTimeout(function () {
                                changeGameMsg('Turn '+round + ' - ' + currentTurn);
                            }, 1000);
                        }
                        else {

                            //start timer
                            if (!startTimer) {
                                document.getElementById('time-elapsed').innerHTML = timerForm(0);
                                startTimer = noDelaySetInterval( () => {
                                    playTime++;
                                    document.getElementById('time-elapsed').innerHTML = timerForm(playTime);
                                }, 1000);
                            }

                            //last stone marking
                            const mark = document.getElementById('marker')
                            mark.innerHTML = '●';
                            mark.style.display = 'block';
                            mark.style.top = (24+50*cell.y)+'px';
                            mark.style.left = (22+50*cell.x)+'px';
                            mark.style.color = (currentTurn === "Black") ? "white" : "black";

                            //turn
                            round++;
                            cell.stone = currentTurn;

                            //history
                            const oneMove = {
                                x: cell.x,
                                y: cell.y,
                                stone: currentTurn
                            };
                            history.push(oneMove)

                            //image & dom
                            if (currentTurn === 'Black') {
                                removeAllChild(cell.dom);
                                const img = document.createElement('img');
                                img.src = 'assets/black.png'
                                img.width = 50;
                                img.height = 50;
                                cell.dom.appendChild(img);
                                cell.stone = 'Black';
                                currentTurn = 'White';
                                changeGameMsg('Turn '+round + ' - ' + currentTurn);
                            } else {
                                removeAllChild(cell.dom);
                                const img = document.createElement('img');
                                img.src = 'assets/white.png'
                                img.width = 50;
                                img.height = 50;
                                cell.dom.appendChild(img);
                                cell.stone = 'White';
                                currentTurn = 'Black';
                                changeGameMsg('Turn '+ round + ' - ' + currentTurn);
                            }

                            //remove hover effect
                            cell.dom.style.boxShadow = null;
                            cell.dom.removeEventListener('mouseover',cellHover);
                            cell.dom.removeEventListener('mouseout',cellHoverOut);

                            //check game end
                            if (history.length === rows.length * rows[0].length) {
                                gameEnd();

                            } else if(checkGameEnd(cell)) {
                                cell.dom.style.boxShadow = 'inset 0 0 0 1000px rgba(0,0,150,.5)'
                                gameEnd(cell);
                                }

                        }
                    } else {

                        let pCell = history[history.length-1];
                        const checkCell = (cell) => {
                            return pCell.x === cell.x && pCell.y === cell.y
                        }

                        //remove previous stone
                        if (history && checkCell(cell)) {
                            //clear cell
                            cell.stone = null;
                            removeAllChild(cell.dom);

                            //add blank
                            const img = document.createElement('img');
                            img.src = 'assets/blank.png'
                            img.width = 50;
                            img.height = 50;
                            cell.dom.appendChild(img);

                            //add events
                            cell.dom.addEventListener('mouseover', cellHover = () => {
                                cell.dom.style.boxShadow = 'inset 0 0 0 1000px rgba(0,0,0,.2)';
                            })
                            cell.dom.addEventListener('mouseout', cellHoverOut = () => {
                                cell.dom.style.boxShadow = null;
                            })

                            // reset turn
                            currentTurn = pCell.stone;
                            round--;

                            // reset history
                            history.pop();

                            // reset msg
                            changeGameMsg('Turn '+round + ' - ' + currentTurn);

                            // reset mark
                            const mark = document.getElementById('marker')
                            if (history.length > 0) {
                                pCell = history[history.length-1];
                                mark.innerHTML = '●';
                                mark.style.display = 'block';
                                mark.style.top = (24+50*pCell.y)+'px';
                                mark.style.left = (22+50*pCell.x)+'px';
                                mark.style.color = (currentTurn === "Black") ? "black" : "white";
                            } else {
                                mark.style.display = 'none';
                            }


                        }

                    }
                })
            })
        });
    }

    //check game ended
    const checkGameEnd = (cell) => {
        const width = rows[0].length;
        const height = rows.length;

        const checkRow = () => {
            let chain = 0;
            let maxChain = 0;
            for (let i = Math.max(cell.x - 4, 0); i <= Math.min(cell.x + 4, width - 1); ++i) {
                if (rows[cell.y][i].stone !== cell.stone) {
                    maxChain = Math.max(chain, maxChain);
                    chain = 0;
                }
                else {
                    chain++;
                }
            }

            if (maxChain === 0) {
                maxChain = chain;
            }
            return maxChain > 4;
        }

        const checkCol = () => {
            let chain = 0;
            let maxChain = 0;
            for (let i = Math.max(cell.y - 4, 0); i <= Math.min(cell.y + 4, height - 1); ++i) {
                if (rows[i][cell.x].stone !== cell.stone) {
                    maxChain = Math.max(chain, maxChain);
                    chain = 0;
                }
                else {
                    chain++;
                }
            }

            if (maxChain === 0) {
                maxChain = chain;
            }
            return maxChain > 4;
        }

        const checkDiag1 = () => {
            let chain = 0;
            let maxChain = 0;
            for (let i = Math.max(cell.x - 4, 0); i <= Math.min(cell.x + 4, width - 1); ++i) {
                let j = i - (cell.x - cell.y);
                if (j < 0 || j > height-1) {
                    continue;
                }
                if (rows[j][i].stone !== cell.stone) {
                    maxChain = Math.max(chain, maxChain);
                    chain = 0;
                }
                else {
                    chain++;
                }
            }

            if (maxChain === 0) {
                maxChain = chain;
            }
            return maxChain > 4;
        }

        const checkDiag2 = () => {
            let chain = 0;
            let maxChain = 0;
            for (let i = Math.max(cell.x - 4, 0); i <= Math.min(cell.x + 4, width - 1); ++i) {
                let j = (cell.x + cell.y) - i;
                if (j < 0 || j > height-1) {
                    continue;
                }
                if (rows[j][i].stone !== cell.stone) {
                    maxChain = Math.max(chain, maxChain);
                    chain = 0;
                }
                else {
                    chain++;
                }
            }

            if (maxChain === 0) {
                maxChain = chain;
            }
            return maxChain > 4;
        }

        return checkDiag2() || checkDiag1() || checkCol() || checkRow();
    }
    const gameEnd = (cell) => {
        if (!cell) {
            changeGameMsg('Draw')
        } else {
            changeGameMsg(cell.stone + ' Won!');
        }
        rows.forEach(row => { row.forEach(c => {
            const newCellDom = c.dom.cloneNode(true);
            c.dom.parentNode.replaceChild(newCellDom, c.dom);
        })})
        clearInterval(startTimer);
    }
    const resetTimer = (first) => {
        if (playTime !== 0) {
            document.getElementById('time-elapsed').innerHTML = "Previous Game - " + timerForm(playTime);
        }
        changeGameMsg(first+' Go First.');
        playTime = 0;
        clearInterval(startTimer);
        startTimer = null;
    }
    const drawBoard = (width, height) => {
        let myCanvas = document.getElementById('backboard');
        let context = myCanvas.getContext("2d");
        let canvasMargin = 25;
        let canvasSizeX = width*50;
        let canvasSizeY = height*50;

        let panelSizeX = canvasSizeX - canvasMargin*2;
        let panelSizeY = canvasSizeY - canvasMargin*2;

        myCanvas.setAttribute('width', String(canvasSizeX));
        myCanvas.setAttribute('height',String(canvasSizeY));

        context.fillStyle = "#d9c049";
        context.fillRect(0, 0, canvasSizeX,canvasSizeY);
        context.strokeStyle = "#333333";
        for(let x=canvasMargin; x<=canvasSizeX - canvasMargin*2; x+=(panelSizeX/(width - 1))) {
            for(let y=canvasMargin; y<=canvasSizeY - canvasMargin*2; y+=(panelSizeY/(height - 1))) {
                context.strokeRect(x, y, ((panelSizeX)/(width - 1)), ((panelSizeY)/(height - 1)));
            }
        }
        context.beginPath();
        context.closePath();
        context.fillStyle = "#000000";
        context.fill();
        myCanvas.style.left = (495-25*width)+'px';
        document.getElementById('map').style.left = (495-25*width)+'px';
    }
    const check33 = (cell,currentTurn) => {
        cell.stone = currentTurn;
        if (checkGameEnd(cell)) {
            cell.stone = null;
            return false;
        }
        let mine = cell.stone;
        let yours = (mine === "Black")? "White" : "Black";
        const width = rows[0].length;
        const height = rows.length;

        const check46 = (cell) => {
            let stone1 = 0;
            let stone2 = 0;
            let allStone = 0;
            let blink1 = 1;

            //left
            let x = cell.x - 1;
            let check = false;
            while (true) {
                if (x < 0){
                    break;
                }
                let target = rows[cell.y][x].stone;
                if (target === mine) {
                    check = false;
                    stone1++;
                    }
                if (target === yours) {
                    break;
                }
                if (!target) {
                    if (check === false) {
                        check = true;
                    } else {
                        blink1++;
                        break;
                    }
                    if (blink1 === 1) {
                        blink1--;
                    } else {
                        break;
                    }
                }
                x--;
            }

            //right
            x = cell.x+1;
            let blink2 = blink1;
            if (blink1 === 1){
                blink1 = 0;
            }
            check = false;
            while (true) {
                if (x > width-1){
                    break;
                }
                let target = rows[cell.y][x].stone;
                if (target === mine){
                    check = false;
                    stone2++;
                }
                if (target === yours){
                    break;
                }
                if (!target){
                    if (check === false) {
                        check = true;
                    } else {
                        blink2++;
                        break;
                    }
                    if (blink2 === 1){
                        blink2--;
                    } else {
                        break;
                    }
                }
                x++;
            }

            //checkLR
            allStone = stone1 + stone2;
            if (allStone !== 2){
                return false;
            }

            let left = stone1 + blink1;
            let right = stone2 + blink2;

            if (cell.x - left === 0 || cell.x + right === width-1){
                return false;
            } else {
                return !(rows[cell.y][cell.x - left - 1].stone === yours || rows[cell.y][cell.x + right + 1].stone === yours);
            }
        }

        const check28 = (cell) => {
            let stone1 = 0;
            let stone2 = 0;
            let allStone = 0;
            let blink1 = 1;

            //up
            let y = cell.y-1;
            let check = false;
            while (true){
                if (y < 0) {
                    break;
                }
                let target = rows[y][cell.x].stone;
                if (target === mine) {
                    check = false;
                    stone1++;
                }
                if (target === yours){
                    break;
                }
                if (!target) {
                    if (check === false) {
                        check = true;
                    } else {
                        blink1++;
                        break;
                    }
                    if (blink1 === 1){
                        blink1--;
                    } else {
                        break;
                    }
                }
                y--;
            }

            //down
            let blink2 = blink1;
            if (blink1 === 1){
                blink1 = 0;
            }
            y = cell.y + 1;
            check = false;
            while (true) {
                if (y > height-1) {
                    break;
                }
                let target = rows[y][cell.x].stone;
                if (target === mine){
                    check = false;
                    stone2++;
                }
                if (target === yours){
                    break;
                }
                if (!target){
                    if (check === false){
                        check = true;
                    } else {
                        blink2++;
                        break;
                    }
                    if (blink2 === 1){
                        blink2--;
                    } else {
                        break;
                    }
                }
                y++;
            }

            allStone = stone1 + stone2;
            if (allStone !== 2) {
                return false;
            }
            let up = stone1 + blink1;
            let down = stone2 + blink2;
            if (cell.y-up === 0 || cell.y+down === height-1) {
                return false;
            } else {
                return !(rows[cell.y - up - 1][cell.x].stone === yours || rows[cell.y + down + 1][cell.x].stone === yours);}
            }

        const check37 = (cell) => {
            let stone1 = 0;
            let stone2 = 0;
            let allStone = 0;
            let blink1 = 1;

            let x = cell.x-1;
            let y = cell.y-1;
            let check = false;
            while (true) {
                if (x < 0 || y < 0) {
                    break;
                }
                let target = rows[y][x].stone;
                if (target === mine) {
                    check = false;
                    stone1++;
                }
                if (target === yours) {
                    break;
                }
                if (!target) {
                    if (check === false) {
                        check = true;
                    } else {
                        blink1++;
                        break;
                    }
                    if (blink1 === 1){
                        blink1--;
                    } else {
                        break;
                    }
                }
                x--;
                y--;
            }

            let blink2 = blink1;
            if (blink1 === 1) {
                blink1 = 0;
            }
            x = cell.x+1;
            y = cell.y+1;
            check = false;
            while (true){
                if (x > width-1 || y > width-1){
                    break;
                }
                let target = rows[y][x].stone;
                if (target === mine) {
                    check = false;
                    stone2++;
                }
                if (target === yours) {
                    break;
                }
                if (!target) {
                    if (check === false){
                        check =  true;
                    } else {
                        blink2++;
                        break;
                    }

                    if (blink2 === 1){
                        blink2--;
                    } else {
                        break;
                    }
                }
                x++;
                y++;
            }
            allStone = stone1 + stone2;
            if (allStone !== 2){
                return false;
            }
            let leftUp = stone1 + blink1;
            let rightDown = stone2 + blink2;

            if (cell.y - leftUp === 0 || cell.x - leftUp === 0 ||
            cell.y + rightDown === height-1 || cell.x+rightDown === width-1){
                return false;
            } else {
                return !(rows[cell.y - leftUp - 1][cell.x - leftUp - 1].stone === yours || rows[cell.y + rightDown + 1][cell.x + rightDown + 1].stone === yours);
            }
        }

        const check19 = (cell) => {
            let stone1 = 0;
            let stone2 = 0;
            let allStone = 0;
            let blink1 = 1;

            let x = cell.x-1;
            let y = cell.y+1;
            let check = false;
            while (true) {
                if (x < 0 || y > height-1) {
                    break;
                }
                let target = rows[y][x].stone;
                if (target === mine) {
                    check = false;
                    stone1++;
                }
                if (target === yours) {
                    break;
                }
                if (!target) {
                    if (check === false){
                        check = true;
                    } else {
                        blink1++;
                        break;
                    }
                    if (blink1 === 1){
                        blink1--;
                    } else {
                        break;
                    }
                }
                x--;
                y++;
            }

            let blink2 = blink1;
            if (blink1 === 1){
                blink1 = 0;
            }
            x = cell.x+1;
            y = cell.y-1;
            check = false;
            while (true) {
                if (x > width-1 || y < 0) {
                    break;
                }
                let target = rows[y][x].stone;
                if (target === mine) {
                    check = false;
                    stone2++;
                }
                if (target === yours) {
                    break;
                }
                if (!target) {
                    if (check === false) {
                        check = true;
                    } else {
                        blink2++;
                        break;
                    }
                    if (blink2 === 1){
                        blink2--;
                    } else {
                        break;
                    }
                }
                x++;
                y--;
            }

            allStone = stone1 + stone2;
            if (allStone !== 2) {
                return false;
            }
            let leftDown = stone1 + blink1;
            let rightUp = stone2 + blink2;
            if (cell.x-leftDown === 0 ||
            cell.y-rightUp === 0 ||
            cell.y+leftDown === height-1 ||
            cell.x+rightUp === width-1){
                return false;
            } else {
                return !(rows[cell.y + leftDown + 1][cell.x - leftDown - 1] === yours ||
                    rows[cell.y - rightUp - 1][cell.x + rightUp + 1] === yours);
            }
        }

        let answer = (check46(cell)+check28(cell)+check37(cell)+check19(cell)) >= 2;
        cell.stone = null;
        return answer;
    }

    const removeAllChild = (dom) => {
        while (dom.hasChildNodes()) {
            dom.removeChild(dom.firstChild);
        }
    }
    const timerForm = (time) => {
        let hour = Math.floor(time/3600);
        let min = Math.floor(time/60);
        let sec = (time%60);
        return ("0"+hour).slice(-2)+ " : "+("0"+min).slice(-2)+' : '+("0"+sec).slice(-2);
    }
    const changeGameMsg = (str) => {
        const gameMsg = document.getElementById('game-msg').innerHTML = str;
    }
    const noDelaySetInterval = (func, interval) => {
        func();
        return setInterval(func, interval);
    }

    initForm();
}

main();
