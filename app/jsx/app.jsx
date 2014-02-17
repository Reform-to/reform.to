/**
 * @jsx React.DOM
 */

var App = React.createClass({
  getInitialState: function() {
    var reformsURL = window.ENV.API.ANTICORRUPT.REFORMS.endpoint;

    var apiKey = window.ENV.API.SUNLIGHT.CONGRESS.apiKey;
    var sunlightAPI = window.ENV.API.SUNLIGHT.CONGRESS.endpoint;

    var self = this;
    $.ajax({
      url: reformsURL,
      success: function(data) {
        var billIds = data.reforms.map(function(reform) {
          if (reform.bill_id) {
            return reform.bill_id;
          }
        }).filter(function(n) { return n; });

        var billFields = [
          "bill_id",
          "bill_type",
          "number",
          "congress",
          "chamber",
          "introduced_on",
          "official_title",
          "popular_title",
          "short_title",
          "summary",
          "summary_short",
          "urls",
          "sponsor_id",
          "sponsor",
          "cosponsor_ids",
          "cosponsors_count",
          "cosponsors",
          "last_version"
        ];

        var billQuery = {
          apikey: apiKey,
          "bill_id__in": billIds.join('|'),
          fields: billFields.join()
        };

        var findBillsURL =
          sunlightAPI + "/bills" + "?" + $.param(billQuery);

        $.ajax({
          url: findBillsURL,
          success: function(data) {
            self.setState({ bills: data.results });
          }.bind(self)
        });

        self.setState({ reforms: data.reforms });
      }.bind(this)
    });

    return { page: 'home', reforms: [], bills: [] };
  },
  navigateToLocation: function(empty, lat, lng) {
    this.setState({page: 'home', latitude: lat, longitude: lng});
  },
  navigateToReform: function(empty, id) {
    this.setState({page: 'reform', identifier: id});
  },
  navigateToLegislator: function(empty, id) {
    this.setState({page: 'legislators', identifier: id});
  },
  componentWillMount: function() {
    var router = Router({
      '/': this.setState.bind(this, {page: 'home'}, null),
      '/home': {
        "/(.*),(.*)": this.navigateToLocation.bind(this, null),
        '': this.setState.bind(this, {page: 'home'}, null),
      },
      '/reforms': {
        '/:id': this.navigateToReform.bind(this, null),
        '': this.setState.bind(this, {page: 'reforms'}, null)
      },
      '/legislators': {
        '/:id': this.navigateToLegislator.bind(this, null),
      },
      '/pledges': this.setState.bind(this, {page: 'pledges'}, null),
      '/about': this.setState.bind(this, {page: 'about'}, null)
    }).configure({
      // Reset the scroll position every time a route is entered
      on: function() { $('html,body').scrollTop(0); }
    });
    router.init();

    // If we enter the site at the base URL, update the route
    //  to "home" for consistency and better back-button behavior
    if (router.getRoute(0) === "") {
      router.setRoute("/home");
    }

    this.router = router;
  },
  componentWillReceiveProps: function(nextProps) {
    // Only route to the new location if the current location state is undefined
    // and we are on the home page
    if (this.state.page == "home" && !this.state.latitude && !this.state.longitude) {
      if (nextProps.latitude && nextProps.longitude) {
        this.router.setRoute("/home/" + nextProps.latitude + "," + nextProps.longitude);
      }
    }
  },
  routeToLocation: function(coords) {
    this.router.setRoute("/home/" + coords.latitude + "," + coords.longitude);
  },
  render: function() {
    var content;

    // Combine the reforms and bills data into one set
    var reforms;
    if (this.state.bills) {
      var bills = this.state.bills;
      reforms = this.state.reforms.map(function (r) {
        r.bill = $.grep(bills, function(b) { return b.bill_id === r.bill_id; })[0];
        return r;
      });
    } else {
      reforms = this.state.reforms;
    }

    // Read the location from state with props as the fallback
    var lat = this.state.latitude ? this.state.latitude : this.props.latitude;
    var lng = this.state.longitude ? this.state.longitude : this.props.longitude;

    if (this.state.page === 'home') {
      content = <HomePage
        latitude={lat}
        longitude={lng}
        reforms={reforms}
        bills={this.state.bills}
        onUpdateLocation={this.routeToLocation}
      />
    } else if (this.state.page === 'reforms') {
      content = <ReformsIndex reforms={reforms} />
    } else if (this.state.page === 'reform') {
      var slug = this.state.identifier;
      var reform = reforms.filter(function(r) {
        return slug === r.slug;
      })[0];

      if (reform) {
        content = <ReformProfile reform={reform} bills={this.state.bills} />
      }
    } else if (this.state.page === 'legislators') {
      content = <LegislatorProfile
        key={this.state.identifier}
        bioguideId={this.state.identifier}
        reforms={reforms}
        bills={this.state.bills}
      />
    } if (this.state.page === 'pledges') {
      content = <PledgeTaker reforms={reforms} />
    } else if (this.state.page === 'about') {
      content = <AboutPage />
    }
    return (
      <div>
        <Navigation
          latitude={lat}
          longitude={lng}
          page={this.state.page}
        />
        {content}
      </div>
    );
  }
});

var Navigation = React.createClass({
  getInitialState: function() {
    return ({
      expanded: true
    });
  },
  toggleTopbar: function() {
    this.setState({ expanded: !this.state.expanded });
    return false;
  },
  componentWillReceiveProps: function(nextProps) {
    // Close the menu when the component refreshes
    this.setState({ expanded: false });
  },
  render: function() {
    var lat = this.props.latitude;
    var lng = this.props.longitude;
    var coords = lat && lng ? [lat,lng].join(',') : '';
    var homeLink = coords ? "#/home/" + coords : "#/home";

    var nextLink;
    var nextTitle;
    if (this.props.page === "pledges") {
      nextLink = homeLink;
      nextTitle = "Find Your Candidate";
    } else {
      nextLink = "#/pledges";
      nextTitle = "Take the Pledge";
    }

    var navClass = "top-bar" + (this.state.expanded ? " expanded" : '');
    return (
    <nav className={navClass} data-topbar>
      <ul className="title-area">
        <li className="name">
        <h1 className="subheader"><a href={homeLink}>Reform.to</a></h1>
        </li>
        <li className="toggle-topbar menu-icon"><a href="#" onClick={this.toggleTopbar}><span>Menu</span></a></li>
      </ul>
      <section className="top-bar-section">
        <ul className="right">
          <li className="divider"></li>
          <li className="active"><a href={nextLink}>{nextTitle}{' '} <i className="fa fa-chevron-right"></i></a></li>
        </ul>
        <ul className="left">
          <li><a href="#/reforms">Reforms</a></li>
          <li><a href="#/about">About</a></li>
        </ul>
      </section>
    </nav>
    );
  }
});

