/**
 */
// % color=#333300 weight=100 icon="\uf21b"
// block="SEEK"

const enum SEEKType{
        TEST = 0,
        GMETER =1,
        ECTOSCOPE = 2,
        SPIRIT_SIGN = 3,
        TELEGRAPH = 4
    }

    const enum UWBType{
        ANCHOR = 0,
        COORDINATE,
    }

namespace ghosthunter {

    


    /** A point of spooky interaction
    This could be a source of ghostly waves
    or part of an ectoscope
    Can be a point or a circle
    */
    class SpookyPoint{
        //ID of point
        id:number;
        // Coordinates if AR point
        x:number;
        y:number;
        z:number;
        trail_id:number; //If point is part of a trail

        radius:number; // 0 if point
        // An anchor or a software point in AR space
        type:UWBType;
        // Which device can detect this point
        device:SEEKType;

        constructor(id:number,x:number,y:number,z:number,radius:number,type:UWBType,device:SEEKType) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.z = z;
            this.radius = radius;
            this.type = type;
            this.device = device;
        }

    }

    class VisiblePoint{
        point:SpookyPoint;
        distance:number;

        constructor(point:SpookyPoint,distance:number){
            this.point = point;
            this.distance = distance;
        }
    }

    /** A single contiguous ecto trail 

    class EctoTrail {

        //ID of trail
        id:number;
        
        points: SpookyPoint[];
        
        constructor(points: SpookyPoint[]) {
            this.points = points;
        }

    }*/

    /** One UWB-rigged room in a story
    This will contain all UWB interaction points
    Each room is identified by the id of the initator anchor
    */
    class Room {
        // This is the id of the initiator
        id:number;        
        points: SpookyPoint[];

        constructor(id:number,points: SpookyPoint[]){
            this.id = id;
            this.points = points;
        }

        /** Find the nearest spooky thing detectable by this device
        Could be an anchor or AR Coordinate
        @param device - type of SEEK device so we can filter points
        @return the nearest detectable point
        */

        nearestPoint(device:SEEKType):SpookyPoint {
            let visiblePoints:VisiblePoint[];
            let d:number=-1;
            for (let x:number = 0;x<this.points.length;x++){
                if (device == this.points[x].device){
                    if (this.points[x].type == UWBType.ANCHOR){
                      // Get the anchor's distance, if it's visible
                      d = AnchorDistanceByAddr(this.points[x].id);                      
                    }else{
                      d = distance(x, y, this.points[x].x, this.points[x].y);                      
                    }
                    if (d>=0){
                           // Subtract the radius
                           if (this.points[x].radius > 0){
                               d -= this.points[x].radius;
                               if (d<0){
                                   //Minimum zero
                                   d=0;
                               }
                           }
                          visiblePoints.push(new VisiblePoint(this.points[x],d));
                      }
            
                }
            }
            
            // Find the nearest AR point to our position
            // Return whichever is nearest

            //If nothing, return null
            return null;
        }

    }

    /**
    This is a container class for a show
    It contains all the discoverable points
    for a SEEK, as well as spirit signs
    */
    class Story  {

        
        constructor() {
            
        }
    }


 

    class Anchor {
        addr:number;
        distance:number;

        constructor(addr:number,distance:number) {
            this.addr=addr;
            this.distance=distance;
        }
    }

    /*

    Device configuration settings
    */

    /* Radio settings, TBD */

    const enum RadioMessages {
        STORY = "S",
        GHOST = "G",
    }

    const RadioSeparator:string = "::";
    const SEEKGroup:number = 99;


    
    /* SEEK presets and variable, by device */

    //GMeter and Ectoscope
    let gmeterRange = 5000; //in mm
    let ectoScopeRange = 1500; //in mm
    let scan_result = 0;

    //telegraph
    const alphabet: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    const morse: string[] = [".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--..", ".----", "..---", "...--", "....-", ".....", "-....", "--...", "---..", "----.", "-----"];
    
    // Toggle test version so students can use it
    export let test_mode = false;
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

    /** 
    The Main SEEK startup function
    This function:
        - Connects to UWB by changing pins to 0,1
        - Setup the radio group and event
    */
     //% block
    export function startUp() {
        // Set UART pins to 0,1 for DWM
        connectUWB();
        setupRadio();
    }

    /** Setup the radio events and channels
    */
    function setupRadio(){        
        radio.setGroup(SEEKGroup);
        radio.onReceivedString(function (receivedString: string) {
            if (receivedString.length > 0){
                let message:string[] = receivedString.split(RadioSeparator);
                if (message.length > 1){
                    /*if (message[0].indexOf(RadioMessages.GHOST)>=0) {                        
                            // Used in the finale when the ghost 'speaks' through detectors
                            basic.showString(message[1]);                
                     }*/                      
                    
                }
                
            }    
        });
    }

    /**
    Tell the Micro:bit something has changed in the story
    such as what act/scene we are in
    */
    function updateStory(message:string) {
        // 
    }



    /* ****************************************************************

    SEEK functions

    Main functions for each type of SEEK detector

    */

   
    /** 

    G Meter

    v2.0 now uses UWB functions below

    */
    //% block
    export function gMeter(): number {
        return scan(gmeterRange);
    }

    /**

    Ectoscope

    v2.0 now uses UWB functions below

    */
   
    //% block
    export function ectoScan(): number {
        return scan(ectoScopeRange);
    }

    /** Find spooky objects nearby.
    @param range - Device's range
    @return distance to nearest object
    */
    function scan(range: number): number {
        let result = 0;
        if (test_mode) {
            // Return a random number so they can test
            result = Math.randomRange(0, 10);
        } else {
            // REFACTOR
            let nearest:Anchor = nearestAnchor();
            let distance = 0;
            if (nearest != null){
                distance = nearest.distance
            }
            result = Math.round((range-distance)/range*10);
        }
        return result;
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

    //% shim=ghosthunter::AnchorDistanceByAddr
    function AnchorDistanceByAddr(addr:number){
        return -1;
    }
    
    //% shim=ghosthunter::currentLoc
    export function currentLoc():number {
        return 0;
    }

    //% shim=ghosthunter::distance
    export function distance(ax:number, ay:number, bx:number, by:number):number{
        return -1;
    }



    /**
    Nearest anchor this device can see
    Distance will be in mm 
    
    @return nearest anchor that is visible
    */    
    export function nearestAnchor(): Anchor{   
        let anchors:Anchor[] = getAnchors();
        if (anchors.length > 0){
            anchors.sort(function (a, b) {
                  return a.distance - b.distance;
            });            
            return anchors[0];
        }
        return new Anchor(0,0);        
    }
    
    /** 
    Get all anchors from hardware
    */
    function getAnchors(): Anchor[]{        
        let anchors = [];        
        let numAnchors = getCurrentNumAnchors();        
        if (numAnchors > 0){
            for (let x=0;x<numAnchors;x++){
                anchors[x] = new Anchor(currentAnchorIDAt(x),currentAnchorDistanceAt(x));
            }       
            
        }
        return anchors;
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
