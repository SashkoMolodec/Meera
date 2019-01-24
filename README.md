# Meera
[MagicMirror²](https://magicmirror.builders/) Build with integrated Google Assistant and package of useful modules.

## Required Components
* [Raspberry Pi](https://www.raspberrypi.org/) 2 or above with pre-installed [Raspbian OS](https://www.raspberrypi.org/downloads/)
* Monitor with HDMI ouput (or via VGA to HDMI adapter)
* USB keyboard with mouse
* Microphone and speakers with USB output (or via USB Sound Card, for [example](https://www.amazon.com/Channel-External-Sound-Adapter-Laptop/dp/B01LQENV8G))

### 1. MagicMirror²
First, we need to install basic version of a [MagicMirror²](https://github.com/MichMich/MagicMirror) (automatic or manual installation).
In this manual, we will set it up automatically. Go into your terminal and excecute the following command on your Raspberry Pi:
```
bash -c "$(curl -sL https://raw.githubusercontent.com/MichMich/MagicMirror/master/installers/raspberry.sh)"
```

Then, we will need to install Electron & Node JS to make everything work fine. You need to run this commands in your terminal one by one:
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
npm start
```

If you have some problems with installing or running, find your issue [here](https://github.com/MichMich/MagicMirror/issues).