var HomePage = React.createClass({
  updateLocation: function(coords) {
    this.props.onUpdateLocation(coords);
  },
  render: function() {
    return (
      <div>
      <div className="row">
        <div className="large-12 columns">
          <h2 className="subheader special-header text-center text-lowercase">
            What reform does your candidate support?
          </h2>
          <AddressForm onAddressGeocode={this.updateLocation} />
        </div>
      </div>
      <CandidatePicker
        latitude={this.props.latitude}
        longitude={this.props.longitude}
        reforms={this.props.reforms}
        bills={this.props.bills}
      />
      </div>
    );
  }
});

var AboutPage = React.createClass({
  render: function() {
    return (
      <div className="ac-about">
        <div className="row">
            <div className="large-6 large-offset-3 medium-10 medium-offset-1 columns">
              <h4 className="subheader text-center">About</h4>
              <p><a href="/">Reform.to</a> tracks members of Congress as well as candidates, and highlights their support for specific <a href="#/reforms">legislative and constitutional reforms</a> aimed at fighting the corrupting influence of money in politics.</p>
            </div>
        </div>
      </div>
    );
  }
});

var CandidatePicker = React.createClass({
  locateCandidates: function(coords) {
    var apiKey = window.ENV.API.SUNLIGHT.CONGRESS.apiKey;
    var sunlightAPI = window.ENV.API.SUNLIGHT.CONGRESS.endpoint;

    var locationQuery = {
      apikey: apiKey,
      latitude: coords.latitude,
      longitude: coords.longitude
    };

    var locateLegislatorsURL =
      sunlightAPI + '/legislators/locate' + "?" + $.param(locationQuery);

    $.ajax({
      url: locateLegislatorsURL,
      success: function(data) {
        this.setState({legislators: data.results});
      }.bind(this)
    });

    var locateDistrictURL =
      sunlightAPI + '/districts/locate' + "?" + $.param(locationQuery);

    $.ajax({
      url: locateDistrictURL,
      success: function(data) {
        if (data.count > 0) {
          this.setState({
            state: data.results[0].state,
            district: data.results[0].district
          });
        }
      }.bind(this)
    });

  },
  getInitialState: function() {
    return {
      legislators: [],
      state: '',
      district: '',
      reforms: [],
      bills: []
    };
  },
  componentWillMount: function() {
    // Display results for a default location
    var lat = this.props.latitude;
    var lng = this.props.longitude;
    if (lat && lng) {
      this.locateCandidates({ latitude: lat, longitude: lng });
    }
  },
  componentWillReceiveProps: function(nextProps) {
    // Update results if the location changes
    var lat = nextProps.latitude;
    var lng = nextProps.longitude;
    if (lat != this.props.latitude && lng != this.props.longitude) {
      this.locateCandidates({ latitude: lat, longitude: lng });
    }
  },
  render: function() {
    return (
    <div className="ac-candidate-picker">
    <div className="row">
      <div className="large-6 medium-8 columns">
        <h2 className="subheader">
          {this.state.legislators.length > 0 ? 'United States Congress' : ''}
        </h2>
      </div>
      <div className="large-6 medium-4 columns">
        <h2>
          {this.state.state ? this.state.state : ''}
          {this.state.district ? ", District " + this.state.district : ''}
        </h2>
      </div>
    </div>
    <div className="row">
      <div className="large-12 columns">
        <LegislatorList
          legislators={this.state.legislators}
          reforms={this.props.reforms}
          bills={this.props.bills}
        />
      </div>
    </div>
    <div className="row">
      <div className="large-12 columns">
        <District
          state={this.state.state}
          district={this.state.district}
          legislators={this.state.legislators}
        />
      </div>
    </div>
    </div>
    );
  }
});

var AddressForm = React.createClass({
  geocodeAddress: function() {
    $(".address-form input").blur();
    this.setState({addressHelper: 'Searching...'});
    this.setState({addressStatus: 'helper'});

    var address = this.refs.address.getDOMNode().value.trim();

    var geocoder = new google.maps.Geocoder();
    self = this;
    geocoder.geocode(
      {
        address: address,
        region: 'US'
      },
      function(results, status) {
        if (status === 'OK') {
          self.setState({
            addressHelper: 'Found... ' + results[0].formatted_address
          });

          var country = $.grep(
            results[0].address_components,
            function(component) {
              return $.inArray('country', component.types) > -1;
            }
          );

          if (country.length > 0) {
            var location = results[0].geometry.location;
            var lat = location.lat();
            var lng = location.lng();
            self.props.onAddressGeocode({latitude: lat, longitude: lng});
          } else {
            self.setState({
              addressHelper:'No information for ' + results[0].formatted_address
            });
            self.setState({addressStatus: 'error'});
          }
        }
      }
    );

    return false;
  },
  getInitialState: function() {
    return {
      addressHelper: 'Start the search...',
      addressStatus: 'helper'
    };
  },
  render: function() {
    return (
    <form className="address-form" onSubmit={this.geocodeAddress}>
      <fieldset>
        <legend>Find Your Candidates</legend>
        <input
          type="text"
          className={this.state.addressStatus}
          placeholder="Enter an address to find your legislators"
          ref="address"
          autoFocus
        />
        <small className={this.state.addressStatus}>
          {this.state.addressHelper}
        </small>
      </fieldset>
    </form>
    );
  }
});

