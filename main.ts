/**
 */
// % color=#333300 weight=100 icon="\uf21b"
// block="SEEK"

const enum SEEKType{
        TEST = 0,
        GMETER =1,
        ECTOSCOPE = 2,
        SPIRIT_SIGN = 3,
        TELEGRAPH = 4,
        TRANSMITTER = 5,
        BOOSTER = 6,
        
    }

    const enum UWBType{
        ANCHOR = 0,
        COORDINATE,
    }

namespace digitalghosthunt {

    /**
    Device images
    This is a bit weird but done this way to conserve memory
    and only instatiate images we need for this device
    */

    export function loadEctoscopeImages() : Image[]{
        return [
        images.createImage(`
                            . . . . .
                            . . . . .
                            . . . . .
                            . . . . .
                            . . # . .
                            `),
        images.createImage(`
                            . . . . .
                            . . . . .
                            . . . . .
                            . . # . .
                            . . # . .
                            `),
        images.createImage(`
                            . . . . .
                            . . . . .
                            . # # # .
                            . . # . .
                            . . # . .
                            `),
        images.createImage(`
                            . . . . .
                            # # # # #
                            . # # # .
                            . . # . .
                            . . # . .
                            `),
        images.createImage(`
                            # # # # #
                            # # # # #
                            . # # # .
                            . . # . .
                            . . # . .
                            `)


       ]
    }

    export function loadTelegraphImages() : Image[]{
         return [ 
         images.createImage( 
           `. . # . .
            . . # . .
            . . # . .
            . . # . .
            . . # . .
            `),
            images.createImage(`
            # . # . #
            . # # # .
            # . # . #
            . . # . .
            . . # . .
            `)
       ]
   }

   export let signs:Image[] = null;

   export function loadSpiritSigns() {
       return [
           images.createImage(`
            # . . . #
            . . . # #
            . . . . .
            . . . . .
            # . . . #
            `),
            images.createImage(`
            # . . . #
            . . . . .
            . . . . .
            . . # . .
            # # # # #
            `),
            images.createImage(`
            # . . . #
            . . . . .
            # . . . #
            # . . . #
            # . . . #
            `),
            images.createImage(`
            # . . . #
            . . . . .
            . . # . .
            . . . . .
            # . . . # 
            `),
            images.createImage(`
            # # . . .
            # . . . .
            . . . . .
            . . . . #
            . . . # #
            `),
            images.createImage(`
            # . . . #
            . . . . .
            . . . . .
            . . . . .
            # . . . #
            `),
            images.createImage(`
            # # . # #
            # . . . .
            . . . . .
            . . . . .
            # . . . #
            `),
            images.createImage(`
            . . . . .
            . . . . .
            # # . # #
            . . . . .
            . . . . .
            `),
            images.createImage(`
            # . . . #
            . . # . .
            . . # . .
            . . # . .
            # . . . #        
            `),
            images.createImage(`
            # . . . #
            # . . . #
            # # # # #
            . . . . .
            . . . . .
            `)
        ];
        
   }

   
   
    // Last anchor reading
        // When the board loses sight of an anchor it returns the last known
        // we need to filter for these readings
    let lastDistance:number=0;

   

    /* ************************************************
        Story classes
    */

    /** A point of spooky interaction
    This could be a source of ghostly waves
    or part of an ectoscope
    Can be a point or a circle
    */
    export class SpookyPoint{
        //ID of point, 
        id:number;
        // if anchor
        addr:number;
        // Coordinates if AR point
        x:number;
        y:number;
        z:number;
        trail_id:number; //If point is part of a trail

        radius:number; // 0 if point
        // An anchor or a software point in AR space
        type:number;
        // Which device can detect this point
        device:number;

        

        // Optional variables to make these active in particular scenes
        // or acts
        act:number;
        scene:number;

        constructor(id:number,addr:number,x:number,y:number,z:number,radius:number,type:number,trail_id:number,device:number) {
            this.id = id;
            this.addr = addr;
            this.x = x;
            this.y = y;
            this.z = z;
            this.radius = radius;
            this.type = type;
            this.device = device;
            this.trail_id = trail_id;
            this.act = -1;
            this.scene = -1;
        }

    }

    export class VisiblePoint{
        point:SpookyPoint;
        distance:number;

        constructor(point:SpookyPoint,distance:number){
            this.point = point;
            this.distance = distance;
        }
    }

    /** A single contiguous ecto trail 
    NOTE: Must be constructed node by node
    e.g A-B-C to define shape
    */
    export class EctoTrail {

