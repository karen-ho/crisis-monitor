import document from "document";
import { geolocation } from "geolocation";
import { HeartRateSensor } from "heart-rate";
import { Accelerometer } from "accelerometer";
import { Barometer } from "barometer";
import { Gyroscope } from "gyroscope";
import * as messaging from "messaging";
import { vibration } from "haptics";

var location = null;
let heartRateMonitor = new HeartRateSensor();
let accel = new Accelerometer({ frequency: 1 });
let bar = new Barometer({ frequency: 1 });
let gyro = new Gyroscope({ frequency: 1 });

geolocation.getCurrentPosition(setLocation, (error) => console.log(error));
geolocation.watchPosition(setLocation, (error) => console.log(error));

if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
  onOpen();
} else {
  messaging.peerSocket.onopen = onOpen;
}

messaging.peerSocket.onmessage = function (evt) {
  console.log('did the watch get a message from companion?');
  if (evt.data === 'ping') {
    console.log('ping heard');
    sendData();
    return;
  }
  
  if (evt.data && evt.data.status === 3) {
    console.log('od case');
    sendWarning();
    return;
  }

  console.log('heard this from the companion');
  console.log(evt);
};

const message = document.getElementById('message');
const help = document.getElementById('help');
const stillalive = document.getElementById('stillalive');
stillalive.onactivate = function(evt) {
  timeout && clearInterval(timeout);
};

function sendData() {
  const time = Date.now();
  const heartRate = heartRateMonitor.heartRate;
  const accelerometer = {
    time: accel.timestamp,
    x: accel.x,
    y: accel.y,
    z: accel.z,
  };
  const barometer = {
    time: accel.timestamp,
    pressure: parseInt(bar.pressure)
  };
  const gyroscope = {
    time: gyro.timestamp,
    x: gyro.x,
    y: gyro.y,
    z: gyro.z,
  };
  const obj = { time, location, accelerometer, barometer, gyroscope, heartRate };
  messaging.peerSocket.send(obj);
}

function onOpen() {
  heartRateMonitor.start();
  accel.start();
  bar.start();
  gyro.start();
}

function setLocation(position) {
  location = { latitude: position.coords.latitude*1, longitude: position.coords.longitude*1 };
  if (!location.latitude || !location.longitude) {
    return;
  }

  console.log('got the current position?');
  console.log(location.latitude);
  console.log(location.longitude);
}

var timeout = 0;

function sendWarning() {
  timeout = setTimeout(() => {
    const status = 'create-care';
    messaging.peerSocket.send({ status , location });

    stillalive.style.display = 'none';
    message.style.display = 'none';
    help.style.display = 'inline';

    vibration.stop();
  }, 5000);

  message.style.display = 'inline';
  stillalive.style.display = 'inline';
  vibration.start('nudge-max');
}