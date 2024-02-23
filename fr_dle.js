
const gameTitle = "fr_dle"; // title
const dayZero = new Date(2024, 1, 22);
var daycount = 0; 

var secret;
var secretDisplay; // secret word with all accents included

const tries = 6; // number of rows (number of guesses available)
var length; // number of columns (length of the word) (generated at loadwords)

var rowTile = 0; // current row of tile that user is at
var colTile = 0; // current column of tile that user is at

var win = false; 
var lose = false;

var attempt = "";
let count = new Map(); // count of each letter in guess
let secretcount = new Map(); // count of each letter in secret word

var wordbank = [];
var guessbank = [];

var emojis = []; // emoji array to share

window.onload = function () {
    initalize();
}

function initalize() {

    loadWords();

    scaleBoard(); // Adapt board to word of the day length

    createTiles(); // Generate Tiles

    createKeyboard(); // Generate Keyboard

    secretCounter(); // Count letters in word of the day

    // Key Presses / Input
    document.addEventListener("keyup", (e) => {
        processKeyPress(e);
    })

}

// Will alternate between word lengths of 5, 6 and 7 letters
function updateDate() { // seed of the day to choose word length and word
    document.getElementById("title").innerText = gameTitle;

    const today = new Date();
    today.setHours(0);
    daycount = Math.round((today - dayZero) / (1000 * 60 * 60 * 24)).toFixed(0);

    if (daycount % 3 == 0) return 7;
    else if (daycount % 3 == 1) return 5;
    else return 6;
}
function loadWords() {

    group = updateDate(); // word length of the day (daycount as seed also generated)
    let seed = wordRouter567[group - 5][daycount];

    wordbank = document.getElementById("wordbank"+group).innerText.split(" "); // load banks based on word length
    guessbank = document.getElementById("guessbank"+group).innerText.split(" ");

    length = group;
    secretDisplay = wordbank[seed].toUpperCase();

    //remove accents for comparing input/output
    secret = secretDisplay.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

function scaleBoard() {
    document.getElementById("grid").style.width = 64 * length + "px"; // scale background grid to word length
}

//Generate Tiles (<span id="00" class="tile"> </span>)
function createTiles() {

    for (row = 0; row < tries; row++) {
        for (col = 0; col < length; col++) {

            let tile = document.createElement("span");
            tile.id = row.toString() + col.toString();
            tile.innerText = "";
            tile.classList.add("tile");

            document.getElementById("grid").appendChild(tile);
        }
    }

}

//Generate Keyboard
function createKeyboard() {
    var row1 = document.getElementById("keyboardRow1");
    var row2 = document.getElementById("keyboardRow2");
    var row3 = document.getElementById("keyboardRow3");
    row1.classList.add("keyboardRow");
    row2.classList.add("keyboardRow");
    row3.classList.add("keyboardRow");
    row2.style.width = "351px";


    const keys = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"]
    ]

    for (i = 0; i < keys.length; i++) {
        var keyrow = keys[i];

        if (i == 2) { // 3rd row with ENTER and BACKSPACE
            let key = 0;
            createKey("specialkey", key);
            for (key = 1; key < keyrow.length - 1; key++) {
                createKey("key", key);
            }
            key = keyrow.length - 1;
            createKey("specialkey", key);
            document.getElementById("Backspace").innerText = "Back";
        }
        else {
            for (key = 0; key < keyrow.length; key++) {
                createKey("key", key);
            }
        }
    }

    function createKey(classList, key) {
        let keyTile = document.createElement("span");
        keyTile.id = keyrow[key];
        keyTile.innerText = keyrow[key];
        keyTile.classList.add(classList);

        if (classList == "key") {
            keyTile.addEventListener("click", processKey);
        }
        else {
            keyTile.addEventListener("click", processSpecialKey);
        }

        let j = i + 1;
        document.getElementById("keyboardRow" + j).appendChild(keyTile);
    }
    function processKey() {
        let e = { "code": "Key" + this.id };
        processKeyPress(e);
    }
    function processSpecialKey() {
        let e = { "code": this.id };
        processKeyPress(e);
    }
}

