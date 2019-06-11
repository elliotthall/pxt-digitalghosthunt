/**
 */
// % color=#333300 weight=100 icon="\uf21b"
// block="SEEK"
namespace ghosthunter {

    class Anchor {
        addr:number;
        distance:number;

        constructor(addr:number,distance:number) {
            this.addr=addr;
            this.distance=distance;
        }
    }

    

    //telegraph
    let alphabet: string[] = []
    let morse: string[] = []
    let scan_result = 0;
    // Toggle test version so students can use it
    let test_mode = false;
    morse = [".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--..", ".----", "..---", "...--", "....-", ".....", "-....", "--...", "---..", "----.", "-----"]
    alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    let sep: string = ";;";
    // Their translations, by index
    let msgs = ['A', 'M', 'UNDER', 'OVER', 'THIEF', 'YES', 'NO', 'WAIT', 'DANGER', 'THANK YOU']
    
    // Sprit sign
    let selected = [[0, -1]];
    let x: number = 2;
    let y: number = 2;
    // Spirit signs
    let signs = [
        images.createImage(`
        # . . . .
        # . . . .
        # # # # #
        . . . . #
        . . . . #
        `),
        images.createImage(`
        # . . . #
        . . # . .
        . . # . .
        . . # . .
        # . . . #
        `),
        images.createImage(`
        # . . . .
        # . . . .
        # . . . #
        . . . . #
        . . . . #
        `),
        images.createImage(`
        # # . . .
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        `),
        images.createImage(`
        # # . . .
        # . . . .
        . . . . .
        . . . . #
        . . . # #
        `),
        images.createImage(`
        . . . . #
        . . . . #
        . . # # #
        . . . . .
        # . . . .
        `),
        images.createImage(`
        . . # . .
        . . # . .
        . . . . .
        . . # . .
        . . # . .
        `),
        images.createImage(`
        . . . . .
        . . . . .
        # # . # #
        . . . . .
        . . . . .
        `),
        images.createImage(`
        . . . . .
        . . . . .
        . . . . .
        . . # . .
        # # # # #
        `),
        images.createImage(`
        # . . . #
        # . . . #
        # # # # #
        . . . . .
        . . . . .
        `),
    ];

    /* ****************************************************************

    Startup Blocks and events

    */

     //% block
    export function startUp() {
        // Set UART pins to 0,1 for DWM
        connectUWB();

        radio.setGroup(99);
        
        /* Used in the finale when the ghost 'speaks' through detectors */
        radio.onReceivedString(function (receivedString: string) {
            basic.showString(receivedString);
        });
    }



    /* ****************************************************************

    SEEK functions

    Main functions for each type of SEEK detector

    */

   
    /* 

    G Meter

    v2.0 now uses UWB functions below

    */
    //% block
    export function gMeter(): number {
        return scan(5000);

    }

    /**

    Ectoscope

    v2.0 now uses UWB functions below

    */
   
    //% block
    export function ectoScan(): number {
        let result = 0;

        return result;
    }

    function scan(range: number): number {
        let result = 0;
        if (test_mode) {
            // Return a random number so they can test
            result = Math.randomRange(0, 10)
        } else {
            // REFACTOR
            let nearest = nearestAnchor();
            return 0;

        }
        return scan_result;
    }

    //% block="transmit|message %msg"
    export function transmit(msg: string): string {
        basic.showLeds(`
    . . # . .
    . . # . .
    . . # . .
    . . # . .
    . . # . .
    `);
        basic.pause(300);
        basic.showLeds(`
    # . # . #
    . # # # .
    # . # . #
    . . # . .
    . . # . .
    `)
        basic.pause(300);
        basic.showLeds(`
    . . # . .
    . . # . .
    . . # . .
    . . # . .
    . . # . .
    `);
        if (msg == 'TEST') {
            return "TEST"
        } else {
            //sendtopi(msg)
            for (let m = 0; m < morse.length; m++) {
                if (msg == morse[m]) {
                    return alphabet[m];
                }
            }

        }
        return ""
    }
    //% block="lean"
    export function lean(): string {
        let z = input.rotation(Rotation.Pitch);
        let a = input.rotation(Rotation.Roll);
        let lean = "";
        if (z >= 15) {
            lean = "D";
        } else if (z <= -15) {
            lean = "U";
        } else if (a >= 15) {
            lean = "R";
        } else if (a <= -15) {
            lean = "L";
        }

        return lean;
    }