var LegislatorProfile = React.createClass({
  getInitialState: function() {
    return {
      legislators: [],
      reforms: [],
      bills: []
    };
  },
  componentWillMount: function() {
    var apiKey = window.ENV.API.SUNLIGHT.CONGRESS.apiKey;
    var sunlightAPI = window.ENV.API.SUNLIGHT.CONGRESS.endpoint;

    var legislatorQuery = {
      apikey: apiKey,
      bioguide_id: this.props.bioguideId
    }

    var locateLegislatorsURL =
      sunlightAPI + '/legislators' + "?" + $.param(legislatorQuery);

    $.ajax({
      url: locateLegislatorsURL,
      success: function(data) {
        this.setState({legislators: data.results});
      }.bind(this)
    });
  },
  render: function() {
    var bioguideId = this.props.bioguideId;
    var bills = this.props.bills.filter(function(b) {
      var isSponsor = b.sponsor_id === bioguideId;
      var isCosponsor = $.inArray(bioguideId, b.cosponsor_ids) >= 0;
      return isSponsor || isCosponsor;
    });
    var bill_ids = bills.map(function(b) {
      return b.bill_id;
    });
    var reforms = this.props.reforms.filter(function(r) {
      return $.inArray(r.bill_id, bill_ids) >= 0;
    });

    var legislatorName;

    if (this.state.legislators.length) {
      var legislator = this.state.legislators[0];
      legislatorName = <FullTitleLastName
        title={legislator.title}
        gender={legislator.gender}
        lastName={legislator.last_name}
      />
    }

    var callOut;
    var callToAction;
    var callOutStyle = 'panel';
    if (reforms.length) {
      callOut = "is a Reformer!";
      callOutStyle = 'panel callout';
      callToAction = "";
    } else {
      callOut = "has not supported any Reforms.";
      callToAction = "Contact your Legislators today and urge them to support essential reform."
    }
    return(
      <div>
      <div className="row">
        <div className="large-6 medium-8 columns">
          <h2 className="subheader">
            {this.state.legislators.length > 0 ? 'United States Congress' : ''}
          </h2>
        </div>
      </div>
      <div className="row">
        <div className="large-12 columns">
          <LegislatorList
            legislators={this.state.legislators}
            reforms={this.props.reforms}
            bills={this.props.bills}
          />
        </div>
      </div>
      <div className="row">
        <div className="large-12 columns">
          <div className={callOutStyle}>
            <h4 className="subheader text-center">{legislatorName} {' '} {callOut}</h4>
            <p className="text-center">{callToAction}</p>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="large-12 columns">
          <hr/>
          <h2 className="subheader">{reforms.length > 0 ? "Sponsored Reform" : ""}</h2>
          <Reforms reforms={reforms} />
        </div>
      </div>
      </div>
    );
  }
});

var LegislatorList = React.createClass({
  render: function() {
    var bills = this.props.bills ? this.props.bills : [];

    // Merge all sponsor and co-sponsor IDs into one array
    var sponsor_ids = [].concat.apply([], bills.map(function (bill) {
      return $.merge([bill.sponsor_id], bill.cosponsor_ids);
    }));

    var legislatorNodes = this.props.legislators.map(function (legislator) {

      // Check if this Legislator is in the list of Reformers
      var isReformer = $.inArray(legislator.bioguide_id, sponsor_ids) >= 0;

      return <Legislator
        key={legislator.bioguide_id}
        firstName={legislator.first_name}
        lastName={legislator.last_name}
        title={legislator.title}
        state={legislator.state}
        district={legislator.district}
        party={legislator.party}
        phone={legislator.phone}
        office={legislator.office}
        contactForm={legislator.contact_form}
        twitter={legislator.twitter_id}
        facebook={legislator.facebook_id}
        isReformer={isReformer}
        />
    });
    return (
      <div className="ac-legislator-list">
        {legislatorNodes}
      </div>
    );
  }
});

var Legislator = React.createClass({
  render: function() {
    var congressPhotosAPI = window.ENV.API.ANTICORRUPT.PHOTOS.endpoint;
    var photoResource = '/img/100x125/'+ this.props.key + '.jpg';
    var image = congressPhotosAPI + photoResource;

    var badge = this.props.isReformer ? "ac-badge" : "dc-badge";
    return (
      <div className="ac-candidate">
      <div className="row">
      <div className="large-6 medium-8 columns">
        <Avatar party={this.props.party} image={image} badge={badge}/>
        <CandidateName
          title={this.props.title}
          firstName={this.props.firstName}
          lastName={this.props.lastName}
          party={this.props.party}
          state={this.props.state}
          district={this.props.district}
          isReformer={this.props.isReformer}
          bioguideId={this.props.key}
        />
      </div>
      <div className="small-6 medium-2 columns">
        <ul className="contact no-bullet">
          <li>
            <a href={"tel:" + this.props.phone}>{this.props.phone}</a>
          </li>
          <li>
            <a href={this.props.contactForm}>
              {this.props.contactForm ? "Contact Form" : ''}
            </a>
          </li>
          </ul>
        </div>
        <div className="small-6 medium-2 columns">
        <ul className="contact no-bullet">
          <li>
            <a href={"http://twitter.com/" + this.props.twitter}>
              {this.props.twitter ? "@" + this.props.twitter : ''}
            </a>
          </li>
          <li>
            <a href={"http://facebook.com/" + this.props.facebook}>
              {this.props.facebook ? "Facebook" : ''}
            </a>
          </li>
        </ul>
      </div>
      </div>
      </div>
    );
  }
});

var District = React.createClass({
  getInitialState: function() {
    return {
      cycle: '',
      state: [],
      district: [],
      congressional: [],
      senatorial: [],
      legislators: [],
      fecBioMap: []
    };
  },
  componentWillReceiveProps: function(props) {

    // Use the legislators list to map fec_ids to bioguide_ids
    var fecBioMap = {};
    props.legislators.forEach(function(legislator) {
        legislator.fec_ids.forEach(function(fecId) {
          fecBioMap[fecId] = legislator.bioguide_id;
        });
    });
    this.setState({fecBioMap: fecBioMap});

    // Look up current candidates for this state and district
    if (props.state != this.props.state && props.district != this.props.district) {
      var apiKey = window.ENV.API.NYT.FINANCES.apiKey;
      var nytimesAPI = window.ENV.API.NYT.FINANCES.endpoint;

      var query = {
        'api-key': apiKey
      };
      var cycle = window.ENV.ELECTIONS.cycle;
      var state = props.state;
      var district = props.district;

      var houseURI = nytimesAPI
        + cycle + '/seats/' + state + '/house/' + district
        + '.json?' + $.param(query);

      $.ajax({
        url: houseURI,
        dataType: 'jsonp',
        success: function(data) {
          if (data.status == "OK") {
            this.setState({
              cycle: data.cycle,
              state: data.state,
              district: data.district,
              congressional: data.results
            });
          }
        }.bind(this),
        error: function() {
            // Wipe state on API error
            this.setState({
              congressional: []
            });
        }.bind(this),
      });

      var senateURI = nytimesAPI
        + cycle + '/seats/' + state + '/senate' + '.json?' + $.param(query);

      $.ajax({
        url: senateURI,
        dataType: 'jsonp',
        success: function(data) {
          if (data.status == "OK") {
            this.setState({
              senatorial: data.results
            });
          }
        }.bind(this),
        error: function() {
            // Wipe state on API error
            this.setState({
              senatorial: []
            });
        }.bind(this),
      });
    }

  },
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="large-6 medium-8 columns">
            <h2 className="special-header subheader">
              {this.state.cycle ? 'Election ' + this.state.cycle : ''}
            </h2>
          </div>
          <div className="large-6 medium-4 columns">
            <h2>
                {this.props.state ? this.props.state : ''}
                {this.props.district ? ", District " + this.props.district : ''}
            </h2>
          </div>
        </div>
        <div className="row">
          <div className="medium-6 columns">
            <h4 className="subheader">
              {this.state.congressional.length > 0 ? 'House of Representatives' : ''}
            </h4>
            <CandidateList
              candidates={this.state.congressional}
              state={this.props.state}
              chamber="House"
              district={this.state.district}
              cycle={this.state.cycle}
              fecBioMap={this.state.fecBioMap}
            />
          </div>
          <div className="medium-6 columns">
            <h4 className="subheader">
              {this.state.senatorial.length > 0 ? 'Senate' : ''}
            </h4>
            <CandidateList
              candidates={this.state.senatorial}
              state={this.props.state}
              chamber="Senate"
              cycle={this.state.cycle}
              fecBioMap={this.state.fecBioMap}
            />
          </div>
        </div>
      </div>
    );
  }
});