// Count each letter in guess (for checking against duplicate letters)
function counter(letter) {

    if (count.has(letter)) { count.set(letter, count.get(letter) + 1); }
    else { count.set(letter, 1); }
}

// Count each letter in secret word (for checking against duplicate letters in answer)
function secretCounter() {

    for (i = 0; i < length; i++) {
        if (secretcount.has(secret[i])) {
            secretcount.set(secret[i], secretcount.get(secret[i]) + 1);
        }
        else secretcount.set(secret[i], 1);
    }
    secretcount.forEach((letter, num) => { console.log(num + ": " + letter); })


}

function processKeyPress(e) {

    if (win || lose) return;

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (colTile < length) {
            document.getElementById(rowTile.toString() + colTile.toString()).innerText = e.code[3];
            colTile += 1;
        }
    }
    else if (e.code == "Backspace") {
        if (0 < colTile && colTile <= length) {
            colTile -= 1;
        }
        document.getElementById(rowTile.toString() + colTile.toString()).innerText = "";
    }
    else if (e.code == "Enter" && colTile == length ) {
        checkGuess();
        rowTile += 1;
        colTile -= length; // before this just reset to 0, but this lets me remain at the same time after submitting a guess that is invalid (see colTile += length in checkGuess)

        if (attempt == secret) {
            setTimeout(function () {
                win = true;
                document.getElementById("result").innerText = "GAGNANT!"; // Display WINNER after win
                document.getElementById("winnerword").innerText = secretDisplay;
                document.getElementById("winnerword").hidden = false;
                document.getElementById("copyresults").hidden = false;
                document.getElementById("copyresults").classList.add("button", "buttonResults");
            }, 500);
        }
        attempt = "";
    }

    if (rowTile == tries) {
        lose = true;
        document.getElementById("result").innerText = secretDisplay; // Display word after loss
        document.getElementById("copyresults").hidden = false;
        document.getElementById("copyresults").classList.add("button", "buttonResults");
    }
}

function checkGuess() {

    //check if word is in accepted word bank
    for (colTile = 0; colTile < length; colTile++) {
        const letter = document.getElementById(rowTile.toString() + colTile.toString()).innerText;
        attempt = attempt.concat(letter);
    }
    if (!guessbank.includes(attempt.toLowerCase())) {
        var message = document.getElementById("wordwarning");
        message.style.visibility = 'visible';
        setTimeout(function () {
            message.style.visibility = 'hidden';
        }, 1500);
        rowTile -= 1;
        colTile += length;
        return;
    }
    if (attempt == secret) {
        for (colTile = 0; colTile < length; colTile++) {
            let guess = document.getElementById(rowTile.toString() + colTile.toString()); // tile element
            let key = document.getElementById(guess.innerText); // key element
            guess.classList.add("correctTile");
            if (key.classList.contains("partialTile")) { key.classList.remove("partialTile"); }
            key.classList.add("correctTile");
        }
        emojis.push(addRowOfEmojis());
        return;
    }

    //keeping track of which letters have matched - so i can check duplicate characters
    var trackgreen = []; // array of objects { letter: "", index: 0 }; 
    var trackyellow = [];

    count.forEach((num, key) => { count.delete(key); }) // reset counter for each new gues

    for (colTile = 0; colTile < length; colTile++) {
        let guess = document.getElementById(rowTile.toString() + colTile.toString()); // tile element
        let key = document.getElementById(guess.innerText); // key element

        const letter = guess.innerText;

        if (letter == secret[colTile]) {
            guess.classList.add("correctTile");
            if (key.classList.contains("partialTile")) { key.classList.remove("partialTile"); }
            key.classList.add("correctTile");

            let tilechanged = { char: letter, index: colTile };
            trackgreen.push(tilechanged);
        }
        else if (secret.includes(letter)) {
            guess.classList.add("partialTile");
            key.classList.add("partialTile");

            let tilechanged = { char: letter, index: colTile };
            trackyellow.push(tilechanged);
        }
        else {
            guess.classList.add("incorrectTile");
            key.classList.add("incorrectTile");
        }
        counter(letter)
    }

    // correct duplicates
    correctDuplicateColors(trackgreen, trackyellow);

    // make sure green keys are not overwritten
    keysGreen();

    // read final tile colours to generate emoji array
    emojis.push(addRowOfEmojis());

}

