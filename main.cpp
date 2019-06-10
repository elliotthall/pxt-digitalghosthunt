#include "pxt.h"
#include "pinmap.h"
#include "serial_api.h"
#include <cmath>
#include "MicroBit.h"

using namespace pxt;

namespace ghosthunter {

	/**

	UWB Error codes
	U10 - can't connect to UWB
	U11 - Got nothing back
	*/

	/*
		UART settings
	*/
	#define BUFFLEN 120
	#define SERIAL_BAUD 115200


	/* DWM bytes */
	const char UWB_RETURN_BYTE=0x40;
	const char UWB_LOC_BYTE=0x41;
	const char ANCHOR_RETURN_BYTE=0x49; //73


	//DWM code for get location (see api guide)
	const char GET_LOC[] = {0x0c,0x00};
	
	
	uint32_t pos[] = {0,0,0};

	
	
	/*uint_32_t get_pos(){
		return 0;
	}*/

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

	int distance(int ax, int ay, int bx, int by){
		int distancex = (ax - bx) * (ax - bx);
		int distancey = (ay - by) * (ay - by);
		return std::round(sqrt(distancex + distancey));

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
					return bufferIndex+3;
				} else{
					return -1;
				}
		}
		return -1;
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
			return bufferIndex;	
		}

		return -1;
		
	}

	/*
	Find and parse any nearby anchors, add them to the pointer
	*/
	int parseAnchors(int anchors[], uint8_t *RXBuffer, int bufferIndex){
		return 0;
	}



	/* Query the UWB for our current location, and nearby anchors */
	//%
	void currentLoc(){
    	uint8_t RXBuffer[BUFFLEN];
		uBit.serial.send((uint8_t *)GET_LOC, 2);
		uBit.sleep(200);		
		int waiting = -1;
		int bufferIndex = -1;
		// How much is waiting in the RX buffer?
    	waiting = uBit.serial.rxBufferedSize();
    	if (waiting > BUFFLEN){
	    	uBit.panic(10);
	    }	    
    	if (waiting > 0){    
    		ManagedString total = ManagedString(waiting);
    		uBit.display.scroll(total,100);
    		uBit.serial.read((uint8_t *)RXBuffer,waiting,ASYNC);
    		uBit.sleep(200);
    		bufferIndex = 0;
    		//Check the return byte and error code
    		bufferIndex = parseDWMReturn(RXBuffer,0);
    		if (bufferIndex > 0){    			
    			// Get the tag's location
    			bufferIndex = parseLoc(pos,RXBuffer,bufferIndex);
    			if (bufferIndex > 0){
    				int numAnchors = RXBuffer[bufferIndex+2];
    				if (numAnchors > 0 ){
    					//Read all anchor data
    				}
    				uBit.display.scroll("DONE");
    			} else{
    				uBit.display.scroll("ERROR DWMPARSELOC");
    			}
    		} else{
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
    		uBit.display.scroll("U11");
    	}
    	//int numAnchors = RXBuffer[bufferIndex+2];
    	
    	
	}

	/**
	Get nearest point (in mm)
	*/
	//%
	uint32_t nearestReading(int range){
		return 0;
	}

	

}