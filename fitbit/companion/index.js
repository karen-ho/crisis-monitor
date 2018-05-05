import * as messaging from "messaging";
import { geolocation } from "geolocation";

const url = 'https://crisis-monitor-2.herokuapp.com/data/';
let location = null;

geolocation.getCurrentPosition((position) => location = position, () => null);

messaging.peerSocket.onmessage = function (evt) {
  let loc = evt.location || location;
  console.log('location was... ' + JSON.stringify(location));
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
  })
    .then(resp => resp.json())
    .then(val => console.log(JSON.stringify(val)));
}