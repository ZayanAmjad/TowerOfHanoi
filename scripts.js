
class TowerOfHanoi {
    constructor(){
        this.diskCount = 5;
        this.moves = 0;
        this.towers = [[],[],[]];
        this.won = false;
        this.start = false;
        this.timeStart = null;
        this.timerInterval = null;

        this.initGame();
        this.setupEventListeners();
    }

    initGame(){
        this.createDisks();
        this.updateMinMoves();
        this.DragNDrop();
    }

    createDisks(){
        // Clear all towers first
        $('.disk-stack').empty();
        this.towers = [[],[],[]];
        
        // Create disks on tower 1
        for(let i = this.diskCount; i >= 1; i--){
            let disk = $(`<div class="disk disk${i}" data-index="${i}"></div>`);
            $("#tower1 .disk-stack").append(disk);
            this.towers[0].push(i);
        }
    }

    updateMinMoves(){
        const minMoves = Math.pow(2, this.diskCount) - 1;
        $("#minMoves").text(minMoves);
    }


    DragNDrop(){
        let gameInstance = this;

        $(".disk").draggable({
            zIndex: 1000,
            containment: ".gameArea",
            revert: function(droppableTarget) {
                if (!droppableTarget) return true;

                const $disk = $(this);
                const $sourceTower = $disk.closest(".tower");
                const sourceTowerIndex = parseInt($sourceTower.data('tower'));
                const $targetTower = $(droppableTarget);
                const targetTowerIndex = parseInt($targetTower.data('tower'));

                if (sourceTowerIndex === targetTowerIndex) return true;

                const diskIndex = parseInt($disk.data('index'));
                const targetTower = gameInstance.towers[targetTowerIndex];

                if (targetTower.length === 0) return false;

                const topDiskIndex = targetTower[targetTower.length - 1];
                if (diskIndex < topDiskIndex) {
                    return false;
                } else {
                    return true;
                }
            },
            start: function(event, ui) {
                const $disk = $(event.target);
                const $tower = $disk.closest(".tower");
                const towerIndex = parseInt($tower.data('tower'));
                const topDisk = gameInstance.towers[towerIndex][gameInstance.towers[towerIndex].length - 1];

                if (parseInt($disk.data('index')) !== topDisk) return false;

                if (!gameInstance.start) {
                    gameInstance.start = true;
                    gameInstance.startTimer();
                }
            }
        });


        $('.tower').droppable({
            accept: '.disk',
            tolerance: 'pointer',
            
            drop: (event, ui) => {
                let $disk = ui.draggable;
                let $targetTower = $(event.target);
                let $sourceTower = $disk.closest('.tower');

                let targetTowerIndex = parseInt($targetTower.data('tower'));
                let sourceTowerIndex = parseInt($sourceTower.data('tower'));
                
                if(this.isValidMove($disk, sourceTowerIndex,targetTowerIndex)){
                    this.makeMove($disk, sourceTowerIndex, targetTowerIndex);
                }

                let $pole = $targetTower.find('.pole');
                $pole.removeClass('poleHighlight');
    
            },

            over: (event,ui) => {
                let $targetTower = $(event.target);
                let $pole = $targetTower.find('.pole');

                $pole.addClass('poleHighlight');
            },

            out: (event,ui) => {
                let $targetTower = $(event.target);
                let $pole = $targetTower.find('.pole');

                $pole.removeClass('poleHighlight');                
            }
        });
    }

    isValidMove($disk,sourceTowerIndex, targetTowerIndex){
        let diskIndex = parseInt($disk.data('index'));
        let targetTower = this.towers[targetTowerIndex];

        if (targetTower.length == 0){
            return true;
        }
        
        let topDiskIndex = targetTower[targetTower.length - 1];
        if(diskIndex < topDiskIndex && sourceTowerIndex !== targetTowerIndex){
            return true;
        }
        else{
            return false;
        }
    }

    makeMove($disk, sourceTowerIndex, targetTowerIndex){
        let diskIndex = this.towers[sourceTowerIndex].pop();
        this.towers[targetTowerIndex].push(diskIndex);

        let $targetTowerStack = $(`.tower[data-tower="${targetTowerIndex}"] .disk-stack`);
        $targetTowerStack.append($disk);

        $disk.css({
            'left': '',
            'top': '',
            'position': '',
        });

        this.moves++;
        $("#moveCount").text(this.moves);
        
        if(this.checkWin()){
            this.won = true;
            $('.disk').draggable('disable');
            this.stopTimer();
            this.showWinMessage();
        }
    }

    checkWin(){
        if(this.towers[2].length === this.diskCount){
            return true;
        }
        return false;
    }

    startTimer(){
        if (!this.timeStart) {
            this.timeStart = Date.now();
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    updateTimer(){
        const elapsed = Math.floor((Date.now() - this.timeStart) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        $("#timer").text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    stopTimer(){
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    showWinMessage(){
        setTimeout(() => {
            alert(`Congratulations! You won in ${this.moves} moves!`);
        }, 500);
    }

    resetGame(){
        this.moves = 0;
        this.won = false;
        this.start = false;
        this.timeStart = null;
        this.stopTimer();
        
        $("#moveCount").text('0');
        $("#timer").text('00:00');
        
        // Re-enable dragging
        $('.disk').draggable('enable');
        
        this.createDisks();
        this.DragNDrop();
    }

    setupEventListeners(){
        $("#resetBtn").click(() => {
            this.resetGame();
        });
    }
}

$(document).ready(() => {
    new TowerOfHanoi();
});