var CandidateList = React.createClass({
  render: function() {
    var state = this.props.state;

    // Remove any leading zero from the district number, if it exists
    if (this.props.district !== undefined && this.props.district.length > 0) {
      var district = this.props.district.replace(/\b0+/g, "");
    } else {
      var district = null;
    }

    var self = this;

    var candidateNodes = this.props.candidates.map(function (candidate) {
      // Take the first letter of the party name only
      var party = candidate.candidate.party.substring(0, 1);

      // Format "LASTNAME, FIRSTNAME" as "Firstname LASTNAME"
      var names = candidate.candidate.name.split(',');
      var lastName = names[0];
      var firstName = toTitleCase(names[1]);

      // Check if candidate has a bioguide id
      var fecId = candidate.candidate.id;
      var fecBioMap = self.props.fecBioMap;

      var bioguideId = fecBioMap.hasOwnProperty(fecId) ? fecBioMap[fecId] : null;

      return <Candidate
        key={fecId}
        firstName={firstName}
        lastName={lastName}
        party={party}
        state={state}
        district={district}
        bioguideId={bioguideId}
      />
    });
    return (
      <div className="ac-candidate-list">
        {candidateNodes}
      </div>
    );
  }
});

var Candidate = React.createClass({
  render: function() {
    if (this.props.bioguideId) {
      var congressPhotosAPI = window.ENV.API.ANTICORRUPT.PHOTOS.endpoint;
      var photoResource = '/img/100x125/'+ this.props.bioguideId + '.jpg';
      var image = congressPhotosAPI + photoResource;
    } else {
      var image = '/img/avatar.png';
    }
    return (
      <div className="ac-candidate">
        <div className="row">
          <div className="medium-12 columns">
          <Avatar party={this.props.party} image={image} />
            <CandidateName
              firstName={this.props.firstName}
              lastName={this.props.lastName}
              party={this.props.party}
              state={this.props.state}
              district={this.props.district}
              bioguideId={this.props.bioguideId}
            />
          </div>
        </div>
      </div>
    );
  }
});

var Avatar = React.createClass({
  render: function() {
    var avatarClass = "party-" + this.props.party;
    var avatarStyle = {
      backgroundImage: 'url(' + this.props.image + ')'
    };
    var badgeClass = "badge " + this.props.badge;
    return (
      <div
        className={"show-for-medium-up avatar img-circle " + avatarClass }
        style={avatarStyle}>
        <div className={badgeClass}></div>
      </div>
    );
  }
});

var CandidateName = React.createClass({
  handleClick: function(event) {
    return false;
  },
  render: function() {
    var nameClass = this.props.isReformer ? 'name special-header' : 'name'

    var link = '';
    if (this.props.bioguideId) {
      link = "#/legislators/" + this.props.bioguideId;
    }

    var fullName = this.props.firstName + " " + this.props.lastName;

    return (
      <div>
      <h3 className={nameClass}>
        <span className="title">{this.props.title}</span> {' '}
        <a href={link}>
          {link ? fullName : ''}
        </a>
          {!link ? fullName : ''}
      </h3>
      <span className="details">
        {this.props.party}-{this.props.state}
        {this.props.district ? ", District " + this.props.district : ''} { ' ' }
        <span className="subheader">
        <a href="#/reforms">
        {this.props.isReformer ? " -  Reformer" : ''}
        </a>
        </span>
        </span>
      </div>
    );
  }
});

var PledgeTaker = React.createClass({
  getInitialState: function() {
    return { reforms: [], submitted: false, confirmed: false, reformError: '', emailError: false };
  },
  fillInCandidacy: function(candidacy) {
    this.setState({
      role: candidacy.role,
      chamber: candidacy.chamber,
      state: candidacy.state,
      district: candidacy.district
    });
  },
  fillInIds: function(ids) {
    this.setState({
      bioguideId: ids.bioguideId,
      fecId: ids.fecId
    });
  },
  fillInReforms: function(reforms) {
    this.setState({
      reforms: reforms
    });
    // If the user has selected at least one reform, unset any errors
    if (reforms.length > 0) {
      this.setState({ reformError: '' });
    }
  },
  fillInNames: function(names) {
    this.setState({
      firstName: names.firstName,
      middleName: names.middleName,
      lastName: names.lastName,
      suffix: names.suffix
    });
  },
  handleSubmit: function() {
    var supportsReform = this.state.reforms.length > 0;
    if (!supportsReform) {
      this.setState({ reformError: "(You must support at least one reform.)" });
    }

    var reformersAPI = window.ENV.API.ANTICORRUPT.REFORMERS.endpoint;
    var addReformersURL = reformersAPI + '/reformers/add';

    var contactForm = this.refs.contactForm.refs;
    var email = contactForm.contactEmail.getDOMNode().value.trim();

    if (!email) {
      this.setState({ emailError: true });
    }

    if (email && supportsReform) {
      this.setState({ email: email });

      var data = {
        bioguide_id: this.state.bioguideId,
        fec_id: this.state.fecId,
        email: email,
        first_name: this.state.firstName,
        middle_name: this.state.middleName,
        last_name: this.state.lastName,
        suffix: this.state.suffix,
        role: this.state.role,
        chamber: this.state.chamber,
        state: this.state.state,
        district: this.state.district,
        reforms: this.state.reforms
      }

      this.setState({ submitted: true});

      var self = this;
      $.ajax({
        type: "POST",
        url: addReformersURL,
        data: data,
        success: function(data) {
          self.setState({ confirmed: true});
        },
        dataType: "json"
      });

      $('html,body').scrollTop(0);
    }
    return false;
  },
  render: function() {
    var pledgeStyle = this.state.confirmed ? { display: 'none' } : {};
    var confirmStyle = this.state.confirmed ? {} : { display: 'none' };
    var contactEmail = this.state.email ? this.state.email : "your email address";

    var reforms = this.props.reforms;

    return (
      <div className="ac-pledge-taker">
      <div className="row">
        <div className="large-12 columns">
          <div style={pledgeStyle}>
          <div className="panel callout">
            <h4 className="subheader">Take the Pledge</h4>
            Are you a member of Congress or a candidate in the next election? Please tell us
            what reform you are willing to support.
          </div>
          <form className="congress-form" data-abide="ajax" onSubmit={this.handleSubmit}>
            <CandidacyFieldset
              onCandidacyChange={this.fillInCandidacy}
              onIdChange={this.fillInIds}
              onNameChange={this.fillInNames}
            />
            <ReformsFieldset
              reforms={this.props.reforms}
              error={this.state.reformError}
              onReformsSelect={this.fillInReforms}
            />
            <ContactFieldset
              ref="contactForm"
              firstName={this.state.firstName}
              middleName={this.state.middleName}
              lastName={this.state.lastName}
              suffix={this.state.suffix}
              onNameChange={this.fillInNames}
              submitted={this.state.submitted}
              emailError={this.state.emailError}
            />
          </form>
          </div>
          <div style={confirmStyle}>
          <div className="panel callout">
            <h4 className="subheader">Pledge Received</h4>
            Thank you for supporting essential reform!
          </div>
            <fieldset>
              <legend>4. Review Your Pledge</legend>
              <ol>
                {this.state.reforms.map(function (r, i) {
                  var reform = reforms[r];
                  return (
                    <li key={i}><strong>{reform.title}</strong></li>
                  );
                }, this)}
              </ol>
            </fieldset>
            <fieldset>
              <legend>5. Await Confirmation</legend>
              <p>We will contact you at {contactEmail} to verify your pledge. If you should have any questions please get in touch with us at <a href="mailto:info@reform.to">info@reform.to</a>.</p>
            </fieldset>
          </div>
        </div>
      </div>
      </div>
    );
  }
});

