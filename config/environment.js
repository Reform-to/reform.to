// Put general configuration here.

window.ENV = {
  SITE: {
    latitude: '44.8708811',
    longitude: '-71.30591349999997',
    ajaxSubmit: true
  },
  ELECTIONS: {
    cycle: 2014
  },
  API: {
    ANTICORRUPT: {
      PHOTOS: {
        endpoint: "/vendor/congress-photos/"
      }
    },
    SUNLIGHT: {
      CONGRESS: {
        endpoint: "https://congress.api.sunlightfoundation.com/",
        apiKey: "574712f76976437cb98767c4a2622588"
      }
    },
    NYT: {
      FINANCES: {
        endpoint: "http://api.nytimes.com/svc/elections/us/v3/finances/",
        apiKey: "0e71e93cf1cc57809a601579842aa03b:15:68622833",
        dataType: "jsonp"
      }
    },
    GOOGLE: {
      MAPS: {
        endpoint: "https://maps.googleapis.com/maps/api/geocode/json"
      }
    },
    TWITTER: {
      SHARE: {
        endpoint: "https://twitter.com/share"
      }
    },
    FACEBOOK: {
      DIALOG: {
        endpoint: "https://www.facebook.com/dialog/feed",
        apiKey: "527046850741667"
      }
    }
  }
};