function correctDuplicateColors(trackgreen, trackyellow) {
    
    var dup = false; // are there duplicate letters in guess
    var secdup = false; // are there duplicate letters in the secret word

    // Check to see if there are any duplicate letters in the guess to verify, and if not, break out of this function
    var countTester = count.values();
    for (i = 0; i < count.size; i++) {
        if (countTester.next().value > 1) dup = true;
    }
    if (!dup) return;

    // Check if there are NO duplicate letters in the real answer

    var seccountTester = secretcount.values();
    for (i = 0; i < secretcount.size; i++) {
        if (seccountTester.next().value > 1) secdup = true;
    } 
    if (!secdup) { // There are no duplicates in the real answer, and all duplicate letters in guess must be corrected

        removeDuplicates(trackgreen, trackyellow);
    }
    else if (secdup) { 
        // check if any of the duplicate letters in the guess are the same as the duplicate secret letters
        // if NOT: can process as if there were no duplicates in the secret word 
        var match = false;

        secretcount.forEach((num, letter) => {

            if (num > 1) { // selecting for duplicate letters in secret word
                count.forEach((numG, letterG) => {
                    if (numG > 1 && letterG == letter) {
                        match = true;
                    }
                })
            }
        })

        if (!match) { // identical code as if (!secdup)

            removeDuplicates(trackgreen, trackyellow);
        }
        else {

            processMatchedDuplicates(trackyellow)
            removeDuplicates(trackgreen, trackyellow);
        }
    }

    function processMatchedDuplicates(trackyellow) {
        var corrected = [];

        // split between duplicate letters that are duplicate and ones that arent that can be treated using removeDuplicates()
        for (i = 0; i < count.size; i++) {
            var letter = Array.from(count.keys())[i]; // letter at current index in count
            var guestcount = count.get(letter);

            if (secretcount.has(letter)) var realcount = secretcount.get(letter);
            else realcount = 0;

            if (guestcount > 1 && secretcount.has(letter) && guestcount > realcount) {

                var correction = guestcount - realcount; // need to correct the current letter 
                var current = 0;

                for (correction; correction > 0; correction--) {

                    for (j = trackyellow.length - 1; j > -1; j--) {

                        if (trackyellow[j].char == letter) {

                            var last = trackyellow[j].index;
                            document.getElementById(rowTile.toString() + last).classList.add("incorrectTile");

                            trackyellow.splice(j, 1);
                            break;
                        }
                    }
                }
                corrected.push(letter);
            }
            else if (guestcount > 1 && guestcount == realcount) corrected.push(letter);
        }

        // Remove letters that have already been processed, so that I can treat the rest 
        for (i = 0; i < corrected.length; i++) {
            count.delete(corrected[i]);
        }
    }

    // Keeps only the first (or green) of any duplicates in count
    function removeDuplicates(trackgreen, trackyellow) {

        count.forEach((num, letter) => {
            if (num > 1) { // only checking duplicate letters

                if (trackgreen.some(e => e.char == letter)) { // keep green letter as precedent, and remove other yellows
                    for (i = 0; i < attempt.length; i++) {
                        if (attempt[i] == letter && i != (trackgreen.find(e => e.char == letter)).index) { // 
                            document.getElementById(rowTile.toString() + i).classList.add("incorrectTile");
                        }
                    }
                }
                else if (trackyellow.some(e => e.char == letter)) { //not green, so keep only first of duplicate letters as yellow
                    for (i = 0; i < num; i++) { // runs through the same number of times as there are duplicate letters in the guess. we want to ignore the first time, and delete the rest

                        for (j = 0; j < trackyellow.length; j++) {
                            if (trackyellow[j].char == letter) {
                                if (i == 0) {
                                    trackyellow.splice(j, 1); // ignore first instance
                                    break;
                                }
                                else {
                                    document.getElementById(rowTile.toString() + trackyellow[j].index).classList.add("incorrectTile");
                                    console.log(letter + " has been corrected");
                                }
                            }
                        }
                    }
                }
            }
        })
    } 
}
function keysGreen() {

    for (i = 0; i < attempt.length; i++) {
        let keyList = document.getElementById(attempt[i]).classList;
        while (keyList.contains("correctTile") && keyList.contains("partialTile")) {
            keyList.remove("partialTile");
        }
        while (keyList.contains("correctTile") && keyList.contains("incorrectTile")) {
            keyList.remove("incorrectTile");
        }
    }
}
function addRowOfEmojis() {
    let temprow = [];
    for (colTile = 0; colTile < length; colTile++) {
        let guess = document.getElementById(rowTile.toString() + colTile.toString());
        if (guess.classList.contains("correctTile")) {
            temprow.push("🟩"); // green square &#129001
        }
        else if (guess.classList.contains("incorrectTile")) {
            temprow.push("⬜"); // white square &#11036
        }
        else temprow.push("🟨"); // yellow square &#129000
    }
    return temprow;
}
function copyResults() {

    for (i = 0; i < emojis.length; i++) {
        emojis[i] = emojis[i].join("");
    }
    emojis.unshift(gameTitle + " " + daycount + " " + emojis.length + "/" + tries);

    let resultsString = emojis.join("\n");
    navigator.clipboard.writeText(resultsString);
}

