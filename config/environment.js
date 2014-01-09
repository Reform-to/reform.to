// Put general configuration here.

window.ENV = {
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
        endpoint: "http://congress.api.sunlightfoundation.com/",
        apiKey: "574712f76976437cb98767c4a2622588"
      }
    },
    NYT: {
      FINANCES: {
        endpoint: "http://api.nytimes.com/svc/elections/us/v3/finances/",
        apiKey: "0e71e93cf1cc57809a601579842aa03b:15:68622833"
      }
    }
  }
};
