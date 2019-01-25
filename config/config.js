/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information how you can configurate this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
	address: "0.0.0.0", // Address to listen on, can be:
	                      // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	                      // - another specific IPv4/6 to listen on a specific interface
	                      // - "", "0.0.0.0", "::" to listen on any interface
	                      // Default, when address config is left out, is "localhost"
	port: 8080,
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.0.1/120", "192.168.0.1/24","192.168.43.1","192.168.31.44"],// Set [] to allow all IP addresses
	                                                       // or add a specific IPv4 of 192.168.1.5 :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	                                                       // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	language: "en",
	timeFormat: 24,
	units: "metric",

	modules: [
		{
        module: 'MMM-pages',
        config: {
		rotationTime:100,
                modules:
                    [["MMM-cryptocurrency",'email','internet-monitor','MMM-LICE','MMM-soccer',"MMM-NowPlayingOnSpotify"],
                     [ "calendar","compliments","clock","currentweather","weatherforecast","newsfeed"],
					 ["calendar_monthly",'MMM-Trello','MMM-Events','MMM-GoogleFit','MMM-GoogleMapsTraffic','MMM-LocalTransport']],
                excludes: ["updatenotification","alert","MMM-voice", "MMM-Remote-Control", "MMM-page-indicator","MMM-Screencast"],
        	}
    		},
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left"
		},
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
		{
			module: "compliments",
			position: "lower_third"
		},
		{
			module: "currentweather",
			position: "top_right",
			config: {
				location: "Lviv",
				locationID: "702550",  //ID from http://bulk.openweathermap.org/sample/; unzip the gz file and find your city
				appid: ""
			}
		},
		{
			module: "weatherforecast",
			position: "top_right",
			header: "Weather Forecast",
			config: {
				location: "Lviv",
				locationID: "702550",  //ID from https://openweathermap.org/city
				appid: ""
			}
		},
		{
			module: "newsfeed",
			position: "bottom_bar",
			config: {
				feeds: [
					{
						title: "Ukrainian news",
						url: "https://www.theguardian.com/world/ukraine/rss"
					}
				],
				showSourceTitle: true,
				showPublishDate: true
			}
		},
		{
    		module: "MMM-voice",
    		position: 'bottom_bar',
    			config: {
        			microphone: 1
						}
		},
		{
    			module: 'MMM-Remote-Control'
		}, 
		{
				module: 'calendar_monthly',
				position: 'top_right',
		},
		{
				module: 'MMM-page-indicator',
				position: 'bottom_bar',
				config: {
					pages: 3,
						}
    	},
		{
				module: 'MMM-Trello',
				header: 'Trello Checklist',
				position: 'bottom_left', // This can be any of the regions, best results in center regions.
				config: {
					// See 'Configuration options' for more information.
					api_key: "",
					token: "",
					list: "",
					wholeList: true,
					showChecklists: true,
					//showDescription: true
						}
    	},
		{
				module: 'MMM-Events',
				position: 'bottom_right',
				config: {
					city: "Ukraine",            // Your City
					eventType: "music,sports,food,comedy,performing_arts,conference,learning_education,family_fun_kids,festivals_parades,movies_film,fundraisers,art,support,holiday,books,attractions,community,business,singles_social,schools_alumni,clubs_associations,animals,politics_activism,sales,science,religion_spirituality,technology",
					// Choose from Events List below
					when: "Future",                 // "All", "Future", "Past", "Today", "Last Week", "This Week", "Next week", and months by name, e.g. "October"
					mode: "noFrame",                   // "Frame" or "noFrame" (around picture)
					apikey: "",
					rotateInterval: "20000",     // New Event Appears every 5 minutes
					useHeader: true,                 // Set to true if you want a header
					header: "Upcoming Events",
					animationSpeed: "3000",              // Event fades in and out
					picture: true                     // true, false = no image
						}
		},
		{
    			module: 'MMM-GoogleFit',
    			position: 'top_right',
    			config: {
        			// If desired
    				}
		},
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
					logos: false
						}
		},
		{
				module: "MMM-cryptocurrency",
				position: "top_left",
				config: {
					currency: ['ethereum', 'bitcoin','ripple','dash','cardano'],
					conversion: 'USD',
					showUSD: false,
					headers: ['change24h', 'change1h', 'change7d'],
					displayType: 'logo',
					showGraphs: true
						}
		},
		{
				module: 'MMM-LICE',
				position: 'top_left',                 // Best in left, center, or right regions
				config: { 
					accessKey: "", // Free account & API Access Key at currencylayer.com
					source: "USD",                    // USD unless you upgrade from free account
					symbols: "UAH,EUR,RUB",       // Currency symbols
					useHeader: false,                 
					header: "Show me the money",
					maxWidth: "300px",
						}
		},
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
		{
				module: "MMM-NowPlayingOnSpotify",
				position: "right_bottom",
					config: {
					clientID: "",
					clientSecret: "",
					accessToken: "",
					refreshToken: ""
							}
		},
		{
            module: 'MMM-GoogleMapsTraffic',
            position: 'top_right',
            config: {
                key: '',
                lat: 49.83826,
                lng: 24.02324,
                height: '300px',
                width: '300px',
                disableDefaultUI: true,
                backgroundColor: 'hsla(0, 0%, 0%, 0)',
                markers: [
                    {
                        lat: 37.8262316,
                        lng: 24.0239305,
                        fillColor: '#9966ff'
                    },
                ],
            },
        },
		
		
		{
				module: 'MMM-Screencast',
				position: 'bottom_right', // This position is for a hidden <div /> and not the screencast window
				config: {
					position: 'bottomRight',
					height: 300,
					width: 500,
						}
        },


{
      module: 'MMM-LocalTransport',
      header: 'To IT STEP from Ryasne',
      position: 'top_right',
      config: {
      api_key: '',
        origin: "Ryasne 2, Lviv, Lviv Oblast, 79000",
        destination: "IT STEP University, 83A, Zamarstynivska St, L'viv, L'vivs'ka oblast, 79000",
        maximumEntries: 4,
        maxWalkTime: 15,
        displayWalkType: 'full',
        maxModuleWidth: 400
          }
  },
		{
				module: 'email',
						position: 'bottom_left',
						header: 'Email',
						config: {
							accounts: [
								{
									user: 'xxx@gmail.com',
									password: '',
									host: 'imap.gmail.com',
									port: 993,
									tls: true,
									authTimeout: 10000,
									numberOfEmails: 2,
								}
							],
							fade: true,
							maxCharacters: 30
						}
		},
			
				
	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}

