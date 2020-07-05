var SpotifyWebApi = require("spotify-web-api-node");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.clientID,
  clientSecret: process.env.clientSecret,
});

// Retrieve an access token
spotifyApi.clientCredentialsGrant().then(
  function (data) {
    console.log("The access token expires in " + data.body["expires_in"]);
    console.log("The access token is " + data.body["access_token"]);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body["access_token"]);
  },
  function (err) {
    console.log(
      "Something went wrong when retrieving an access token",
      err.message
    );
  }
);
