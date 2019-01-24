# Meera
[MagicMirror²](https://magicmirror.builders/) build with integrated Google and Meera Assistant with installed package of useful modules.

## Required Components
* [Raspberry Pi](https://www.raspberrypi.org/) 2 or above with pre-installed [Raspbian OS](https://www.raspberrypi.org/downloads/)
* Monitor with HDMI ouput (or via VGA to HDMI adapter)
* USB keyboard with mouse
* Microphone and speakers with USB output (or via USB Sound Card, for [example](https://www.amazon.com/Channel-External-Sound-Adapter-Laptop/dp/B01LQENV8G))

So basically you need to complete all the next steps, and you'll be good!

### 1. Installing MagicMirror²
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
Then enter `CTRL+X`, press Y and Enter. And then reboot your system to see the changes.

If you have some problems with installing or running it, find your issue [here](https://github.com/MichMich/MagicMirror/issues).

### 2. Cloning Modules & Installing Dependencies
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

### 3. Configuring Modules
We have come to the most interesting part of the installation. This part is the most difficult and time-spending. Just get your strength and patience, and let's begin!
First, we need to open our config file and get acquainted with it. Open your file explorer, go to **MagicMirror/config/** and open **config.js**.
#### 3.1. [Remote Control](https://github.com/Jopyth/MMM-Remote-Control)
This module allows you to control Meera with smartphone, or any device with installed browser.
* First, you should find out the IP-address of the device from which you will control the mirror and add it to your `ipWhitelist` array (**18 line**):
```javascript
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
* Then, access the remote interface on http://192.168.xxx.xxx:8080/remote.html (replace with IP address of your RaspberryPi).
[Here](https://github.com/Jopyth/MMM-Remote-Control#call-methods-from-other-modules) is the manual how to **call methods from other modules**.
* If you want to travel between pages, you'll need to send notifications to Meera, such as `PAGE_INCREMENT` and `PAGE_DECREMENT`.
Here's example:
`http://192.168.xxx.xxx:8080/remote.html?action=NOTIFICATION&notification=PAGE_INCREMENT` (replace with IP address of your RaspberryPi).
#### 3.2. [Pages](https://github.com/edward-shen/MMM-pages)
This module allows you to have pages in Meera. All installed modules are on certain pages, so here we can replace them (**30 line**):
```javascript
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
You can read about using this module and configuration options [here](https://github.com/edward-shen/MMM-pages#using-the-module).
#### 3.3. [Clock](https://github.com/MichMich/MagicMirror/tree/master/modules/default/clock)
The `clock` module is one of the default modules of the MagicMirror. This module displays the current date and time. The information will be updated realtime (**47 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/clock.png" title="clock" alt="clock"></a>
```javascript
{
	module: "clock",
	position: "top_left"
},
```
#### 3.4. [Calendar](https://github.com/MichMich/MagicMirror/tree/master/modules/default/calendar)
The `calendar` module is one of the default modules of the MagicMirror. This module displays events from a public .ical calendar. It can combine multiple calendars (**51 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/holidays_calendar.png" title="calendar" alt="calendar"</a>
```javascript
{
	module: "calendar",
	header: "Holidays",
	position: "top_left",
	config: {
		calendars: [
			{
				symbol: "calendar-check",
				maximumEntries: 2,
				url: "https://www.officeholidays.com/ics/ics_country_code.php?iso=UA"
			},
			{
				symbol: "calendar-check",
				maximumEntries: 2,
				url: "http://www.calendarlabs.com/ical-calendar/ics/41/Christian_Holidays.ics"
			},
			{
				symbol: "calendar-check",
				maximumEntries: 2,
				url: "http://www.calendarlabs.com/ical-calendar/ics/56/International_Holidays.ics"
			}
			
		]
	}
},
```
You can read about using this module and configuration options [here](https://github.com/MichMich/MagicMirror/tree/master/modules/default/calendar#using-the-module).
#### 3.5. [Compliments](https://github.com/MichMich/MagicMirror/tree/master/modules/default/compliments)
The `compliments` module is one of the default modules of the MagicMirror. This module displays a random compliment (**76 line**).
```javascript
{
	module: "compliments",
	position: "lower_third"
},
```
You can read about using this module and configuration options [here](https://github.com/MichMich/MagicMirror/tree/master/modules/default/compliments#using-the-module).
#### 3.6. [Current Weather](https://github.com/MichMich/MagicMirror/tree/develop/modules/default/currentweather)
The `currentweather` module is one of the default modules of the MagicMirror. This module displays the current weather, including the windspeed, the sunset or sunrise time, the temperature and an icon to display the current conditions (**80 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/current_weather.png" title="current_weather" alt="current_weather"></a>
```javascript
{
	module: "currentweather",
	position: "top_right",	// This can be any of the regions.
								// Best results in left or right regions.
	config: {
		// See 'Configuration options' for more information.
		location: "Amsterdam,Netherlands",
		locationID: "", //Location ID from http://openweathermap.org/help/city_list.txt
		appid: "abcde12345abcde12345abcde12345ab" //openweathermap.org API key.
	}
}
```
You can read about using this module and configuration options [here](https://github.com/MichMich/MagicMirror/tree/develop/modules/default/currentweather#using-the-module).
#### 3.7. [Weather Forecast](https://github.com/MichMich/MagicMirror/tree/develop/modules/default/weatherforecast)
The `weatherforecast` module is one of the default modules of the MagicMirror. This module displays the weather forecast for the coming week, including an an icon to display the current conditions, the minimum temperature and the maximum temperature (**89 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/forecast.png" title="weather_forecast" alt="weather_forecast"></a>
```javascript
{
	module: "weatherforecast",
	position: "top_right",	// This can be any of the regions.
								// Best results in left or right regions.
	config: {
		// See 'Configuration options' for more information.
		location: "Amsterdam,Netherlands",
		locationID: "", //Location ID from http://openweathermap.org/help/city_list.txt
		appid: "abcde12345abcde12345abcde12345ab" //openweathermap.org API key.
	}
}
```
You can read about using this module and configuration options [here](https://github.com/MichMich/MagicMirror/tree/develop/modules/default/weatherforecast#using-the-module).
#### 3.8. [News Feed](https://github.com/MichMich/MagicMirror/tree/develop/modules/default/newsfeed)
The `newsfeed` module is one of the default modules of the MagicMirror. This module displays news headlines based on an RSS feed. Scrolling through news headlines happens time-based (updateInterval), but can also be controlled by sending news feed specific notifications to the module (**99 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/newsfeed.png" title="news_feed" alt="news_feed"></a>

```javascript
{
	module: "newsfeed",
	position: "bottom_bar",	// This can be any of the regions. Best results in center regions.
	config: {
		// The config property is optional.
		// If no config is set, an example calendar is shown.
		// See 'Configuration options' for more information.
		feeds: [
			{
				title: "New York Times",
				url: "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
			},
			{
				title: "BBC",
				url: "http://feeds.bbci.co.uk/news/video_and_audio/news_front_page/rss.xml?edition=uk",
			},
		]
	}
}
```
You can read about using this module and configuration options [here](https://github.com/MichMich/MagicMirror/tree/develop/modules/default/newsfeed#using-the-module).
#### 3.9. [Voice Assistant(Meera)](https://github.com/fewieden/MMM-voice)
Voice Recognition Module for MagicMirror² that works offline (**113 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/voice.png" title="voice" alt="voice"></a>
```javascript
{
    module: "MMM-voice",
    position: 'bottom_bar',
    	config: {
       		microphone: 1
		}
},
```
You can read about usage and config tools [here](https://github.com/fewieden/MMM-voice#config-options).
#### 3.10. [Monthly Calendar](https://github.com/KirAsh4/calendar_monthly/)
The `calendar_monthly` module is a simple month-view calendar (**123 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/monthly_calendar.png" title="monthly_calendar" alt="monthly_calendar"></a>
```javascript
{
	module: 'calendar_monthly',
	position: 'top_left',
},
```
You can read about using this module and configuration options [here](https://github.com/KirAsh4/calendar_monthly/#using-the-module).
#### 3.11. [Page Indicator](https://github.com/edward-shen/MMM-page-indicator)
MagicMirror² module to display what page you're on (**127 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/page_indicator.png" title="page_indicator" alt="page_indicator"></a>
```javascript
{
	module: 'MMM-page-indicator',
	position: 'bottom_bar',
	config: {
			pages: 3,
		}
},
```
You can read about using this module and configuration options [here](https://github.com/edward-shen/MMM-page-indicator#using-the-module).
#### 3.12. [Trello Checklist](https://github.com/Jopyth/MMM-Trello)
The `Trello` module displays all cards in a specific [Trello](https://trello.com/) list, in a style similar to the Newsfeed (showing one card at a time). Applications can be: displaying a TODO list, showing notes, or important information which needs to be shared between roommates (**line 134**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/trello.png" title="trello" alt="trello"></a>
```javascript
    	{
    	module: 'MMM-Trello',
    	position: 'bottom_center', // This can be any of the regions, best results in center regions.
    	config: {
    	    // See 'Configuration options' for more information.
    	    api_key: "INSERT_YOUR_API_KEY",
    	    token: "INSERT_YOUR_TOKEN",
    	    list: "INSERT_YOUR_LIST_ID"
    	}
    	},
```
You can read about using this module and configuration options [here](https://github.com/Jopyth/MMM-Trello#using-the-module).
#### 3.13. [Events in your City](https://github.com/mykle1/MMM-Events)
* Rotation of upcoming events for your city.
* Never miss a show because you didn't know about it!
* Concerts and Tour Dates, Performing Arts, Art Galleries & Exhibits, Comedy Shows, Food and Drink, Sports, and more (**148 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/events.png" title="events" alt="events"></a>
```javascript
{
    module: 'MMM-Events',
    position: 'top_left',
    config: {
	city: "New York",	           // Your City
	eventType: "sports,music_country", // One or more, seperated by commas. Choose from Events List below
	when: "This Week",                 // "All", "Future", "Past", "Today", "Last Week", "This Week", "Next week", and months by 	name, e.g. "October"
	mode: "noFrame",                   // "Frame" or "noFrame" (around picture)
	apikey: "Your FREE API Key Goes Here",
	rotateInterval: 5 * 60 * 1000,     // New Event Appears every 5 minutes
	useHeader: false,	           // Set to true if you want a header
	header: "",
	animationSpeed: 3000,              // Event fades in and out
	picture: true,                     // true, false = no image
    }
},
```
You can read about using this module and configuration options [here](https://github.com/mykle1/MMM-Events#configjs-entry-and-options).
#### 3.14. [Google Fit](https://github.com/amcolash/MMM-GoogleFit)
A module to grab google fit daily step count and daily weights (**165 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/google_fit.png" title="google_fit" alt="google_fit"></a>
```javascript
{
    module: 'MMM-GoogleFit',
    position: 'position',
    config: {
        // If desired
    }
},
```
You can read about using this module and configuration options [here](https://github.com/amcolash/MMM-GoogleFit#configuration-options).
#### 3.15. [Soccer](https://github.com/fewieden/MMM-soccer)
European Soccer Standings Module for MagicMirror² (**172 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/Football.png" title="soccer" alt="soccer"></a>
```javascript
{
	module: 'MMM-soccer',
	position: 'top_right',
	config: {
		api_key: "",
		colored: true,
		show: 'ENGLAND',
		focus_on: false,
		leagues: {"GERMANY": "BL1", "FRANCE": "FL1", "ENGLAND": "PL", "SPAIN": "PD", "ITALY": "SA",
		"UKRAINE": "UPL", "WORLD":"WC"},
		logos: true
			}
},
```
You can read about using this module and configuration options [here](https://github.com/fewieden/MMM-soccer#config-options).
#### 3.16. [Cryptocurrency](https://github.com/matteodanelli/MMM-cryptocurrency)
A MagicMirror module used to get real-time values of crypto currencies (**185 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/Crypta.png" title="cryptocurrency" alt="cryptocurrency"></a>
```javascript
{
	module: "MMM-cryptocurrency",
	position: "top_right",
	config: {
		currency: ['ethereum', 'bitcoin'],
		conversion: 'EUR',
		showUSD: false,
		headers: ['change24h', 'change1h', 'change7d'],
		displayType: 'logoWithChanges',
		showGraphs: true
	}
}
```
You can read about using this module and configuration options [here](https://github.com/matteodanelli/MMM-cryptocurrency#config).
#### 3.17. [Currency Exchange](https://github.com/mykle1/MMM-LICE)
Real-time exchange rate for 168 World Currencies & PRECIOUS METALS (**line 197**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/LICE.png" title="lice" alt="lice"></a>
```javascript
{
    module: 'MMM-LICE',
    position: 'top_left',                 // Best in left, center, or right regions
    config: { 
		accessKey: "Your API Access Key", // Free account & API Access Key at currencylayer.com
		source: "USD",                    // USD unless you upgrade from free account
		symbols: "AUD,CHF,EUR,GBP",       // Currency symbols
		useHeader: false,                 
		header: "Show me the money",
		maxWidth: "300px",
    }
},
```
You can read about using this module and configuration options [here](https://github.com/mykle1/MMM-LICE#configjs-entry-and-options).
#### 3.18. [Internet Speed Monitor](https://github.com/ronny3050/internet-monitor)
Monitors internet statistics such as strength and speed information on a smart mirror (**line 209**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/inet_speed.png" title="inet_speed" alt="inet_speed"></a>
```javascript
{
	module: 'internet-monitor',
		position: 'bottom_center',
		header: 'Internet Monitor',
		config:{
			type: 'minimal',
			maxTime: 20000,
			updateInterval: 0,
			verbose: false,
			displayStrength: true,
			displaySpeed: true,
			strengthIconSize: 80,
			maxGaugeScale: 100,
		wifiSymbol:{
			size: 50,
			fullColor: '#3afc25',
			almostColor: '#ffff0c',
			halfColor: '#ff8c00',
			noneColor: '#ff1111'
				}
				}
},
```
You can read about using this module and configuration options [here](https://github.com/ronny3050/internet-monitor#using-the-module).
#### 3.19. [NowPlayingOnSpotify](https://github.com/raywo/MMM-NowPlayingOnSpotify)
A module for the MagicMirror project by Michael Teeuw displaying the song currently playing on Spotify (**231 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/spotify.png" title="spotify" alt="spotify"></a>
```javascript
{
    module: "MMM-NowPlayingOnSpotify",
    position: "top_right",

    config: {
        showCoverArt: false,
        clientID: "<YOUR_CLIENT_ID>",
        clientSecret: "<YOUR_CLIENT_SECRET>",
        accessToken: "<YOUR_ACCESS_TOKEN>",
        refreshToken: "<YOUR_REFRESH_TOKEN>"
    }
}
```
You can read about using this module and configuration options [here](https://github.com/raywo/MMM-NowPlayingOnSpotify#step-2--create-and-authorise-a-spotify-app).
#### 3.20. [GoogleMaps Traffic](https://github.com/vicmora/MMM-GoogleMapsTraffic)
A module for the MagicMirror² that displays a map, centered at provided coordinates, with Google Maps Traffic information (**243 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/traffic_map.png" title="traffic" alt="traffic"></a>
```javascript
{
            module: 'MMM-GoogleMapsTraffic',
            position: 'top_left',
            config: {
                key: 'YOUR_KEY',
                lat: 37.8262306,
                lng: -122.2920096,
                height: '300px',
                width: '300px'
                styledMapType: "transparent",
                disableDefaultUI: true,
                backgroundColor: 'hsla(0, 0%, 0%, 0)',
                markers: [
                    {
                        lat: 37.8262316,
                        lng: -122.2920196,
                        fillColor: '#9966ff'
                    },
                ],
            },
        }
```
You can read about using this module and configuration options [here](https://github.com/vicmora/MMM-GoogleMapsTraffic#using-the-module).
#### 3.21. [Local Transport](https://github.com/CFenner/MMM-LocalTransport) 
This module display the next local transport connection between an origin and destination (**264 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/local_transport.png" title="local_transport" alt="local_transport"></a>
```javascript
{
  module: 'MMM-LocalTransport',
  position: 'ANY_POSITION',
  config: {
    api_key: 'YOUR_API KEY',
    origin: 'YOUR_ORIGIN',
    destination: 'YOUR_DESTINATION'
  }
},
```
You can read about using this module and configuration options [here](https://github.com/CFenner/MMM-LocalTransport#configuration).
#### 3.22. [Screencast](https://github.com/kevinatown/MMM-Screencast)
A module to cast to the MagicMirror². Currently, only YouTube casting is supported (**279 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/screencast.png" title="screencast" alt="screencast"></a>
```javascript
{
	module: 'MMM-Screencast',
	position: 'bottom_right', // This position is for a hidden <div /> and not the screencast window
	config: {
		position: 'bottomRight',
		height: 300,
		width: 500,
	}
 },
```
You can read about using this module and configuration options [here](https://github.com/kevinatown/MMM-Screencast#using-the-module).
#### 3.23. [Email](https://github.com/ronny3050/email-mirror)
This module displays emails on Mirror and listens for new incoming emails. When a new email is received, the mirror is updated to display it (**288 line**).  
<a><img src="https://github.com/SashkoMolodec/Meera/blob/master/Module_images/email.PNG" title="email" alt="email"></a>
```javascript
{
	module: 'email',
               position: 'bottom_left',
               header: 'Email',
               config: {
                   accounts: [
                       {
                           user: 'johndoe@xyz.com',
                           password: 'helloworld',
                           host: 'outlook.office365.com',
                           port: 993,
                           tls: true,
                           authTimeout: 10000,
                           numberOfEmails: 2,
                       },
                   ],
                   fade: true,
                   maxCharacters: 30
               }
}
```
You can read about using this module and configuration options [here](https://github.com/ronny3050/email-mirror#configuration-options).
## Contributing Guidelines
Contributions of all kinds are welcome, not only in the form of code but also with regards bug reports and documentation.
Please keep the following in mind:
* **Bug Reports:** Make sure you're running the latest version. If the issue(s) still persist: please open a clearly documented issue with a clear title.
* **Minor Bug Fixes:** Please send a pull request with a clear explanation of the issue or a link to the issue it solves.
* **Major Bug Fixes:** please discuss your approach in an GitHub issue before you start to alter a big part of the code.
* **New Features:** please please discuss in a GitHub issue before you start to alter a big part of the code. Without discussion upfront, the pull request will not be accepted / merged.
#### Thanks for making Meera better!
