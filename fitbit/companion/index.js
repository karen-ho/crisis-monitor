import * as messaging from "messaging";
import { geolocation } from "geolocation";
import { me } from "companion"

const url = 'https://crisis-monitor-2.herokuapp.com/data/';
let location = null;
const debug = false;
me.monitorSignificantLocationChanges = true;

geolocation.getCurrentPosition(setLocation, err, { timeout: 1000 });
let locationWatch = geolocation.watchPosition(setLocation, err, { timeout: 5000 });

if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
  onOpen()
} else {
  messaging.peerSocket.onopen = onOpen;
}

messaging.peerSocket.onmessage = function (evt) {
  if (debug) {
    console.log(location.latitude*1);
    console.log(location.longitude*1);
  }
  console.log('posting to server ' + url);
  let loc = evt.location || location;
  const data = Object.assign({ location: loc }, evt);
  data && post(data);
};

function post(data) {
  return fetch(url, {
   body: JSON.stringify(data),
   method: 'POST',
   headers: new Headers({
    'Content-Type': 'application/json'
   })
  }).then(resp => resp.json())
    .then(val => console.log(JSON.stringify(val)));
}

function onOpen() {
  setInterval(function () {
    messaging.peerSocket.send('ping');
  }, 5000);
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

function err(error) {
  console.log(error.code);
  console.log(error.message);
}