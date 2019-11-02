#include "pxt.h"
#include "pinmap.h"
#include "serial_api.h"
#include <cmath>
#include "MicroBit.h"

using namespace pxt;

namespace digitalghosthunt {

	/**

	UWB Error codes
	(For reserved error codes see https://microbit.org/guide/hardware/error-codes/)
	
	
	*/
	#define ERROR_NO_UWB 55 //can't connect to UWB
	#define ERROR_LOC_REPLY_EMPTY 56 //Got nothing back from GET_LOC
	// Not enough bytes in response (should be 13) for pos
	#define ERROR_LOC_NO_POS 57
	#define ERROR_LOC_NO_POS 58 // Missing Anchor byte report
	#define ERROR_LOC_BAD_Anchor 59 // Missing/malformed Anchor byte report
	#define ERROR_BUFFER_OVERRUN 60 // Response is too big for default buffer


	// Running mode, 0 is default, 1 is debug
	short mode = 0;

	void setMode(short m){
		mode=m;
	}

	/*
		UART settings
	*/
	#define BUFFLEN 120
	#define SERIAL_BAUD 115200


	/* DWM bytes and settings*/
	#define MIN_LOC_RETURN 21
	// Maxiumum number of anchors to store
	#define MAX_ANCHORS 10
	const char UWB_RETURN_BYTE=0x40;
	const char UWB_LOC_BYTE=0x41;
	const char ANCHOR_RETURN_BYTE=0x49; //73
	//DWM code for get location (see api guide)
	const char GET_LOC[] = {0x0c,0x00};

	// New Spirit sign definitions
	// For transformation commands
	#define SIGN_CLOCKWISE 0
	#define SIGN_UP 1
	#define SIGN_RIGHT 2
	#define SIGN_DOWN 3
	#define SIGN_LEFT 4
	
	
	// The tag's current x,y,z position
	uint32_t pos[] = {0,0,0};
	
	//Current visible tags
	//only including id and distance at the moment
	uint32_t anchors[MAX_ANCHORS][2] = {
		{0,0}
	};

	// Current number of visible anchors
	int currentNumAnchors = 0;

	

	
	/* From Damien P. George's micropython implementation of uart
 	https://github.com/bbcmicrobit/micropython/blob/master/source/microbit/microbituart.cpp
 	Manual pin set so we don't get the garbage 0x00 when serial is initialised
 	*/
	
	void setUartPins(PinName p_tx,PinName p_rx){
		serial_t serial;
    	serial.uart = NRF_UART0;
    	NRF_GPIO->DIR |= (1 << p_tx);
    	NRF_GPIO->DIR &= ~(1 << p_rx);
    	NRF_UART0->PSELTXD = p_tx;
    	NRF_UART0->PSELRXD = p_rx;
    	pin_mode(p_tx, PullUp);
    	pin_mode(p_rx, PullUp);
    	serial_baud(&serial, SERIAL_BAUD);
    	// void serial_format     (serial_t *obj, int data_bits, SerialParity parity, int stop_bits);
    	serial_format(&serial, 8, ParityNone, 1);
    	uBit.serial.setRxBufferSize(64);    
	}

	/*
	Connect to DWM1001-DEV over uart
	Assumes tx=P0,rx=P1
	*/

	//%
	void connectUWB(){		
    	setUartPins(MICROBIT_PIN_P0,MICROBIT_PIN_P1);
	}

	//%
	int distance(int ax, int ay, int bx, int by){
		int distancex = (ax - bx) * (ax - bx);
		int distancey = (ay - by) * (ay - by);
		return sqrt(distancex + distancey);

	}

	//uint32_t pos[] = {0,0,0};

	//%
	uint32_t currentPos_x(){
		return pos[0];
	}

	//%
	uint32_t currentPos_y(){
		return pos[1];
	}

	//%
	uint32_t currentPos_z(){
		return pos[2];
	}

	//%
	uint32_t currentAnchorIDAt(int index){
		if (index<currentNumAnchors){
			return anchors[index][0];	
		}
		
	}

	//%
	uint32_t currentAnchorDistanceAt(int index){
		if (index<currentNumAnchors){
			return anchors[index][1];	
		}
		
	}

	//%
	uint32_t AnchorDistanceByAddr(uint64_t addr){
		for (uint8_t x=0;x<currentNumAnchors;x++){
			if (anchors[x][0] == addr){
				return anchors[x][1];
			}
		}
		return -1;		
	}

	//%
	int getCurrentNumAnchors(){
		return currentNumAnchors;
	}

	/*
	Check the beginning of the response for the correct return byte
	and that the error code is 0.
	-1 bad statement
	0 all is well
	else return DWM error code
	*/	
	int parseDWMReturn(uint8_t RXBuffer[], int bufferIndex){
		if (RXBuffer[bufferIndex] == UWB_RETURN_BYTE){
				// OK we've got a correct return
				// Check the error code				
				if ( (sizeof(RXBuffer) /sizeof(RXBuffer[0])) > 2 && RXBuffer[bufferIndex+2] == (uint8_t)0){
					return bufferIndex+=3;
				} else {
					return -1;
				}
		}
		return -10;
	}