        //ID of trail
        id:number;
        
        //The width of the ectoplasmic line we're drawing
        // uniform on the whole trail for sanity
        width:number;
        points: SpookyPoint[];
        
        constructor(id:number, points: SpookyPoint[],width:number) {
            this.id=id;
            this.points = points;
            this.width = width;
        }

    }

    /** One UWB-rigged 'room' in a story, really a single UWB network
    This will contain all UWB interaction points
    Each room is identified by the id of the initator anchor
    */
    export class Room {
        // This is the id of the initiator
        public id:number;        
        public points: SpookyPoint[];
        // Numeric ids of anchors in room for identification
        public anchorIDs: Number[];

        constructor(id:number,points: SpookyPoint[],anchorIDs: Number[]){
            this.id = id;
            this.points = points;
            this.anchorIDs = anchorIDs;
        }

    }

    /** Get a room by its anchor id
        Used for finding current room device is in
        */
    function roomById(id:number, rooms:Room[]):Room{
            for (let x:number = 0;x<rooms.length;x++){
                if (id == rooms[x].id){
                    return rooms[x];
                }
            }
            return null;
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

    export const enum RadioMessages {
        STORY = 0,
        GHOST = 1,
        ECTO = 2,
        BOOSTER = 3,
    }

    export const RadioSeparator:string = "::";
    const SEEKGroup:number = 99;

    /* SEEK presets and variable, by device */

    //GMeter and Ectoscope
    let gmeterRange = 5000; //in mm
    let ectoScopeRange = 1000; //in mm
    let scan_result = 0;

    //telegraph
    const alphabet: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    const morse: string[] =    [".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--..", ".----", "..---", "...--", "....-", ".....", "-....", "--...", "---..", "----.", "-----"];
    
    /*
     Toggle test version so students can use it without UWB and for testing
     0 = normal mode
     1 = simulation ready testing 
     2 = functional testing (for testing stories)
     */
    export let test_mode:number = 0;
    let sep: string = ";;";
    // Their translations, by index
    export let msgs = ['A', 'M', 'UNDER', 'OVER', 'THIEF', 'YES', 'NO', 'WAIT', 'DANGER', 'THANK YOU']
    
    // Sprit sign
    export let selected:Image = null;
    let x: number = 2;
    let y: number = 2;
    // Spirit signs
    
    
    

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
    function proximity(rooms:Room[],deviceType:number): number {        
   
      let visiblePoints:VisiblePoint[]= scan(currentPos_x(),currentPos_y(), deviceType, rooms);        
      if (visiblePoints != null && visiblePoints.length > 0){

                    if (visiblePoints[0].distance <= gmeterRange && lastDistance != visiblePoints[0].distance){
                       lastDistance = visiblePoints[0].distance;
                       return (gmeterRange-visiblePoints[0].distance)/gmeterRange;
                    }
        }
        return 0;
    }

    export function booster(rooms:Room[]): number {  
        return Math.round(proximity(rooms,SEEKType.BOOSTER)*25);      
    }

    /** 

    G Meter
    v2.0 now uses UWB functions below
    if nearest point is in range, 
                    //    return as a number 0-10 as a percentage of device range
    */
    //% block
    export function gMeter(rooms:Room[]): number {  
        return proximity(rooms,SEEKType.GMETER);
    }
     


    // Adapted from: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    function sqr(x:number) { return x * x }    
    function dist2(vx:number,vy:number, wx:number,wy:number) { return sqr(vx - wx) + sqr(vy - wy) }
    function distToSegmentSquared(p_x:number,p_y:number, v:SpookyPoint, w:SpookyPoint) {
      let l2 = dist2(v.x,v.y,w.x,w.y);
      if (l2 == 0) return dist2(p_x,p_y,v.x,v.y);
      let t = ((p_x - v.x) * (w.x - v.x) + (p_y - v.y) * (w.y - v.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      return dist2(p_x,p_y,(v.x + t * (w.x - v.x)),(v.y + t * (w.y - v.y)) );
    }
    export function distToSegment(p_x:number,p_y:number, v:SpookyPoint, w:SpookyPoint) { return Math.sqrt(distToSegmentSquared(p_x,p_y, v, w)); }

    /**

    Ectoscope
    Take visible points and find the nearest trail, and its distance
    v2.0 now uses UWB functions below

    */
   
    //% block
    export function ectoScan(rooms:Room[],trails:EctoTrail[]): number {
        let x:number = 0;
        let visiblePoints:VisiblePoint[]= scan(currentPos_x(),currentPos_y(), SEEKType.ECTOSCOPE, rooms);

        if (visiblePoints != null && visiblePoints.length > 0){
            // Get the trail the nearest point belongs to

            if (visiblePoints[0].point.trail_id >0){                
                let trail:EctoTrail = null;
                if (trails != null && trails.length > 0){                    
                    for (x=0;x<trails.length;x++){
                        if (trails[x].id == visiblePoints[0].point.trail_id){
                            trail = trails[x];                            
                            
                            break;
                        }
                    }
                }
                if (trail !=null){
                    //Test the part of the trail next to and behind
                    // the node to find the shortest distance
                    let distances:number[] = [visiblePoints[0].distance];
                    let d:number = 0;
                    for (x=0;x<trail.points.length;x++){
                        if (trail.points[x].id == visiblePoints[0].point.id){
                            // In front
                            if (x+1<trail.points.length){
                                d = distToSegment(currentPos_x(),currentPos_y(),trail.points[x],trail.points[x+1])                                
                                distances.push(d);                                
                            }
                            // Behind    
                            if (x-1>=0){
                                d = distToSegment(currentPos_x(),currentPos_y(),trail.points[x],trail.points[x-1])                                
                                distances.push(d);
                            }
                            
                        }

                    }

                    if (distances !=null && distances.length >0){                        
                        distances = distances.sort((n1,n2) => n1 - n2);
                       /* for (let o:number=0;o<distances.length;o++){
                        basic.showNumber(Math.round(distances[o]));
                        basic.pause(100);
                    }*/
                        let result = Math.round((ectoScopeRange-(distances[0]-trail.width))/ectoScopeRange*25);
                        
                        
                        if (result<=0){
                            return 0;
                        } else{
                            return result;
                        }                        
                        
                        
                    }
                }
            }
        }
        
        return 0;
    }

    /** Find spooky objects nearby.
    A scan is done in the following steps:
    1. Get all visible anchors
    2. find what Room we're in using anchor ids    
    3. Find all visible points (filtered by device type) in that room, sorted by distance
    4. return visible points
    TODO: Refactor to make more general

    
    @param device - which SEEK Device type is scanning
    @param rooms - rooms in the story where we might be scanning
    @return distance to nearest object
    */
    function scan(pos_x:number, pos_y:number, device:number, rooms:Room[]): VisiblePoint[] {
        let result = 0;
        let x =0;
        let visiblePoints:VisiblePoint[] = null;
        if (test_mode == 1) {
            // Return a random number so they can test
            result = Math.randomRange(0, 10);
        } else {
            // 1. Get all visible anchors            
            let visibleAnchors:Anchor[] = getAnchors();            
            // 2. find what Room we're in using anchor ids
            if (visibleAnchors!=null && visibleAnchors.length >0 && rooms !=null && rooms.length >0){                
                let room = null;
                for (let v:number = 0;v<visibleAnchors.length;v++){
                    
                    for (x = 0;x<rooms.length;x++){

                        for (let p:number = 0;p<rooms[x].anchorIDs.length;p++){                                
                                if (rooms[x].anchorIDs[p] == visibleAnchors[v].addr){
                                    room = rooms[x];                                                                       
                                    break;
                                }
                        }
                    }
                }
                
                if (room !=null){
                     
                    // 3. Find all visible points (filtered by device type) in that room
                    let d:number = 0;
                    let vp:VisiblePoint = null;
                    for (x = 0;x<room.points.length;x++){                        
                        if (room.points[x].device == device){                            
                            if (room.points[x].type == UWBType.ANCHOR){
                              // Get the anchor's distance, if it's visible
                              for (let a:number =0; a< visibleAnchors.length;a++){
                                  if (room.points[x].addr == visibleAnchors[a].addr){
                                      d = visibleAnchors[a].distance;
                                  }
                              }
                            } else{
                                
                                //distToSegment(p_x:number,p_y:number, v:SpookyPoint, w:SpookyPoint) { return Math.sqrt(distToSegmentSquared(p_x,p_y, v, w)); }
                                //distToSegment(p_x:number,p_y:number, v:SpookyPoint, w:SpookyPoint
                                d = Math.round(distance(pos_x, pos_y, room.points[x].x, room.points[x].y));                      

                            }     
                            //TODO find the rogue zero                         
                            if (d>0){
                               // Subtract the radius
                                   if (room.points[x].radius > 0){
                                       d -= room.points[x].radius;
                                       if (d<0){
                                           //Minimum zero
                                           d=0;
                                       }
                                   }
                                   
                                   vp = new VisiblePoint(room.points[x],d) 
                                   if (visiblePoints == null){
                                       visiblePoints = [vp]
                                   }
                                   visiblePoints.push(vp);                                   
                                
                            }
                        }                          
                        
                    }
                }
            }
            
        }
        if (visiblePoints !=null){
        visiblePoints = visiblePoints.sort(
            function (a, b) {
                  return a.distance - b.distance;
            });
        }
        return visiblePoints;
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
    //% block="getLean"
    export function getLean(): string {
        let z:number = input.rotation(Rotation.Pitch);        
        let a:number = input.rotation(Rotation.Roll);
        let lean:string = "";
        
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
        selected.setPixel(x, y, true);
    }
    //%block="Move Up"
    export function moveup(selected:Image) {
        if (selected.pixel(x,y) == false){
            led.unplot(x, y);
        }
        if (y > 0) {
            y += -1;
        }
        led.plot(x,y);

    }
    //%block="Move Down"
    export function moveDown(selected:Image) {
        if (selected.pixel(x,y) == false){
            led.unplot(x, y);
        }
        if (y < 4) {
            y += 1;
        }
        led.plot(x,y);
    }

    //%block="Move Left"
    export function moveLeft(selected:Image) {
        if (selected.pixel(x,y) == false){
            led.unplot(x, y);
        }
        if (x > 0) {
            x += -1;
        }
        led.plot(x,y);
    }

    

    //%block="Move Right"
    export function moveRight(selected:Image) {
        if (selected.pixel(x,y) == false){
            led.unplot(x, y);
        }
        if (x < 4) {
            x += 1;
        }
        led.plot(x,y);
    }



    //% block="decode|sign %sign"
    export function decode(selected:Image, signs:Image[]): string {
        //Serialise the screen image into a string
        //let screen: Image = led.screenshot();

        let msg: string = "?"
        let matches: boolean = true
        for (let t = 0; t < signs.length; t++) {
            matches = true;
            for (let b = 0; b < 5; b++) {
                for (let c = 0; c < 5; c++) {
                    if (selected.pixel(b,c)){
                        if (!signs[t].pixel(b, c)) {
                            matches = false;
                        }
                    } else if (!selected.pixel(b,c)) {
                        if (signs[t].pixel(b, c)) {
                            matches = false;
                        }
                    }
                    /*if (led.point(b, c)) {
                        if (!signs[t].pixel(b, c)) {
                            matches = false;
                        }
                    } else if (!led.point(b, c)) {
                        if (signs[t].pixel(b, c)) {
                            matches = false;
                        }
                    }*/

                }
            }
            if (matches) {
                msg = msgs[t]
                break;
            }
        }
        selected = images.createImage(`
                            . . . . .
                            . . . . .
                            . . . . .
                            . . . . .
                            . . . . .
                            `);
        x = 2;
        y = 2;
        return msg;
    }

/* ****************************************************************

    UWB functions

    */

    //% shim=digitalghosthunt::getCurrentNumAnchors
    export function getCurrentNumAnchors(): number {
        return 0;
    }

    //% shim=digitalghosthunt::currentAnchorIDAt
    function currentAnchorIDAt(index:number):number{
        return 0;
        
    }

    //% shim=digitalghosthunt::currentAnchorDistanceAt
    function currentAnchorDistanceAt(index:number):number{
        return 0;        
    }

    //% shim=digitalghosthunt::AnchorDistanceByAddr
    function AnchorDistanceByAddr(addr:number){
        return -1;
    }
    
    //% shim=digitalghosthunt::currentLoc
    export function currentLoc():number {
        return 0;
    }

    //% shim=digitalghosthunt::currentPos_x
    export function currentPos_x(){
        return 0;
    }

    //% shim=digitalghosthunt::currentPos_y
    export function currentPos_y(){
        return 0;
    }

    //% shim=digitalghosthunt::currentPos_z
    export function currentPos_z(){
        return 0;
    }

    //% shim=digitalghosthunt::distance
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
            return anchors[0];
        } else{
            return new Anchor(0,0);    
        }
        
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
        // Sort by distance
        if (anchors.length > 0){
            anchors.sort(function (a, b) {
                  return a.distance - b.distance;
            });                        
        }
        return anchors;
    }






     

    

/* ***************************************

Pi functions (Deprecated)
Kept for backwards compatibility with Mk 1 SEEK

*/
/*
    function sendtopi(code: string) {
        serial.writeLine(code);
    }

    
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


    */

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
