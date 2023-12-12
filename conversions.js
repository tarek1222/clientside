var R, e2, f;
R = 6378137;
f = 1.0 / 298.257224;
e2 = 1 - (1 - f) * (1 - f);

function lla2xyz(latitude, longitude, altitude) {
  var c, cosLat, cosLong, s, sinLat, sinLong, x, y, z;
  cosLat = Math.cos((latitude * Math.PI) / 180);
  sinLat = Math.sin((latitude * Math.PI) / 180);
  cosLong = Math.cos((longitude * Math.PI) / 180);
  sinLong = Math.sin((longitude * Math.PI) / 180);
  c = 1 / Math.sqrt(cosLat * cosLat + (1 - f) * (1 - f) * sinLat * sinLat);
  s = (1 - f) * (1 - f) * c;
  x = (R * c + altitude) * cosLat * cosLong;
  y = (R * c + altitude) * cosLat * sinLong;
  z = (R * s + altitude) * sinLat;
  console.log(x, y, z);
  return [x, y, z];
}

function xyz2enu(deltax, deltay, deltaz, latOrigin, lonOrigin) {
  var cosLatOrigin, cosLonOrigin, east, north, sinLatOrigin, sinLonOrigin, up;
  cosLatOrigin = Math.cos((latOrigin * Math.PI) / 180);
  sinLatOrigin = Math.sin((latOrigin * Math.PI) / 180);
  cosLonOrigin = Math.cos((lonOrigin * Math.PI) / 180);
  sinLonOrigin = Math.sin((lonOrigin * Math.PI) / 180);
  east = -deltax * sinLonOrigin + deltay * cosLonOrigin;
  north =
    -cosLonOrigin * sinLatOrigin * deltax -
    sinLatOrigin * sinLonOrigin * deltay +
    cosLatOrigin * deltaz;
  up =
    cosLatOrigin * cosLonOrigin * deltax +
    cosLatOrigin * sinLonOrigin * deltay +
    sinLatOrigin * deltaz;
  return [east, north, up];
}
export { lla2xyz, xyz2enu };