	/* Fill array pos with x,y,z coordinates from a DWM1001-DEV return RXBuffer.
	Each coordinate is 4 bytes little-endian, coming out in mm.

	(From DWM1001-API-Guide)
    Position
    13-byte position information of the node (anchor or tag).
    position = x, y, z, qf : bytes 0-12, position coordinates and quality factor
    x : bytes 0-3, 32-bit integer, in millimeters
    y : bytes 4-7, 32-bit integer, in millimeters
    z : bytes 8-11, 32-bit integer, in millimeters
    qf : bytes 12, 8-bit integer, position quality factor in percent
	*/
	int parseLoc(uint32_t pos[], uint8_t RXBuffer[], int bufferIndex){		
		// First, check the return type byte
		int rv = (int) RXBuffer[bufferIndex];		
		// printf("BUF is %d and def is %d\n", rv, UWB_LOC_BYTE);
		if (rv == UWB_LOC_BYTE){			
			bufferIndex +=2;
			pos[0] = (uint32_t) RXBuffer[bufferIndex] | (RXBuffer[bufferIndex+1] << 8) | (RXBuffer[bufferIndex+2] << 16) | (RXBuffer[bufferIndex+3] << 24);
			bufferIndex +=4;
			pos[1] = (uint32_t) RXBuffer[bufferIndex] | (RXBuffer[bufferIndex+1] << 8) | (RXBuffer[bufferIndex+2] << 16) | (RXBuffer[bufferIndex+3] << 24);
			bufferIndex +=4;
			pos[2] = (uint32_t) RXBuffer[bufferIndex] | (RXBuffer[bufferIndex+1] << 8) | (RXBuffer[bufferIndex+2] << 16) | (RXBuffer[bufferIndex+3] << 24);
			bufferIndex +=4;
			//Skip the quality factor
			bufferIndex +=1;
			return bufferIndex;	
		}

		return -1;
		
	}

	/*
	Find and parse any nearby anchors, add them to the pointer
	Using parts of dwm_loc_get from dwm_api.c
	*/
	int parseAnchors(uint8_t RXBuffer[], int bufferIndex){
		// Skip reutrn byte and length byte, goto num anchors
		bufferIndex+=2;
		currentNumAnchors = RXBuffer[bufferIndex];
		//uBit.display.scroll("ANC");
		//uBit.display.scroll(currentNumAnchors);
		uint8_t i,j; 
    	if (currentNumAnchors > 0 ){
    		//Read all anchor data
    		bufferIndex += 1; // goto data    		
    		for (i=0;i<currentNumAnchors;i++){
    			if (i < MAX_ANCHORS){    				
		    		// anchor ID
            		anchors[i][0] = 0;
            		for (j = 0; j < 2; j++)
            		{
               			anchors[i][0] += ((uint64_t)RXBuffer[bufferIndex++])<<(j*8);
            		}
            		// anchor distance
            		anchors[i][1] = 0;
            		for (j = 0; j < 4; j++)
            		{
               			anchors[i][1] += ((uint32_t)RXBuffer[bufferIndex++])<<(j*8);
            		}
		            // Skip the quality factor
		            bufferIndex +=1;
		            //Skip the anchor location for now
		            // We could add it later if useful
		            bufferIndex +=13;
		        }else{
		        	//Too many anchors, burn off the others
		        	// TODO add to log?
		        	bufferIndex+=20;

		        }
	        }
	    					
    	}		
		return bufferIndex;
	}

	
	/* Query the UWB for our current location, and nearby anchors */	
	//%
	int currentLoc(){
		if (mode == 0){
	    	uint8_t RXBuffer[BUFFLEN];			
			int waiting = -1;
			int bufferIndex = -1;		
			// How much is waiting in the RX buffer?
	    	/*waiting = uBit.serial.rxBufferedSize();
	    	if (waiting > 0){     		
	    		//Junk in the buffer, get rid of it
	    		//uBit.serial.read((uint8_t *)RXBuffer,waiting,ASYNC);
	    		uBit.display.scroll(waiting);
	    	}*/
	    	uBit.serial.send((uint8_t *)GET_LOC, 2);
			uBit.sleep(200);		
	    	waiting = uBit.serial.rxBufferedSize();
	    	if (waiting > BUFFLEN){
		    	uBit.panic(10);
		    }	    
	    	if (waiting > 0){     		
	    		uBit.serial.read((uint8_t *)RXBuffer,waiting,ASYNC);
	    		uBit.sleep(200);
	    		bufferIndex = 0;
	    		/*for (int x=0;x<waiting;x++){
	    			uBit.display.scroll(RXBuffer[x],100);
	    		}*/
	    		//Check the return byte and error code
	    		bufferIndex = parseDWMReturn(RXBuffer,bufferIndex);    		
	    		//uBit.display.scroll(bufferIndex);
	    		if (bufferIndex > 0){ // && waiting >= MIN_LOC_RETURN    			
	    			// Get the tag's location
	    			bufferIndex = parseLoc(pos,RXBuffer,bufferIndex);
	    			//uBit.display.scroll("PL");
	    			//uBit.display.scroll(bufferIndex,100);
	    			if (bufferIndex > 0){
	    				bufferIndex = parseAnchors(RXBuffer, bufferIndex);    				
	    			} else{
	    				uBit.display.scroll("ERROR DWMPARSELOC");
	    			}
	    		} else {
	    			uBit.display.scroll("ERROR DWMReturn");
	    		}
	    		
	    		/*for (int x=0;x<waiting;x++){
	    			uBit.display.scroll(RXBuffer[x],100);
	    		}*/
	    		/*
				// Check the error code
	    		int errorCode = parseDWMReturn(*RXBuffer,0);
	    		if (errorCode == 0){
	    			if (RXBuffer[3] == UWB_LOC_BYTE){
	    				// TODO figure out errors and bubble up
	    				parseLoc(*pos,*RXBuffer,5);
	    			}
	    		}*/
				
	    	} else {
	    		uBit.display.scroll("U12");
	    	}
	    	//int numAnchors = RXBuffer[bufferIndex+2];
	    	return bufferIndex;
	    } else if (mode ==1){
	    	//Set test data and return correct read
	    	pos[0] = 0;
	    	pos[1] = 0;
	    	pos[2] = 0;
	    	currentNumAnchors = 1;
	    	anchors[0][0] = 1234;
	    	anchors[0][1] = 3334;
	    	return 44;

	    }
    	
	}

