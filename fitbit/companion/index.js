import * as messaging from "messaging";
import { geolocation } from "geolocation";
import { me } from "companion"

const ANALYZE_DATA_URL = 'https://crisis-monitor-2.herokuapp.com/data/';
const CREATE_CARE_URL = 'https://crisis-monitor-2.herokuapp.com/care/'
let location = null;
const debug = false;
me.monitorSignificantLocationChanges = true;

geolocation.getCurrentPosition(setLocation, err, { timeout: 1000 });
let locationWatch = geolocation.watchPosition(setLocation, err, { timeout: 5000 });
let pingInterval = null;

if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
  onOpen();
} else {
  messaging.peerSocket.onopen = onOpen;
}

messaging.peerSocket.onmessage = function (evt) {
  if (debug) {
    console.log(location.latitude*1);
    console.log(location.longitude*1);
  }
  
  console.log('watch is sending a message');

  let loc = evt.data.location || location;
  if (evt.data.status === 'create-care') {
    console.log('was status create care?');
    const personId = getPerson() || '1';
    const care = {
      personId,
      lat: loc.latitude,
      long: loc.longitude,
    };
    post(CREATE_CARE_URL, care);
    clearInterval(pingInterval);
    return;
  }
  
  const data = Object.assign({ location: loc }, evt);
  post(ANALYZE_DATA_URL, data);
};

function post(url, data) {
  return fetch(url, {
   body: JSON.stringify(data),
   method: 'POST',
   headers: new Headers({
    'Content-Type': 'application/json'
   })
  }).then(resp => resp.json())
    .then(val => {
      console.log(val);
      messaging.peerSocket.send(val);
    });
}

function onOpen() {
  pingInterval = setInterval(function () {
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

function getPerson() {
  // this is a stub for now because id'ing fitbits to people is difficult
  return false;
}

function err(error) {
  console.log(error.code);
  console.log(error.message);
}