// Keys to randomly select word of the day based on today's date
const wordRouter567 = [
    [391, 422, 237, 337, 217, 263, 152, 242, 625, 691, 240, 481, 487, 275, 703, 475, 517, 258, 267, 209, 550, 146, 568, 264, 48, 434, 86, 229, 388, 644, 528, 555, 395, 578, 316, 448, 348, 84, 653, 35, 318, 22, 687, 546, 344, 384, 400, 311, 357, 113, 125, 138, 425, 181, 201, 216, 677, 548, 648, 396, 589, 542, 197, 107, 443, 232, 567, 628, 124, 287, 495, 334, 325, 483, 436, 118, 271, 507, 360, 11, 513, 147, 551, 470, 408, 313, 4, 143, 141, 504, 704, 623, 683, 149, 712, 327, 583, 14, 565, 134, 594, 457, 243, 302, 179, 451, 103, 452, 53, 643, 397, 37, 165, 535, 547, 280, 553, 21, 89, 109, 169, 352, 666, 273, 468, 133, 218, 690, 226, 305, 681, 208, 614, 421, 706, 206, 95, 332, 171, 698, 234, 323, 619, 288, 454, 99, 647, 569, 529, 57, 268, 221, 694, 392, 562, 435, 490, 477, 235, 485, 205, 659, 715, 649, 116, 359, 274, 579, 640, 566, 445, 49, 506, 532, 322, 157, 424, 139, 617, 638, 673, 658, 556, 91, 294, 373, 439, 655, 303, 592, 7, 607, 401, 708, 38, 702, 122, 335, 430, 696, 319, 356, 239, 76, 8, 634, 154, 414, 493, 474, 178, 559, 370, 67, 431, 377, 47, 284, 155, 620, 610, 525, 34, 228, 390, 600, 207, 55, 338, 381, 33, 144, 340, 386, 582, 295, 471, 459, 29, 108, 428, 707, 363, 170, 444, 522, 652, 685, 549, 46, 678, 75, 244, 231, 74, 364, 73, 336, 115, 28, 18, 9, 464, 489, 518, 437, 32, 709, 166, 167, 315, 177, 304, 554, 449, 526, 120, 50, 426, 657, 412, 59, 210, 636, 88, 661, 633, 521, 140, 672, 342, 93, 572, 261, 1, 697, 406, 45, 587, 102, 129, 523, 200, 320, 632, 44, 492, 378, 227, 622, 199, 642, 277, 30, 111, 670, 639, 36, 496, 497, 85, 601, 362, 488, 185, 183, 467, 372, 591, 564, 81, 637, 654, 512, 667, 215, 710, 499, 223, 375, 575, 509, 358, 537, 96, 52, 254, 10, 184, 164, 616, 586, 701, 440, 104, 194, 596, 343, 324, 309, 24, 665, 574, 328, 541, 256, 135, 255, 570, 682, 407, 310, 225, 293, 70, 219, 403, 379, 161, 595, 415, 23, 505, 13, 411, 66, 282, 98, 680, 330, 106, 502, 64, 252, 26, 306, 501, 675, 351, 193, 349, 676, 656, 159, 245, 142, 20, 276, 441, 222, 189, 16, 609, 307, 398, 558, 290, 527, 473, 613, 629, 581, 561, 544, 15, 409, 58, 156, 314, 361, 260, 265, 605, 510, 158, 204, 248, 137, 56, 79, 367, 612, 603, 368, 491, 100, 131, 345, 163, 383, 538, 689, 317, 662, 557, 39, 299, 635, 196, 42, 480, 224, 530, 82, 413, 534, 250, 476, 101, 247, 6, 380, 514, 297, 693, 699, 385, 478, 220, 132, 516, 608, 186, 442, 621, 663, 438, 175, 402, 281, 615, 650, 112, 121, 105, 176, 61, 376, 203, 540, 531, 714, 588, 692, 298, 188, 458, 350, 593, 331, 257, 606, 333, 41, 191, 669, 584, 660, 160, 17, 382, 87, 462, 389, 624, 404, 212, 272, 456, 60, 341, 63, 366, 246, 394, 423, 251, 630, 289, 503, 598, 432, 618, 571, 590, 300, 347, 326, 174, 482, 420, 533, 214, 355, 674, 365, 238, 631, 126, 187, 453, 399, 645, 110, 283, 198, 213, 664, 393, 202, 3, 180, 339, 278, 279, 71, 151, 65, 173, 192, 405, 472, 419, 270, 455, 43, 711, 296, 374, 626, 286, 599, 301, 329, 466, 602, 427, 520, 19, 123, 695, 211, 545, 519, 262, 688, 679, 136, 563, 148, 195, 78, 671, 62, 25, 168, 83, 668, 686, 446, 560, 604, 511, 536, 312, 230, 90, 308, 292, 266, 92, 321, 80, 479, 417, 119, 97, 463, 486, 494, 145, 508, 353, 153, 51, 651, 69, 597, 418, 162, 150, 2, 68, 387, 543, 236, 447, 713, 641, 40, 77, 585, 465, 371, 285, 291, 5, 114, 31, 460, 233, 539, 416, 259, 524, 684, 429, 27, 700, 469, 461, 253, 241, 705, 249, 552, 130, 369, 128, 646, 72, 573, 410, 498, 577, 576, 12, 500, 484, 172, 117, 627, 127, 515, 450, 611, 182, 346, 94, 190, 269, 433, 354, 580, 54],
    [91, 346, 365, 295, 568, 592, 5, 69, 99, 485, 147, 101, 602, 285, 87, 525, 71, 375, 425, 559, 116, 41, 388, 359, 248, 142, 100, 22, 321, 276, 439, 553, 583, 563, 414, 187, 55, 508, 247, 270, 422, 545, 264, 120, 175, 567, 113, 412, 9, 287, 197, 190, 11, 83, 163, 30, 558, 240, 390, 266, 15, 481, 294, 448, 533, 447, 123, 52, 519, 492, 450, 392, 527, 242, 505, 574, 25, 360, 577, 350, 67, 2, 189, 14, 330, 262, 339, 590, 316, 24, 50, 146, 606, 75, 51, 543, 528, 403, 284, 78, 215, 216, 576, 489, 340, 420, 332, 273, 338, 457, 363, 207, 458, 161, 110, 584, 536, 516, 580, 224, 438, 604, 537, 362, 431, 105, 208, 96, 421, 547, 297, 560, 153, 1, 37, 61, 397, 302, 591, 410, 89, 48, 374, 62, 299, 214, 238, 355, 315, 477, 603, 582, 539, 174, 571, 23, 564, 170, 165, 466, 13, 515, 598, 275, 304, 219, 154, 199, 408, 225, 107, 253, 134, 252, 281, 271, 40, 108, 524, 307, 467, 325, 452, 377, 60, 70, 245, 226, 317, 12, 97, 521, 53, 556, 250, 137, 233, 319, 114, 95, 231, 430, 169, 411, 244, 79, 512, 293, 192, 201, 428, 368, 258, 164, 495, 453, 168, 320, 413, 401, 522, 306, 552, 609, 381, 565, 72, 159, 109, 58, 143, 488, 445, 222, 373, 112, 544, 139, 573, 202, 352, 204, 117, 334, 600, 551, 298, 446, 513, 588, 432, 498, 369, 462, 542, 103, 538, 480, 380, 76, 126, 254, 84, 149, 607, 229, 28, 3, 38, 502, 136, 54, 354, 177, 102, 232, 383, 133, 291, 64, 32, 514, 119, 372, 301, 311, 407, 441, 57, 46, 426, 35, 596, 491, 361, 534, 335, 395, 517, 308, 313, 39, 256, 348, 303, 171, 104, 180, 122, 157, 6, 423, 569, 323, 210, 456, 125, 570, 81, 475, 343, 127, 20, 158, 417, 121, 223, 235, 124, 376, 440, 188, 550, 589, 167, 269, 211, 74, 496, 566, 405, 507, 274, 16, 239, 578, 152, 455, 473, 10, 364, 548, 393, 29, 378, 129, 193, 268, 141, 218, 386, 106, 259, 594, 21, 349, 523, 370, 402, 479, 518, 36, 182, 418, 371, 267, 150, 280, 200, 379, 357, 279, 562, 443, 43, 309, 391, 409, 541, 469, 435, 501, 236, 554, 561, 389, 483, 130, 310, 586, 476, 209, 33, 344, 427, 82, 478, 34, 156, 326, 42, 183, 406, 90, 549, 579, 493, 185, 461, 292, 49, 444, 162, 8, 531, 278, 593, 540, 510, 77, 572, 228, 468, 449, 497, 85, 144, 18, 305, 384, 220, 249, 261, 263, 138, 206, 328, 337, 415, 260, 484, 454, 27, 506, 221, 172, 73, 191, 404, 63, 463, 56, 494, 26, 342, 509, 500, 288, 520, 179, 595, 437, 194, 290, 296, 111, 333, 7, 353, 155, 398, 213, 212, 575, 277, 314, 93, 203, 227, 487, 88, 399, 351, 31, 396, 312, 237, 459, 474, 367, 186, 4, 184, 195, 526, 318, 416, 546, 503, 44, 322, 151, 115, 251, 382, 300, 511, 347, 433, 47, 442, 470, 429, 178, 336, 557, 289, 345, 98, 66, 80, 424, 394, 92, 608, 585, 529, 243, 282, 385, 160, 176, 17, 327, 45, 341, 451, 283, 265, 59, 465, 234, 460, 86, 205, 366, 68, 181, 486, 535, 94, 464, 246, 128, 148, 434, 140, 472, 581, 135, 217, 331, 601, 358, 605, 530, 499, 482, 241, 230, 324, 555, 65, 257, 471, 118, 599, 196, 436, 532, 166, 131, 198, 19, 356, 286, 597, 387, 587, 419, 504, 255, 490, 173, 132, 400, 145, 272, 329],
    [272, 169, 485, 293, 208, 389, 654, 296, 89, 543, 391, 520, 607, 193, 52, 487, 474, 301, 80, 79, 432, 418, 377, 521, 106, 305, 338, 578, 7, 197, 533, 33, 526, 441, 461, 434, 390, 25, 492, 78, 467, 64, 406, 571, 217, 270, 353, 562, 352, 620, 20, 45, 431, 336, 419, 4, 159, 638, 1, 108, 662, 303, 636, 568, 335, 501, 468, 500, 99, 290, 507, 119, 645, 220, 189, 35, 482, 227, 505, 206, 125, 30, 277, 542, 354, 587, 360, 615, 513, 221, 248, 428, 665, 19, 527, 102, 397, 120, 225, 199, 339, 265, 27, 232, 77, 597, 425, 454, 26, 618, 200, 75, 574, 496, 509, 173, 255, 195, 531, 522, 598, 518, 212, 408, 606, 603, 394, 318, 438, 484, 143, 175, 322, 445, 252, 115, 537, 174, 332, 185, 295, 264, 71, 423, 341, 495, 244, 575, 550, 8, 583, 18, 144, 170, 561, 184, 129, 2, 283, 580, 39, 261, 314, 233, 646, 297, 3, 477, 399, 630, 61, 476, 528, 472, 376, 446, 344, 250, 413, 148, 165, 17, 460, 649, 512, 190, 34, 395, 67, 573, 304, 96, 412, 241, 340, 313, 541, 166, 631, 316, 253, 321, 167, 465, 514, 37, 586, 493, 635, 545, 31, 373, 656, 329, 275, 626, 569, 499, 426, 475, 420, 644, 317, 204, 306, 142, 126, 276, 135, 570, 311, 271, 308, 15, 639, 430, 48, 549, 186, 40, 361, 218, 58, 249, 24, 611, 456, 130, 385, 667, 83, 584, 592, 263, 69, 437, 624, 154, 14, 613, 325, 371, 576, 191, 188, 292, 486, 345, 44, 87, 86, 661, 238, 32, 257, 479, 515, 97, 202, 53, 46, 471, 558, 47, 387, 534, 564, 577, 320, 348, 523, 103, 632, 433, 478, 260, 156, 559, 299, 634, 287, 670, 205, 666, 177, 358, 546, 374, 655, 364, 622, 150, 557, 386, 146, 384, 100, 282, 178, 172, 342, 258, 215, 124, 310, 192, 516, 405, 346, 382, 532, 621, 16, 132, 409, 356, 111, 421, 164, 300, 171, 640, 307, 98, 617, 84, 455, 403, 155, 105, 43, 327, 10, 123, 579, 82, 565, 337, 127, 383, 55, 137, 448, 326, 551, 417, 138, 443, 435, 114, 91, 414, 23, 85, 524, 359, 450, 266, 168, 330, 422, 350, 530, 436, 494, 134, 452, 590, 94, 291, 538, 629, 544, 226, 411, 158, 256, 6, 319, 369, 596, 231, 380, 349, 612, 13, 637, 201, 392, 398, 464, 458, 643, 539, 497, 56, 274, 70, 160, 508, 491, 74, 619, 616, 5, 554, 367, 453, 107, 519, 237, 149, 599, 203, 209, 440, 181, 560, 90, 659, 459, 658, 488, 285, 207, 59, 179, 242, 284, 180, 230, 88, 457, 351, 251, 139, 42, 447, 451, 582, 381, 407, 510, 104, 66, 246, 366, 444, 269, 547, 664, 355, 229, 235, 131, 273, 365, 642, 333, 136, 370, 331, 183, 503, 648, 463, 298, 396, 176, 234, 650, 93, 449, 118, 281, 401, 506, 151, 388, 121, 247, 29, 404, 588, 591, 116, 153, 50, 51, 49, 22, 595, 529, 109, 660, 9, 481, 95, 60, 608, 302, 145, 362, 76, 566, 328, 213, 442, 182, 525, 605, 552, 268, 511, 210, 368, 427, 504, 601, 92, 466, 410, 72, 163, 239, 240, 267, 593, 641, 294, 211, 280, 647, 161, 21, 555, 113, 157, 324, 372, 553, 112, 343, 312, 81, 502, 62, 63, 379, 416, 243, 110, 600, 288, 470, 625, 289, 663, 11, 315, 286, 572, 133, 219, 128, 57, 323, 653, 12, 633, 669, 651, 140, 375, 563, 602, 489, 393, 604, 214, 462, 490, 254, 228, 548, 567, 141, 309, 236, 400, 347, 117, 402, 556, 196, 581, 38, 28, 54, 429, 657, 222, 223, 594, 483, 668, 245, 357, 469, 41, 439, 517, 262, 65, 162, 187, 101, 198, 147, 610, 480, 652, 609, 122, 473, 614, 278, 498, 36, 589, 378, 623, 415, 224, 536, 334, 68, 216, 424, 73, 540, 585, 535, 627, 279, 152, 259, 628, 194, 363]
];