    //%block
    export function select() {
        selected.push([x, y]);
    }
    //%block="Move Up"
    export function moveup() {
        if (notselected(x, y) == true) {
            led.unplot(x, y);
        }
        if (y > 0) {
            y += -1;
        }
        led.plot(x, y);

    }
    //%block="Move Down"
    export function moveDown() {
        if (notselected(x, y) == true) {
            led.unplot(x, y);
        }
        if (y < 4) {
            y += 1;
        }
        led.plot(x, y);
    }

    //%block="Move Left"
    export function moveLeft() {
        if (notselected(x, y) == true) {
            led.unplot(x, y);
        }
        if (x > 0) {
            x += -1;
        }
        led.plot(x, y);
    }

    function notselected(x: number, y: number): boolean {
        let toggle = true;
        for (let s = 0; s < selected.length; s++) {
            if (x == selected[s][0] && y == selected[s][1]) {
                toggle = false;
                break;
            }
        }
        return toggle;
    }

    //%block="Move Right"
    export function moveRight() {
        if (notselected(x, y) == true) {
            led.unplot(x, y);
        }
        if (x < 4) {
            x += 1;
        }
        led.plot(x, y);
    }



    //% block="decode|sign %sign"
    export function decode(): string {
        //Serialise the screen image into a string
        //let screen: Image = led.screenshot();

        let msg: string = "?"
        let matches: boolean = true
        for (let t = 0; t < signs.length; t++) {
            matches = true
            for (let b = 0; b < 5; b++) {
                for (let c = 0; c < 5; c++) {
                    if (led.point(b, c)) {
                        if (!signs[t].pixel(b, c)) {
                            matches = false;
                        }
                    } else if (!led.point(b, c)) {
                        if (signs[t].pixel(b, c)) {
                            matches = false;
                        }
                    }

                }
            }
            if (matches) {
                msg = msgs[t]
                break;
            }
        }
        selected = [];
        x = 2;
        y = 2;
        return msg;
    }

/* ****************************************************************

    UWB functions

    */

    //% shim=ghosthunter::getCurrentNumAnchors
    export function getCurrentNumAnchors(): number {
        return 0;
    }

    //% shim=ghosthunter::currentAnchorIDAt
    function currentAnchorIDAt(index:number):number{
        return 0;
        
    }

    //% shim=ghosthunter::currentAnchorDistanceAt
    function currentAnchorDistanceAt(index:number):number{
        return 0;        
    }
    
    //% shim=ghosthunter::currentLoc
    export function currentLoc():number {
        return 0;
    }

    /**
    Nearest poi in mm 
    */    
    export function nearestAnchor(): Anchor{        
        let anchors = [];        
        let numAnchors = getCurrentNumAnchors();
        if (numAnchors > 0){
            for (let x=0;x<numAnchors;x++){
                anchors[x] = new Anchor(currentAnchorIDAt(x),currentAnchorDistanceAt(x));
            }
        
            anchors.sort(function (a, b) {
              return a.distance - b.distance;
            });
            return anchors[0];
        }
        return new Anchor(0,0);
    }






     

    

/* ***************************************

Pi functions (Deprecated)
Kept for backwards compatibility with Mk 1 SEEK

*/

    function sendtopi(code: string) {
        serial.writeLine(code);
    }

    /**
     * Receive a command from the pi and parse it
     */
    function picommand(command_string: string) {
        let command: string = command_string.substr(0, command_string.indexOf("::"));
        let value: string = command_string.substr(command_string.indexOf("::") + 2);
        switch (command) {
            case 'reset':
                control.reset()
                break;
            case 'text':
                basic.showString(value)
                break;
        }

    }

    // Commands from pi to microbit
    serial.onDataReceived("$", function () {
        let msg2: string = serial.readUntil("$");
        if (msg2.length > 0) {
            picommand(msg2);
        }
    })


    

    // Scan results (done as a listener to avoid timeout)
    /* serial.onDataReceived("}", function () {
         let msg: string = serial.readUntil("}");
         if (msg.length > 0) {
             scan_result = parseInt(msg);
         }
     })*/



    /*function getpimessages() {
        let msg: string = serial.readLine();
        if (msg.length > 0) {
            picommand(msg);
        }
    }*/



}