	/***********
	NEW spirit sign screen/led functions
	These functions support ssign 2.0

	Notes for when I have time to finish this:

	-New sign is made of 'fragments'(images) that user rotates/moves into place
	-Always start with one fragment in a corner to provide orientation
	-User then manipulates fragments, until they match up with that step press B to check
	-Once all fragments are in place, final b does translation

	This is a nicer method of translation, less fiddly and won't cause annoying problems when
	mistakes made
	- possible p2p applications with multiple devices on multiple fragments for a big image
	but will need different master device or larger screen

	IMPORTANT NOTE:
	This means this device will now use UWB (see below) imporatnt consideration
	OR we could give them preset start points e.g. 'common' beginnings, but it might be tricky

	TODO
	- add 'scan' function to use uwb so device knows it's near an image, to begin process
	- add check function
	- rewrite decode to do direct image comparison
	- split signs into their fragments
	- load sign function should use flash memory if possible 
	(https://lancaster-university.github.io/microbit-docs/data-types/image/#storing-images-in-flash-memory)
	
	*/	

	/*
	Simple matrix rotation applied in place

	*/
	void rotateImageClockwise(MicroBitImage source){
		MicroBitImage rotated(source.getWidth(),source.getHeight());
		// So 0,0 becomes 4,4 etc.
		for (uint8_t r=0; r<source.getWidth();r++){
			for (uint8_t c=0; c<source.getHeight();c++){
				rotated.setPixelValue(source.getWidth()-r-1,source.getHeight()-c-1,source.getPixelValue(r,c));
			}
		}
		//copy new image to parameter
		source = rotated;
	}

	
	// Apply transformation to working image
	void applyTransformation(MicroBitImage image,uint8_t transformType){
		// Rotate
		if (transformType == SIGN_CLOCKWISE){
			rotateImageClockwise(image);
		}else if (transformType == SIGN_UP){		
			image.shiftUp(1);
		}else if (transformType == SIGN_RIGHT){		
			image.shiftRight(1);
		}else if (transformType == SIGN_DOWN){		
			image.shiftDown(1);
		}else if (transformType == SIGN_LEFT){		
			image.shiftLeft(1);
		}
		
 	}
	
	// merge current 'master' imageA onto working and display imageB
	// Positive merge so all 'on' leds included, brightness ignored for now
	// IMPORTANT NOTE: Uses imageA for size!
 	MicroBitImage mergeImages(MicroBitImage imageA, MicroBitImage imageB){
 		//New merged image
 		MicroBitImage mergedImage(imageA.getWidth(),imageA.getHeight());
 		for (uint8_t r=0; r<imageA.getWidth();r++){
			for (uint8_t c=0; c<imageA.getHeight();c++){
				// If led on in A OR B, turn it on to 255
				if (imageA.getPixelValue(r,c)>0 || imageB.getPixelValue(r,c)>0){
					mergedImage.setPixelValue(r,c,255);
				}
			}
		} 		
 		return mergedImage;
 	}
	
	
	


}