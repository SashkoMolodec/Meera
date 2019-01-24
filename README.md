# Meera
[MagicMirror²](https://magicmirror.builders/) Build with integrated Google Assistant and package of useful modules.

## Required Components
* [Raspberry Pi](https://www.raspberrypi.org/) 2 or above with pre-installed [Raspbian OS](https://www.raspberrypi.org/downloads/)
* Monitor with HDMI ouput (or via VGA to HDMI adapter)
* USB keyboard with mouse
* Microphone and speakers with USB output (or via USB Sound Card, for [example](https://www.amazon.com/Channel-External-Sound-Adapter-Laptop/dp/B01LQENV8G))

So basically you need to complete all the next steps, and you will be good!

### 1. MagicMirror²
First, we need to install basic version of a [MagicMirror²](https://github.com/MichMich/MagicMirror) (automatic or manual installation).
In this manual, we will set it up automatically. Go into your terminal and excecute the following command on your Raspberry Pi:
```
bash -c "$(curl -sL https://raw.githubusercontent.com/MichMich/MagicMirror/master/installers/raspberry.sh)"
```

Then, we'll need to install Electron & Node JS to make everything work fine. You need to run this commands in your terminal one by one:
```
cd /tmp
wget https://nodejs.org/dist/v8.2.1/node-v8.2.1-linux-armv7l.tar.xz
tar xfv node-v8.2.1-linux-armv7l.tar.xz
cd node-v8.2.1-linux-armv7l
sudo cp -R * /usr/local/
sudo npm install -g electron --unsafe-perm=true --allow-root
```
Now, let's try to run our MagicMirror. Open terminal and run these comands:
```
cd MagicMirror
DISPLAY=:0 npm start
```
You can rotate the screen, if you want to:
```
sudo nano /boot/config.txt
```
Add one of these to the bottom:
```
display_rotate=0 // Normal
display_rotate=1 // 90 degrees
display_rotate=2 // 180 degrees
```
Then enter CTRL+X, press Y and Enter. And then reboot your system to see the changes.

If you have some problems with installing or running it, find your issue [here](https://github.com/MichMich/MagicMirror/issues).

### 2. Modules
Now, we'll install our modules and dependencies: 
* (1) Open your file explorer and go to the MagicMirror folder
* (2) Delete modules folder
* (3) Open terminal, go to the MagicMirror folder and git clone this repo.
```
cd MagicMirror
git clone https://github.com/SashkoMolodec/Meera.git
```
After it, we'll need to install some dependencies for our modules (be very patient and carefully, even one missed command will make you do everything again from the start):
```
cd modules/MMM-Trello
npm install
cd ..
cd MMM-GoogleMapsTraffic
npm install
cd ..
cd MMM-soccer
npm i --production
cd ..
cd MMM-NowPlayingOnSpotify
npm install
cd .. 
cd internet-monitor
npm install
cd ..
cd email
npm install
cd ..
cd MMM-Screencast
npm install
cd ..
cd MMM-voice/installers
bash dependencies.sh
cd /
LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib
sudo ldconfig
```
Good job! Now, we'll configure them.

### 2. Configuring Modules
We have come to the most interesting part of the installation. This part is the most difficult and time-spending. Just get your strength and patience, and let's begin!
First, we need to open our config file and get acquainted with it. Open your file explorer, go to **MagicMirror/config/** and open **config.js**.
#### 2.1. [Remote Control](https://github.com/Jopyth/MMM-Remote-Control)
This module allows you to control Meera with smartphone, or any device with installed browser. First, you should find out the IP-address of the device from which you will control the mirror and add it to your **ipWhitelist** array (**18 line**):
```
var config = {
	address: "0.0.0.0", // Address to listen on, can be:
	                      // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	                      // - another specific IPv4/6 to listen on a specific interface
	                      // - "", "0.0.0.0", "::" to listen on any interface
	                      // Default, when address config is left out, is "localhost"
	port: 8080,
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.0.1/120", "192.168.0.1/24"], // Add your IP-address here 
                                                         // Set [] to allow all IP addresses
	                                                       // or add a specific IPv4 of 192.168.1.5 :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	                                                       // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],
```
Then, access the remote interface on http://192.168.xxx.xxx:8080/remote.html (replace with IP address of your RaspberryPi).
[Here](https://github.com/Jopyth/MMM-Remote-Control#call-methods-from-other-modules) is the manual how to call methods from other modules.
#### 2.2 [MMM-pages](https://github.com/edward-shen/MMM-pages)
This module allows you to have pages in Meera. All installed modules are on certain pages, so here we can replace them (**32-36 line**):
```
{
        module: 'MMM-pages',
        config: {
                modules:
                    [["MMM-cryptocurrency",'email','internet-monitor','MMM-LICE','MMM-soccer',"MMM-NowPlayingOnSpotify"], // First page
                     [ "calendar", "compliments","clock","currentweather","weatherforecast","newsfeed"],                  // Second page
					 ["calendar_monthly",'MMM-Trello','MMM-Events','MMM-GoogleFit','MMM-LocalTransport','MMM-GoogleMapsTraffic']],  // Third page
                excludes: ["updatenotification","alert","MMM-voice", "MMM-Remote-Control", "MMM-page-indicator","MMM-Screencast"], 
        	}
    		},
```
You can read more about using this module and configuration [here](https://github.com/edward-shen/MMM-pages#using-the-module).
#### 2.3 [MMM-pages]