var CandidacyFieldset = React.createClass({
  getInitialState: function() {
    return {
      role: '',
      chamber: '',
      state: '',
      district: '',
      bioguideId: '',
      fecId: '',
      legislators: [],
      candidates: []
    };
  },
  locateCandidates: function(candidacy) {

    // Only do a search if a state has been chosen
    if (candidacy.state) {

      if (candidacy.role === 'congress') {
        // Search for current members of Congress

        // Use the Sunlight Foundation API
        var apiKey = window.ENV.API.SUNLIGHT.CONGRESS.apiKey;
        var sunlightAPI = window.ENV.API.SUNLIGHT.CONGRESS.endpoint;

        var locationQuery = {
          apikey: apiKey,
          state: candidacy.state,
          chamber: candidacy.chamber,
        };

        // Only select by district for House members
        if (candidacy.chamber === 'house') {
          locationQuery.district = candidacy.district;
        }

        // Perform the search for Senate, or House + District
        if (candidacy.chamber === "senate" || (candidacy.chamber === "house" && candidacy.district)) {

          var locateLegislatorsURL =
            sunlightAPI + '/legislators' + "?" + $.param(locationQuery);

          $.ajax({
            url: locateLegislatorsURL,
            success: function(data) {
              this.setState({legislators: data.results});
            }.bind(this)
          });
        }

      } else if (candidacy.role === 'candidate') {
        // Search for candidates for Congress

        // Use the NYT Campaign Finance API
        var apiKey = window.ENV.API.NYT.FINANCES.apiKey;
        var nytimesAPI = window.ENV.API.NYT.FINANCES.endpoint;

        var query = {
          'api-key': apiKey
        };

        var cycle = window.ENV.ELECTIONS.cycle;
        var state = candidacy.state;

        // Perform the search for Senate, or House + District
        if (candidacy.chamber === "senate") {
          var senateURI = nytimesAPI
            + cycle + '/seats/' + state + '/senate' + '.json?' + $.param(query);

          $.ajax({
            url: senateURI,
            dataType: 'jsonp',
            success: function(data) {
              if (data.status == "OK") {
                this.setState({
                  candidates: data.results
                });
              }
            }.bind(this),
            error: function() {
                // Wipe state on API error
                this.setState({
                  candidates: []
                });
            }.bind(this),
          });

        } else if (candidacy.chamber === "house" && candidacy.district) {
          var district = candidacy.district;
          var houseURI = nytimesAPI
            + cycle + '/seats/' + state + '/house/' + district
            + '.json?' + $.param(query);

          $.ajax({
            url: houseURI,
            dataType: 'jsonp',
            success: function(data) {
              if (data.status == "OK") {
                this.setState({
                  candidates: data.results
                });
              }
            }.bind(this),
            error: function() {
                // Wipe state on API error
                this.setState({
                  candidates: []
                });
            }.bind(this),
          });

        }

      }
    }
  },
  selectRole: function(event) {
    // Define the candidacy details when the role changes
    var candidacy = {
      role: event.target.value,
      chamber: this.state.chamber,
      state: this.state.state,
      district: this.state.district
    };
    var ids = {
      bioguideId: '',
      fecId: ''
    };
    this.setState(candidacy);
    this.setState(ids);

    // Reset the legislators and candidate lists
    this.setState({ legislators: [], candidates: [] });

   // Look up candidate and inform the parent
    this.locateCandidates(candidacy);
    this.props.onCandidacyChange(candidacy);
    this.props.onIdChange(ids);
  },
  selectChamber: function(event) {
    // Define the candidacy details when the chamber changes
    var candidacy = {
      role: this.state.role,
      chamber: event.target.value,
      state: this.state.state,
      district: ''
    };
    var ids = {
      bioguideId: '',
      fecId: ''
    };
    this.setState(candidacy);
    this.setState(ids);

    // Reset the legislators and candidate lists
    this.setState({ legislators: [], candidates: [] });

   // Look up candidate and inform the parent
    this.locateCandidates(candidacy);
    this.props.onCandidacyChange(candidacy);
    this.props.onIdChange(ids);
  },
  selectState: function(event) {
    // Define the candidacy details when the state changes
    var candidacy = {
      role: this.state.role,
      chamber: this.state.chamber,
      state: event.target.value,
      district: ''
    };
    var ids = {
      bioguideId: '',
      fecId: ''
    };
    this.setState(candidacy);
    this.setState(ids);

    // Reset the legislators and candidate lists
    this.setState({ legislators: [], candidates: [] });

   // Look up candidate and inform the parent
    this.locateCandidates(candidacy);
    this.props.onCandidacyChange(candidacy);
    this.props.onIdChange(ids);
  },
  selectDistrict: function(event) {
    // Define the candidacy details when the district changes
    var candidacy = {
      role: this.state.role,
      chamber: this.state.chamber,
      state: this.state.state,
      district: event.target.value
    };
    var ids = {
      bioguideId: '',
      fecId: ''
    };
    this.setState(candidacy);
    this.setState(ids);

    // Reset the legislators and candidate lists
    this.setState({ legislators: [], candidates: [] });

   // Look up candidate and inform the parent
    this.locateCandidates(candidacy);
    this.props.onCandidacyChange(candidacy);
    this.props.onIdChange(ids);
  },
  selectLegislator: function(event) {
    var bioguideId = event.target.value;
    this.setState({ bioguideId: bioguideId});

    var legislator = this.state.legislators.filter(function(l) {
      return l.bioguide_id == bioguideId;
    })[0];

    if (legislator) {
      this.props.onIdChange({
        bioguideId: bioguideId
      });
      this.props.onNameChange({
        firstName: legislator.first_name,
        middleName: legislator.middle_name,
        lastName: legislator.last_name,
        suffix: legislator.name_suffix
      });
    } else {
      this.props.onIdChange({
        bioguideId: ''
      });
      this.props.onNameChange({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: ''
      });
    }
  },
  selectCandidate: function(event) {
    var fecId = event.target.value;
    this.setState({ fecId: fecId});

    var candidate = this.state.candidates.filter(function(c) {
      return c.candidate.id == fecId;
    })[0];

    if (candidate) {
      var names = candidate.candidate.name.split(',');
      var lastName = names[0];
      var firstName = names[1];

      this.props.onIdChange({
        fecId: fecId
      });
      this.props.onNameChange({
        firstName: firstName,
        lastName: lastName,
        middleName: ''
      });
    } else {
      this.props.onIdChange({
        fecId: ''
      });
      this.props.onNameChange({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
      });
    }
  },
  render: function() {
    var cx = React.addons.classSet;
    var congressFieldsetClasses = cx({
      'hide': !(this.state.role === 'congress' || this.state.role === 'candidate')
    });
    var districtSelectClasses = cx({
      'hide': this.state.chamber !== 'house'
    });
    var legislatorSelectClasses = cx({
      'hide': this.state.legislators.length === 0
    });
    var candidateSelectClasses = cx({
      'hide': this.state.candidates.length === 0
    });
    return (
      <fieldset>
        <legend>1. State Your Position</legend>
        <label><strong>I am a...</strong></label>
        <div className="row">
          <div className="large-3 columns">
            <input
              type="radio"
              name="role"
              value="congress"
              id="form-radio-congress"
              checked={this.state.role == 'congress' ? 'checked' : null}
              onChange={this.selectRole}
            />
            <label htmlFor="form-radio-congress">Member of Congress</label>
          </div>
          <div className="large-3 columns">
            <input
              type="radio"
              name="role"
              value="candidate"
              id="form-radio-candidate"
              checked={this.state.role == 'candidate' ? 'checked' : null}
              onChange={this.selectRole}
            />
            <label htmlFor="form-radio-candidate">Candidate for Congress</label>
          </div>
          <div className="large-3 columns hide">
            <input
              type="radio"
              name="role"
              value="voter"
              id="form-radio-voter"
              checked={this.state.role == 'voter' ? 'checked' : null}
              onChange={this.selectRole}
            />
            <label htmlFor="form-radio-voter">Voter</label>
          </div>
          <div className="large-6 columns">
          </div>
        </div>
        <div className={congressFieldsetClasses}>
          <label><strong>My Seat is in...</strong></label>
          <div className="row">
            <div className="large-3 medium-3 columns">
              <select
                id="form-select-chamber"
                onChange={this.selectChamber}
                value={this.state.chamber}
                name="chamber"
              >
                <option value="">Chamber...</option>
                <option value="house">House of Representatives</option>
                <option value="senate">Senate</option>
              </select>
            </div>
            <div className="large-3 medium-3 columns">
              <select
                id="form-select-state"
                onChange={this.selectState}
                value={this.state.state}
                name="state"
              >
                <option value="">State...</option>
                <option value="AL">Alabama</option> <option value="AK">Alaska</option> <option value="AR">Arkansas</option> <option value="AZ">Arizona</option> <option value="CA">California</option> <option value="CO">Colorado</option> <option value="CT">Connecticut</option> <option value="DE">Delaware</option> <option value="FL">Florida</option> <option value="GA">Georgia</option> <option value="HI">Hawaii</option> <option value="IA">Iowa</option> <option value="ID">Idaho</option> <option value="IL">Illinois</option> <option value="IN">Indiana</option> <option value="KS">Kansas</option> <option value="KY">Kentucky</option> <option value="LA">Louisiana</option> <option value="MA">Massachusetts</option> <option value="MD">Maryland</option> <option value="ME">Maine</option> <option value="MI">Michigan</option> <option value="MN">Minnesota</option> <option value="MO">Missouri</option> <option value="MS">Mississippi</option> <option value="MT">Montana</option> <option value="NC">North Carolina</option> <option value="ND">North Dakota</option> <option value="NE">Nebraska</option> <option value="NH">New Hampshire</option> <option value="NJ">New Jersey</option> <option value="NM">New Mexico</option> <option value="NV">Nevada</option> <option value="NY">New York</option> <option value="OH">Ohio</option> <option value="OK">Oklahoma</option> <option value="OR">Oregon</option> <option value="PA">Pennsylvania</option> <option value="RI">Rhode Island</option> <option value="SC">South Carolina</option> <option value="SD">South Dakota</option> <option value="TN">Tennessee</option> <option value="TX">Texas</option> <option value="UT">Utah</option> <option value="VA">Virginia</option> <option value="VT">Vermont</option> <option value="WA">Washington</option> <option value="DC">Washington, D.C.</option> <option value="WI">Wisconsin</option> <option value="WV">West Virginia</option> <option value="WY">Wyoming</option>
              </select>
            </div>
            <div className="large-3 medium-3 columns">
              <select
                id="form-select-district"
                className={districtSelectClasses}
                onChange={this.selectDistrict}
                value={this.state.district}
                name="district"
              >
                <option value="">District...</option>
                <option value="0">At Large</option>
                <option value="1">1</option> <option value="2">2</option> <option value="3">3</option> <option value="4">4</option> <option value="5">5</option> <option value="6">6</option> <option value="7">7</option> <option value="8">8</option> <option value="9">9</option> <option value="10">10</option> <option value="11">11</option> <option value="12">12</option> <option value="13">13</option> <option value="14">14</option> <option value="15">15</option> <option value="16">16</option> <option value="17">17</option> <option value="18">18</option> <option value="19">19</option> <option value="20">20</option> <option value="21">21</option> <option value="22">22</option> <option value="23">23</option> <option value="24">24</option> <option value="25">25</option> <option value="26">26</option> <option value="27">27</option> <option value="28">28</option> <option value="29">29</option> <option value="30">30</option> <option value="31">31</option> <option value="32">32</option> <option value="33">33</option> <option value="34">34</option> <option value="35">35</option> <option value="36">36</option> <option value="37">37</option> <option value="38">38</option> <option value="39">39</option> <option value="40">40</option> <option value="41">41</option> <option value="42">42</option> <option value="43">43</option> <option value="44">44</option> <option value="45">45</option> <option value="46">46</option> <option value="47">47</option> <option value="48">48</option> <option value="49">49</option> <option value="50">50</option> <option value="51">51</option> <option value="52">52</option> <option value="53">53</option> <option value="54">54</option> <option value="55">55</option>
              </select>
            </div>
            <div className="large-3 medium-3 columns">
            </div>
          </div>
        </div>
        <div className="row">
          <div className="large-3 medium-3 columns">
            <div className={legislatorSelectClasses}>
            <label>
              <strong>
                My Name is...
              </strong>
            </label>
            <select
              id="form-select-legislator"
              onChange={this.selectLegislator}
              value={this.state.bioguideId}
              name="bioguide_id"
            >
            <option value="">Select Your Name...</option>
            {this.state.legislators.map(function (legislator, i) {
              return (
                <option value={legislator.bioguide_id} key={legislator.bioguide_id}>
                  {legislator.title} {' '}
                  {legislator.first_name} {' '} {legislator.last_name},{' '}
                  {legislator.party}-{legislator.state}
                </option>
              )
            }, this)}
            <option value="N/A">Not Listed</option>
            </select>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="large-3 medium-3 columns">
            <div className={candidateSelectClasses}>
            <label>
              <strong>
                My Name is...
              </strong>
            </label>
            <select
              id="form-select-candidate"
              onChange={this.selectCandidate}
              value={this.state.fecId}
              name="fec_id"
            >
            <option value="">Select Your Name...</option>
            {this.state.candidates.map(function (candidate, i) {
              return (
                <option value={candidate.candidate.id} key={candidate.candidate.id}>
                  {candidate.candidate.name}
                </option>
              )
            }, this)}
            <option value="N/A">Not Listed</option>
            </select>
            </div>
          </div>
        </div>
      </fieldset>
    );
  }
});

