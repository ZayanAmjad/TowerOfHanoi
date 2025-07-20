class TowerOfHanoi {
    constructor() {
        this.diskCount = 3;
        this.moves = 0;
        this.towers = [[], [], []];
        this.won = false;
        this.start = false;
        this.timeStart = null;
        this.timerInterval = null;
        this.selectedDisk = null;

        this.initGame();
        this.setupEventListeners();
    }

    initGame() {
        this.createDisks();
        this.updateMinMoves();
        this.updateMaxMoves();
        this.updateMaxTime();
        this.setupClickToMove();
    }

    createDisks() {
        $('.disk-stack').empty();
        this.towers = [[], [], []];

        for (let i = this.diskCount; i >= 1; i--) {
            let disk = $(`<div class="disk disk${i}" data-index="${i}"></div>`);
            $("#tower1 .disk-stack").append(disk);
            this.towers[0].push(i);
        }
    }

    updateMinMoves() {
        const minMoves = Math.pow(2, this.diskCount) - 1;
        $("#minMoves").text(minMoves);
    }

    updateMaxMoves() {
        const maxMoves = Math.pow(2, this.diskCount) +1;
        this.maxMoves = maxMoves; // Store for logic
        $("#maxMoves").text(maxMoves);
    }

    updateMaxTime() {
        const maxTime = this.diskCount * 1;
        this.maxTime = maxTime; // Store for logic (in minutes)
        $("#maxTime").text(maxTime + ' minutes');
    }

    setupClickToMove() {
        const gameInstance = this;

        $(document).off('click mousemove mouseleave');

        $(document).on('click', '.disk', function (e) {
            e.stopPropagation();
            if (gameInstance.selectedDisk) return;

            const $disk = $(this);
            const towerIndex = parseInt($disk.closest(".tower").data('tower'));
            const diskIndex = parseInt($disk.data('index'));
            const topDisk = gameInstance.towers[towerIndex].slice(-1)[0];

            if (diskIndex !== topDisk) return;

            if (!gameInstance.start) {
                gameInstance.start = true;
                gameInstance.startTimer();
            }

            gameInstance.selectDisk($disk, towerIndex, e.clientX, e.clientY);
        });

        $(document).on('mousemove', function (e) {
            if (!gameInstance.selectedDisk) return;

            const $disk = gameInstance.selectedDisk.$disk;
            const diskWidth = $disk.width();
            const diskHeight = $disk.height();

            $disk.css({
                left: (e.pageX - gameInstance.selectedDisk.offsetX) + 'px',
                top: (e.pageY - gameInstance.selectedDisk.offsetY) + 'px'
            });

            $('.pole').removeClass('poleHighlight');
            $('.tower').each(function () {
                const rect = this.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    $(this).find('.pole').addClass('poleHighlight');
                    return false;
                }
            });
        });

        $(document).on('click', '.tower', function (e) {
            e.stopPropagation();
            if (!gameInstance.selectedDisk) return;

            const targetTowerIndex = parseInt($(this).data('tower'));
            const sourceTowerIndex = gameInstance.selectedDisk.sourceTowerIndex;

            if (gameInstance.isValidMove(gameInstance.selectedDisk.$disk, sourceTowerIndex, targetTowerIndex)) {
                gameInstance.makeMove(gameInstance.selectedDisk.$disk, sourceTowerIndex, targetTowerIndex);
            } else {
                gameInstance.deselectDisk();
            }

            $('.pole').removeClass('poleHighlight');
        });

        $(document).on('mouseleave', '.gameArea', function () {
            $('.pole').removeClass('poleHighlight');
        });
    }

    selectDisk($disk, sourceTowerIndex, clickX, clickY) {
        // Store original parent and index
        const $stack = $disk.parent();
        const diskIndexInStack = $stack.children().index($disk);

        this.selectedDisk = {
            $disk,
            sourceTowerIndex,
            $originalStack: $stack,
            originalIndex: diskIndexInStack
        };

        // Get disk's current position relative to the page
        const offset = $disk.offset();
        const diskWidth = $disk.width();
        const diskHeight = $disk.height();

        $disk.addClass('dragging');

        // Move disk to body for global stacking
        $disk.appendTo('body');
        $disk.css({
            position: 'absolute',
            'pointer-events': 'none',
            left: (offset.left) + 'px',
            top: (offset.top) + 'px',
            width: diskWidth + 'px',
            height: diskHeight + 'px',
        });

        // Store offset for mouse movement calculations
        this.selectedDisk.offsetX = clickX - offset.left;
        this.selectedDisk.offsetY = clickY - offset.top;

        $('.tower').addClass('tower-highlight');
    }

    // New helper to reset styles only
    resetDiskStyles($disk) {
        $disk.css({
            left: '',
            top: '',
            position: '',
            width: '',
            height: '',
            'pointer-events': '',
        });
        $disk.removeClass('dragging');
    }

    deselectDisk() {
        if (!this.selectedDisk) return;

        const { $disk, $originalStack, originalIndex } = this.selectedDisk;

        // If the disk is not already in the original stack, move it back to its original position
        if (!$disk.parent().is($originalStack)) {
            if (originalIndex >= $originalStack.children().length) {
                $disk.appendTo($originalStack);
            } else {
                $disk.insertBefore($originalStack.children().eq(originalIndex));
            }
        }

        this.resetDiskStyles($disk);

        this.selectedDisk = null;
        $('.tower').removeClass('tower-highlight');
        $('.pole').removeClass('poleHighlight');
    }

    isValidMove($disk, sourceTowerIndex, targetTowerIndex) {
        if (sourceTowerIndex === targetTowerIndex) return false;

        const diskIndex = parseInt($disk.data('index'));
        const targetTower = this.towers[targetTowerIndex];
        if (targetTower.length === 0) return true;

        const topDiskIndex = targetTower[targetTower.length - 1];
        return diskIndex < topDiskIndex;
    }

    makeMove($disk, sourceTowerIndex, targetTowerIndex) {
        const diskIndex = this.towers[sourceTowerIndex].pop();
        this.towers[targetTowerIndex].push(diskIndex);

        const $targetStack = $(`.tower[data-tower="${targetTowerIndex}"] .disk-stack`);
        $disk.appendTo($targetStack); // Move disk back to stack

        this.resetDiskStyles($disk);

        this.moves++;
        $("#moveCount").text(this.moves);

        // Check for max moves exceeded
        if (this.moves > this.maxMoves) {
            this.stopTimer();
            this.showLoseMessage('moves');
            $(document).off('click mousemove');
            this.selectedDisk = null;
            $('.tower').removeClass('tower-highlight');
            $('.pole').removeClass('poleHighlight');
            return;
        }

        if (this.checkWin()) {
            this.won = true;
            this.stopTimer();
            this.showWinMessage();
            $(document).off('click mousemove');
        }

        this.selectedDisk = null;
        $('.tower').removeClass('tower-highlight');
        $('.pole').removeClass('poleHighlight');
    }

    checkWin() {
        return this.towers[2].length === this.diskCount;
    }

    startTimer() {
        if (!this.timeStart) {
            this.timeStart = Date.now();
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.timeStart) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        $("#timer").text(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

        // Check for max time exceeded
        if (minutes >= this.maxTime) {
            this.stopTimer();
            this.showLoseMessage('time');
            $(document).off('click mousemove');
            this.selectedDisk = null;
            $('.tower').removeClass('tower-highlight');
            $('.pole').removeClass('poleHighlight');
        }
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    showWinMessage() {
        setTimeout(() => {
            alert(`Congratulations! You won in ${this.moves} moves!`);
        }, 500);
    }

    showLoseMessage(reason) {
        setTimeout(() => {
            if (reason === 'moves') {
                alert(`Alas! You couldn't complete in max moves!`);
            } else if (reason === 'time') {
                alert(`Alas! You couldn't complete in time!`);
            } else {
                alert(`Alas! You couldn't complete the puzzle!`);
            }
            this.resetGame();
        }, 500);
    }

    resetGame() {
        this.moves = 0;
        this.won = false;
        this.start = false;
        this.timeStart = null;
        this.stopTimer();

        if (this.selectedDisk) {
            this.deselectDisk();
        }

        $("#moveCount").text('0');
        $("#timer").text('00:00');

        this.createDisks();
        this.setupClickToMove();
    }

    setupEventListeners() {
        $("#resetBtn").click(() => this.resetGame());
    }
}

$(document).ready(() => {
    new TowerOfHanoi();
});
