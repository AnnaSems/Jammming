// const redirectUri = 'http://jem-projectspt.surge.sh'
const redirectUri = 'http://localhost:3000';
const clientId = '286e5ad69d2a44f78f0cf8b1e3428815';


let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresMatch) {
      accessToken = accessTokenMatch[1];
      accessToken = accessToken.replace('=', '');
      const expiresIn = Number(expiresMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const URL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`

      window.location = URL;
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    console.log(accessToken);
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(response => {
      return response.json()
    }).then(jsonResponse => {
      if (!jsonResponse.tracks) {
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri,
      }))
    })
      .catch(err => {
        console.log('Failed fetch ', err);
      });
  },


  savePlayList(name, trackUri) {
    if (!name || !trackUri.length) {
      return;
    }
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userID;
    return fetch('https://api.spotify.com/v1/me', { headers: headers }).then(response =>
      response.json()).then(jsonResponse => {
        userID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({ name: name }),
        }).then(response => response.json()).then(jsonResponse => {
          const playlistID = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({ uris: trackUri })
          })
        })
      })
  },
}

export default Spotify;

