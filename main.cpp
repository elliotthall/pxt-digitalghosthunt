#include "pxt.h"
#include "pinmap.h"
#include "serial_api.h"
#include <cmath>

using namespace pxt;

namespace ghosthunter {

	/**

	UWB Error codes
	U10 - can't connect to UWB
	U11 - Got nothing back


	*/

	//DWM code for get location (see api guide)
	const char GET_LOC[] = {0x0c,0x00};
	const char UWB_RETURN_BYTE = 0x40;
	const char ANCHOR_RETURN_BYTE = 0x49;
	uint32_t pos[] = {0,0,0};

	#define BUFFLEN 120
	#define SERIAL_BAUD 9600

	
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

	int parseLoc(uint8_t *RXBuffer){		
		pos[0] = (uint32_t) RXBuffer[5] | (RXBuffer[6] << 8) | (RXBuffer[7] << 16) | (RXBuffer[8] << 24);
		pos[1] = (uint32_t) RXBuffer[9] | (RXBuffer[10] << 8) | (RXBuffer[11] << 16) | (RXBuffer[12] << 24);
		pos[2] = (uint32_t) RXBuffer[13] | (RXBuffer[14] << 8) | (RXBuffer[15] << 16) | (RXBuffer[16] << 24);
		return 0;
	}

	/*
	Find and parse any nearby anchors, add them to the pointer
	*/
	int parseAnchors(uint8_t *RXBuffer){

	}

	/* Query the UWB for our current location, and nearby anchors */
	//%
	void currentLoc(){
    	uint8_t RXBuffer[BUFFLEN];
		uBit.serial.send((uint8_t *)GET_LOC, 2);
		uBit.sleep(200);		
		int waiting = -1;
		// How much is waiting in the RX buffer?
    	waiting = uBit.serial.rxBufferedSize();
    	if (waiting > BUFFLEN){
	    	uBit.panic(10);
	    }	    
    	if (waiting > 0){
    		uBit.serial.read((uint8_t *)RXBuffer,waiting,ASYNC);
			if (RXBuffer[0] == (uint8_t)UWB_RETURN_BYTE){
				// OK we've got a correct return
				// Check the error code
				if (RXBuffer[2] == (uint8_t)0){
					// error code is 0, we're ok
	    				uBit.serial.read((uint8_t *)RXBuffer,waiting,ASYNC);
	    				uBit.display.scroll(RXBuffer[0]);
	    				uBit.display.scroll(RXBuffer[1]);
	    				uBit.display.scroll(RXBuffer[2]);
	    				uBit.display.scroll(RXBuffer[3]);
	    				uBit.display.scroll(RXBuffer[4]);
	    				uBit.display.scroll(RXBuffer[5]);

	    			}
	    			//uBit.display.scroll(waiting);
			}else{
				uBit.display.scroll("U%d",RXBuffer[2]);	
			}
			/*uBit.display.scroll(RXBuffer[0]);
    		uBit.display.scroll(RXBuffer[1]);
    		uBit.display.scroll(RXBuffer[2]);*/    		
    	} else {
    		uBit.display.scroll("U11");
    	}
    	
    	
    	
	}



}