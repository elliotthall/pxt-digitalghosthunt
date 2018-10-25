/**
 * 
 */
//% color=190 weight=100 icon="\uf21b" block="Ghost Hunter"
namespace ghosthunter {
    let sep: string = ";;";
    let selected = [[0, -1]];
    let x:number = 0;
    let y:number = 0;
    // Spirit signs
    let signs = [images.createImage(`
    # . . . #
    . # . # .
    . # # # .
    . # . # .
    # . . . #
    `),
    images.createImage(`
        . . . . .
        . . . . .
        # # # # #
        . . . . .
        . . . . .
        `)
    ]
    // Their translations, by index
    let msgs = ['A', 'B']
    //% block
    export function startUp() {
        //serial.writeString("Ready")
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
        sendtopi(msg);
        basic.pause(1000);
        let result = serial.readUntil("}")
        return parseInt(result)
    }

    //% block="transmit|message %msg"
    export function transmit(msg: string): string {
        if (msg == 'TEST') {
            return "TEST"
        } else {
            sendtopi(msg)
        }
        return ""
    }
    //% block="lean"
    export function lean(): string {
        let y = input.rotation(Rotation.Pitch);
        let x = input.rotation(Rotation.Roll);
        let lean = "";
        if (y >= 25) {
            lean = "D";
        } else if (y <= -25) {
            lean = "U";
        }
        if (x >= 25) {
            lean = "R";
        } else if (x <= -25) {
            lean = "L";
        }

        return lean;
    }

    //%block
    export function select(x: number, y: number) {
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
        if (notselected(x,y) == true){
            led.unplot(x, y);
        }
        if (x > 0) {
            x += -1;
        }
        led.plot(x, y);
    }

    function notselected(x: number, y: number): boolean{
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
            x += -1;
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

    serial.onDataReceived("$", function () {
        let msg: string = serial.readUntil("$");
        if (msg.length > 0) {
            picommand(msg);
        }
    })

    /*function getpimessages() {
        let msg: string = serial.readLine();
        if (msg.length > 0) {
            picommand(msg);
        }
    }*/



}
