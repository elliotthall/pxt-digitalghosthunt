/**
 * 
 */
//% color=190 weight=100 icon="\uf21b" block="Ghost Hunter"
namespace ghosthunter {

    //% block
    export function startUp() {
        //serial.writeString("Ready")
    }

    //% block
    export function gMeter(): number {
        return scan("G");  
    }

    // note that Caml casing yields lower case
    // block text with spaces

    //% block
    export function ectoScan(): number {
        return scan("E");
    }

    function scan(msg: string): number {
        sendtopi(msg);
        basic.pause(1000);
        let result = serial.readLine();
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

    //% block="decode|sign %sign"
    export function decode(sign: Image): string {
        //Serialise the screen image into a string

        return "BOO!";
    }


    function sendtopi(code: string) {
        serial.writeLine(code);
    }

    /**
     * Receive a command from the pi and parse it
     */
    function picommand(command_string: string) {
        let command: string = command_string.substr(0, command_string.indexOf("::"));
        let value: string = command_string.substr(command_string.indexOf("::"));
        switch (command) {
            case 'reset':
                control.reset()
                break;
            case 'text':
                basic.showString(value)
                break;
        }

    }

    function getpimessages() {        
        let msg: string = serial.readLine();
        if (msg.length > 0){
            picommand(msg);
        }
    }



}
