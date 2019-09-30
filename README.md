# The Digital Ghost Hunt
## SEEK Ghost Detector Core Library Mk 2
### Version 1.0

This library is part of [The Digital Ghost Hunt](digitalghosthunt.com) an AHRC-funded project in coding education and Immersive theatre.  If you have no idea what that is, visit our website first.  The rest will make more sense.

This repo contains the code for the SEEK Ghost Detector Mark 2, a MORPH agent's best friend.  The detector is a microcontroller[Micro:Bit](https://microbit.org/) (the primary interface) and a [Decawave DWM development board](https://www.decawave.com/product/dwm1001-development-board/) (for internal positioning during the show.)  Communication is done over UART.

The repo for mk 1 is called [Ghosthunter](https://github.com/elliotthall/ghosthunter).  That version was made to work with a Raspberry Pi and Micro:Bit, and was written in typescript and Python.

This version of the SEEK library is written in Typescript.

### Changes from Mk 1

The Raspberry Pi is no longer used in the version 2 detector.  Python has been removed, leaving two repositories:

[Seek V2](https://github.com/elliotthall/seekv2).  The application level of the seek detector, which has all the interface code and detectable things for a particular show.

[pxt-digitalghosthunt](https://github.com/elliotthall/pxt-digitalghosthunt). The core library for the SEEK, written in C with a wrapped in in Typescript.  This library handles communication with the DEM1001-DEV.


### The Future

I've got several NeoPixel strips that I plan to integrate with the application code.  Hardware permitting, I'd also like to experiment with adding servos and vibration motors.