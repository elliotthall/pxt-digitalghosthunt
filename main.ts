/**
 * 
 */
//% color=#333300 weight=100 icon="\uf21b" block="SEEK"
namespace ghosthunter {
    //telegraph
    let alphabet: string[] = []
    let morse: string[] = []
    let scan_result = 0;
    // Toggle test version so students can use it
    let test_mode = true;

    radio.setGroup(99);

    morse = [".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--..", ".----", "..---", "...--", "....-", ".....", "-....", "--...", "---..", "----.", "-----"]
    alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]


    let sep: string = ";;";


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
    ]
    // Their translations, by index
    let msgs = ['A', 'M', 'UNDER', 'OVER', 'THIEF', 'YES', 'NO', 'WAIT', 'DANGER']
    //% block
    export function startUp() {
        //serial.writeString("Ready")
        /* 
    Used in the finale when the ghost 'speaks' through detectors
    */
        radio.onReceivedString(function (receivedString: string) {
            basic.showString(receivedString);
        });
    }

    //% block
    export function gMeter(): number {
        return scan("G" + sep);

    }

    // note that Caml casing yields lower case
    // block text with spaces

    //% block
    export function ectoScan(): number {
        return scan("E" + sep);
    }

    function scan(msg: string): number {
        if (test_mode) {
            // Return a random number so they can test
            scan_result = Math.randomRange(0, 10)
        } else {
            sendtopi(msg);
            basic.pause(1000);
            //let result = serial.readUntil("}");
            let result = serial.readString()
            if (result.length >0 && result.indexOf("}")>0){
                result = result.substr(0,(result.indexOf("}")-1));
                scan_result = parseInt(result);
            }else{
                scan_result = 0;
            }
            
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
        let y = input.rotation(Rotation.Pitch);
        let x = input.rotation(Rotation.Roll);
        let lean = "";
        if (y >= 15) {
            lean = "D";
        } else if (y <= -15) {
            lean = "U";
        } else if (x >= 15) {
            lean = "R";
        } else if (x <= -15) {
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
        for (let s = 0; s < signs.length; s++) {
            matches = true
            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 5; y++) {
                    if (led.point(x, y)) {
                        if (!signs[s].pixel(x, y)) {
                            matches = false;
                        }
                    } else if (!led.point(x, y)) {
                        if (signs[s].pixel(x, y)) {
                            matches = false;
                        }
                    }

                }
            }
            if (matches) {
                msg = msgs[s]
                break;
            }
        }
        selected = [];
        x = 2;
        y = 2;
        return msg;
    }


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
        let msg: string = serial.readUntil("$");
        if (msg.length > 0) {
            picommand(msg);
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