var ReformsFieldset = React.createClass({
  selectReforms: function(event) {
    var reforms = $('input[name="reforms[]"]:checked').map(function(_, el) {
      return $(el).val();
    }).get();
    this.props.onReformsSelect(reforms);
  },
  render: function() {
    var error = this.props.error ? this.props.error : '';
    var labelClass = this.props.error ? "error" : '';
    return (
      <fieldset className="form-fieldset-reforms">
        <legend>2. Select Reforms</legend>
        <label className={labelClass}>
          <strong>
            {this.props.reforms.length > 0 ? 'I support...' : ''}
            {' '}
          </strong>
          <span>
          {error}
          </span>
        </label>
        {this.props.reforms.map(function (reform, i) {
          return (
            <div key={i}>
              <label htmlFor={'form-checkbox-reform-' + reform.id}>
              <input
                type="checkbox"
                name="reforms[]"
                id={'form-checkbox-reform-' + reform.id}
                className="form-checkbox-reform"
                value={reform.id}
                onChange={this.selectReforms}
              />{' '}
              <strong>{reform.title}.</strong> {' '} <em>{reform.description}</em>
              </label>
            </div>
          )
        }, this)}
      </fieldset>
    )
  }
});

var ContactFieldset = React.createClass({
  // Form values are bound to props, so send any user inputs back to the parent
  changeFirstName: function(event) {
    // Combine the new value with the current values for the other inputs
    this.props.onNameChange($.extend(this.props, {firstName: event.target.value}));
  },
  changeMiddleName: function(event) {
    this.props.onNameChange($.extend(this.props, {middleName: event.target.value}));
  },
  changeLastName: function(event) {
    this.props.onNameChange($.extend(this.props, {lastName: event.target.value}));
  },
  changeSuffix: function(event) {
    this.props.onNameChange($.extend(this.props, {suffix: event.target.value}));
  },
  render: function() {
    // For any null props, set the corresponding input value to an
    // empty string. Otherwise old values may persist.
    var firstName = this.props.firstName ? this.props.firstName : '';
    var middleName = this.props.middleName ? this.props.middleName : '';
    var lastName = this.props.lastName ? this.props.lastName : '';
    var suffix = this.props.suffix ? this.props.suffix : '';

    var submitButton;
    if (this.props.submitted) {
      submitButton = <button className="button expand tiny" disabled>Sending...</button>

    } else {
      submitButton = <button className="button expand tiny">I do so pledge</button>
    }

    emailClass = this.props.emailError ? "error" : '';

    return (
      <fieldset>
        <legend>3. Sign the Pledge</legend>
        <div className="row">
          <div className="large-3 medium-3 columns">
            <label htmlFor="contact-form-first-name">First Name</label>
            <input
              type="text"
              name="first_name"
              id="contact-form-first-name"
              ref="contactFirstName"
              value={firstName}
              onChange={this.changeFirstName}
            />
          </div>
          <div className="large-3 medium-3 columns">
            <label htmlFor="contact-form-middle-name">Middle Name</label>
            <input
              type="text"
              name="middle_name"
              id="contact-form-middle-name"
              ref="contactMiddleName"
              value={middleName}
              onChange={this.changeMiddleName}
            />
          </div>
          <div className="large-4 medium-4 columns">
            <label htmlFor="contact-form-last-name">Last Name</label>
            <input
              type="text"
              name="last_name"
              id="contact-form-last-name"
              ref="contactLastName"
              value={lastName}
              onChange={this.changeLastName}
            />
          </div>
          <div className="large-2 medium-2 columns">
            <label htmlFor="contact-form-last-name">Suffix</label>
            <input
              type="text"
              name="suffix"
              id="contact-form-suffix"
              ref="contactSuffix"
              value={suffix}
              onChange={this.changeSuffix}
            />
          </div>
        </div>
        <div className="row">
          <div className="large-5 medium-5 columns">
            <div className={emailClass}>
            <label htmlFor="contact-form-email">Email <small>required</small></label>
            <input
              type="email"
              name="email"
              id="contact-form-email"
              ref="contactEmail"
              required="required"
            />
            <small className="error">A valid email address is required.</small>
            </div>
          </div>
          <div className="large-7 medium-7 columns">
            <label htmlFor="contact-form-button">Submit</label>
            {submitButton}
          </div>
        </div>
      </fieldset>
    )
  }
});

var ReformsIndex = React.createClass({
  render: function() {
    return (
      <div>
        <Reforms reforms={this.props.reforms} />
        <div className="row">
          <div className="large-12 columns">
            <div className="panel callout">
              <h4 className="subheader">Suggest a Reform</h4>
              This is just the beginning. If you have suggestions for reform,
              please contact us at <a href="mailto:info@reform.to">info@reform.to</a>.
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var Reforms = React.createClass({
  render: function() {
    // Organize the reforms by type
    var reforms_by_type = {};

    var self = this;
    this.props.reforms.forEach(function(reform, index, array) {
      var type = reform.reform_type;

      // Create an object to hold reforms for this type
      if (!reforms_by_type.hasOwnProperty(type)) {
        reforms_by_type[type] = { type: type, reforms: [] }
      }

      reforms_by_type[type].reforms.push(reform);

    });

    // Turn the Object back into a plain array
    var reforms = [];
    for (key in reforms_by_type) {
      reforms.push(reforms_by_type[key]);
    }

    var reformsListNodes = reforms.map(function (reformList) {
      return <ReformsList key={reformList.type} reforms={reformList.reforms} />
    });
    return (
      <div className="ac-reforms">
        <div className="row">
          <div className="large-12 columns">
            {reformsListNodes}
          </div>
        </div>
      </div>
    );
  }
});

var ReformsList = React.createClass({
  render: function() {
    var reformNodes = this.props.reforms.map(function (reform) {
      return <Reform
        key={reform.id}
        title={reform.title}
        description={reform.description}
        sponsor={reform.sponsor}
        billId={reform.bill_id}
        url={reform.url}
        slug={reform.slug}
        status={reform.reform_status}
        bill={reform.bill}
        />
    });
    return (
      <div className="ac-reform-list">
        <h4 className="subheader">{this.props.key} Reform</h4>
        {reformNodes}
      </div>
    );
  }
});

var ReformProfile = React.createClass({
  render: function() {
    var reform = this.props.reform;

    var bill;
    if (reform.bill_id) {
      bill = <Bill
        key={reform.bill_id}
        bill={reform.bill}
        slug={reform.slug}
      />
    }

    return (
      <div className="ac-reforms">
        <div className="row">
          <div className="large-12 columns">
            <h4 className="subheader">{reform.reform_type} Reforms</h4>
            <Reform
              key={reform.id}
              title={reform.title}
              description={reform.description}
              sponsor={reform.sponsor}
              billId={reform.bill_id}
              url={reform.url}
              slug={reform.slug}
              status={reform.reform_status}
              bill={reform.bill}
            />
            {bill}
          </div>
        </div>
      </div>
    );
  }
});

var Reform = React.createClass({
  render: function() {

    var sponsorLine;
    var billHasSponsor = this.props.bill && this.props.bill.sponsor;
    if (billHasSponsor) {
      var legislator = this.props.bill.sponsor;
      sponsorLine = <TitleNamePartyState
        key={legislator.bioguide_id}
        bioguideId={legislator.bioguide_id}
        title={legislator.title}
        firstName={legislator.first_name}
        lastName={legislator.last_name}
        state={legislator.state}
        district={legislator.district}
        party={legislator.party}
      />
    } else {
      var sponsor = this.props.sponsor;
      var sponsorName = [
        sponsor.title,
        sponsor.first_name,
        sponsor.last_name
      ].filter(function(n) { return n; }).join(" ");
      if (sponsor.website) {
        sponsorLine = <a href={sponsor.website}>{sponsorName}</a>
      } else {
        sponsorLine = sponsorName;
      }
    }

    statusStyle = {
      textTransform: "uppercase",
    };
    var resource = "#/reforms/" + this.props.slug;
    var a = $('<a>', { href:this.props.url } )[0];
    var hostname = a.hostname;
    return (
      <div>
        <h3>
          <a href={resource}>
            {this.props.title}
          </a>
          {' '}
          <small style={statusStyle}>
            {this.props.status}
          </small>
        </h3>
        <p>
          <strong>
            {this.props.description}.{' '}
          </strong>
          {sponsorLine ? "Sponsored by" : ''} {' '}
          {sponsorLine}
          {sponsorLine ? '.' : ''} {' '}
          <strong>
          <a href={this.props.url}>
            {this.props.url ? hostname : ''}
          </a>
          </strong>
        </p>
        <hr/>
      </div>
    );
  }
});

var Bill = React.createClass({
  render: function() {
    var cosponsors_count = this.props.bill ? this.props.bill.cosponsors_count : 0;
    var cosponsorNodes = cosponsors_count ? this.props.bill.cosponsors.map(function (cosponsor) {
      var legislator = cosponsor.legislator;
      return <li key={legislator.bioguide_id}><TitleNamePartyState
        bioguideId={legislator.bioguide_id}
        firstName={legislator.first_name}
        lastName={legislator.last_name}
        state={legislator.state}
        district={legislator.district}
        party={legislator.party}
      /></li>
    }) : '';
    var official_title = this.props.bill ? this.props.bill.official_title : '';
    var short_title = this.props.bill ? this.props.bill.short_title : '';
    var text_link = this.props.bill ? this.props.bill.last_version.urls.html : '';
    return (
      <div>
        <ul className="list-commas">
          <dt><strong className="subheader">{official_title ? "Official Title" : ''}</strong></dt>
          <li>{official_title}</li>
        </ul>
        <ul className="list-commas">
          <dt><strong className="subheader">{short_title ? "Full Text" : ''}</strong></dt>
          <li>
            <a href={text_link}>
              {short_title}
            </a>
          </li>
        </ul>
        <ul className="list-commas">
          <dt><strong className="subheader">{cosponsors_count ? "Co-Sponsors" : ''}</strong></dt>
          {cosponsorNodes}
        </ul>
      </div>
    );
  }
});

var FullTitleLastName = React.createClass({
  render: function() {
    var title;
    switch (this.props.title) {
      case "Rep":
        if (this.props.gender == "F") {
          title = "Congresswoman";
        } else {
          title = "Congressman";
        }
        break;
      case "Sen":
        title = "Senator"
        break;
      case "Del":
        title = "Delegate";
        break;
    }

    var fullName = [
      title, this.props.lastName
    ].join(" ");

    return (
        <span>{fullName}</span>
    );
  }
});

var TitleNamePartyState = React.createClass({
  render: function() {
    var fullName = [
      this.props.title, this.props.firstName, this.props.lastName
    ].join(" ");
    var link = "#/legislators/" + this.props.bioguideId;
    return (
      <span><a href={link}>{fullName}</a> ({this.props.party}-{this.props.state})</span>
    );
  }
});


/**
 * Main
 */

// Render the main application first using the default location

var Application = React.renderComponent(
    <App />,
    document.getElementById('ac-application')
);

// Attempt to update the location using the geolocation API

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(function (position) {
    Application.setProps({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  });
}

/**
 * Utilities
 */

function toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
