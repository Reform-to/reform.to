/**
 * @jsx React.DOM
 */

var App = React.createClass({
  getInitialState: function() {
    return {page: 'home'};
  },
  componentDidMount: function() {
    var router = Router({
      '/': this.setState.bind(this, this.getInitialState(), null),
      '/reforms': this.setState.bind(this, {page: 'reforms'}, null),
      '/candidates': this.setState.bind(this, {page: 'candidates'}, null),
      '/about': this.setState.bind(this, {page: 'about'}, null)
    });
    router.init();
  },
  render: function() {
    var content;
    if (this.state.page === 'home') {
      content = <CandidateLocator />
    } else if (this.state.page === 'reforms') {
      content = <Reforms />
    } if (this.state.page === 'candidates') {
      content = <PledgeTaker />
    } else if (this.state.page === 'about') {
      content = <AboutPage />
    }
    return (
      <div>
        {content}
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
              <p><a href="/">Reform.to</a> tracks members of Congress as well as candidates, and highlights their support for specific <a href="/#reforms">legislative and constitutional reforms</a> aimed at fighting the corrupting influence of money in politics.</p>
            </div>
        </div>
      </div>
    );
  }
});

var CandidateLocator = React.createClass({
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
          this.setState({state: data.results[0].state});
          this.setState({district: data.results[0].district});
        }
      }.bind(this)
    });

    var reformsURL = window.ENV.API.ANTICORRUPT.REFORMS.endpoint;

    $.ajax({
      url: reformsURL,
      success: function(data) {
        var bioguideIds = data.reformers.map(function (reformer) {
          return reformer.bioguide_id;
        });
        this.setState({ reformers: bioguideIds });
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      legislators: [],
      state: '',
      district: '',
      reformers: []
    };
  },
  componentWillMount: function() {

    // Locate the candidates for the users's current location
    if (Modernizr.geolocation) {
      self = this;
      navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        self.locateCandidates({ latitude: lat, longitude: lng });
      });
    }

    // Display results for a default location
    var lat = window.ENV.SITE.latitude;
    var lng = window.ENV.SITE.longitude;
    this.locateCandidates({ latitude: lat, longitude: lng });
  },
  render: function() {
    return (
    <div className="ac-candidate-locator">
    <div className="row">
      <div className="large-12 columns">
        <h2 className="subheader special-header text-center text-lowercase">
          What reform does your candidate support?
        </h2>
        <AddressForm onAddressGeocode={this.locateCandidates} />
      </div>
    </div>
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
          reformers={this.state.reformers}
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

var LegislatorList = React.createClass({
  render: function() {
    var reformers = this.props.reformers;
    var legislatorNodes = this.props.legislators.map(function (legislator) {
      var isReformer = $.inArray(legislator.bioguide_id, reformers) >= 0;
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
    return (
      <div className="ac-candidate">
      <div className="row">
      <div className="large-6 medium-8 columns">
        <Avatar party={this.props.party} image={image} />
        <CandidateName
          title={this.props.title}
          firstName={this.props.firstName}
          lastName={this.props.lastName}
          party={this.props.party}
          state={this.props.state}
          district={this.props.district}
          isReformer={this.props.isReformer}
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
    return (
      <div
        className={"show-for-medium-up avatar img-circle " + avatarClass }
        style={avatarStyle}>
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
    return (
      <div>
      <h3 className={nameClass}>
        <span className="title">{this.props.title}</span> {' '}
        <a href="#" onClick={this.handleClick}>
          {this.props.firstName} {' '} {this.props.lastName} {' '}
        </a>
      </h3>
      <span className="details">
        {this.props.party}-{this.props.state}
        {this.props.district ? ", District " + this.props.district : ''} { ' ' }
        <span className="subheader">
        <a href="/#reforms">
        {this.props.isReformer ? " -  Reformer" : ''}
        </a>
        </span>
        </span>
      </div>
    );
  }
});

var PledgeTaker = React.createClass({
  fillInCandidate: function(candidate) {
    this.setState(candidate);
  },
  fillInReforms: function(reforms) {
  },
  getInitialState: function() {
    var reformsURL = window.ENV.API.ANTICORRUPT.REFORMS.endpoint;

    $.ajax({
      url: reformsURL,
      success: function(data) {
        this.setState({ reforms: data.reforms });
      }.bind(this)
    });

    return {
      reforms: [],
    };
  },
  render: function() {
    var reformersAPI = window.ENV.API.ANTICORRUPT.REFORMERS.endpoint;
    var addReformersURL = reformersAPI + '/reformers/add';
    return (
      <div className="ac-pledge-taker">
      <div className="row">
        <div className="large-12 columns">
          <form className="congress-form" data-abide method="post" action={addReformersURL}>
            <CandidacyFieldset onCandidateSelect={this.fillInCandidate} />
            <ReformsFieldset reforms={this.state.reforms} onReformsSelect={this.fillInReforms} />
            <ContactFieldset
              firstName={this.state.firstName}
              middleName={this.state.middleName}
              lastName={this.state.lastName}
              suffix={this.state.suffix}
              state={this.state.state}
            />
          </form>
        </div>
      </div>
      </div>
    );
  }
});

var CandidacyFieldset = React.createClass({
  getInitialState: function() {
    return { role: '', party: '', chamber: '', state: '', district: '', legislators: [], candidates: []};
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
    this.setState({ role: event.target.value });
    // Reset the legislators
    this.setState({ legislators: [], legislator_key: '' });
    // Reset the candidates
    this.setState({ candidates: [], candidate_key: '' });
   // Merge old and new state and look up candidate
    this.locateCandidates($.extend(this.state, { role: event.target.value }));
  },
  selectParty: function(event) {
    this.setState({ party: event.target.value });
    this.locateCandidates($.extend(this.state, { party: event.target.value }));
  },
  selectChamber: function(event) {
    // Reset the district
    this.setState({ district: '' });
    // Reset the legislators
    this.setState({ legislators: [], legislator_key: '' });
    // Reset the candidates
    this.setState({ candidates: [], candidate_key: '' });

    this.setState({ chamber: event.target.value });
    this.locateCandidates($.extend(this.state, { chamber: event.target.value }));
  },
  selectState: function(event) {
    // Reset the district if the state changes
    this.setState({ district: '' });
    this.setState({ state: event.target.value });
    this.locateCandidates($.extend(this.state, { state: event.target.value }));
  },
  selectDistrict: function(event) {
    this.setState({ district: event.target.value });
    this.locateCandidates($.extend(this.state, { district: event.target.value }));
  },
  selectLegislator: function(event) {
    var legislator = this.state.legislators[event.target.value];
    this.setState({ legislator_key: event.target.value });
    this.setState({ bioguide_id: legislator.bioguide_id });

    this.props.onCandidateSelect({
      firstName: legislator.first_name,
      middleName: legislator.middle_name,
      lastName: legislator.last_name,
      suffix: legislator.name_suffix,
      state: legislator.state,
    });
  },
  selectCandidate: function(event) {
    var candidate = this.state.candidates[event.target.value];
    this.setState({ candidate_key: event.target.value });
    this.setState({ fec_id: candidate.candidate.id });

    var names = candidate.candidate.name.split(',');
    var lastName = names[0];
    var firstName = names[1];

    this.props.onCandidateSelect({
      firstName: firstName,
      lastName: lastName,
      state: this.state.state
    });
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
        <legend>State Your Position</legend>
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
            <div className="large-3 medium-3 columns hide">
              <select
                id="form-select-party"
                onChange={this.selectParty}
                value={this.state.party}
              >
                <option value="">Party...</option>
                <option value="Democratic">Democratic</option>
                <option value="Green">Green</option>
                <option value="Independent">Independent</option>
                <option value="Libertarian">Libertarian</option>
                <option value="Moderate">Moderate</option>
                <option value="Republican">Republican</option>
                <option value="Unaffiliated">Unaffiliated</option>
              </select>
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
              value={this.state.legislator_key}
            >
            <option value="">Select Your Name...</option>
            {this.state.legislators.map(function (legislator, i) {
              return (
                <option value={i} key={i}>
                  {legislator.title} {' '}
                  {legislator.first_name} {' '} {legislator.last_name},{' '}
                  {legislator.party}-{legislator.state}
                </option>
              )
            }, this)}
            </select>
            </div>
            <input
              type="hidden"
              name="bioguide_id"
              value={this.state.bioguide_id}
            />
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
              value={this.state.candidate_key}
            >
            <option value="">Select Your Name...</option>
            {this.state.candidates.map(function (candidate, i) {
              return (
                <option value={i} key={i}>
                  {candidate.candidate.name}
                </option>
              )
            }, this)}
            </select>
            </div>
            <input
              type="hidden"
              name="fec_id"
              value={this.state.fec_id}
            />
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
    return (
      <fieldset className="form-fieldset-reforms">
        <legend>Select Reforms</legend>
        <label>
          <strong>
            {this.props.reforms.length > 0 ? 'I support...' : ''}
          </strong>
        </label>
        {this.props.reforms.map(function (reform, i) {
          var version = reform['1.0'];
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
              <strong>{version.title}.</strong> {' '} <em>{version.description}</em>
              </label>
            </div>
          )
        }, this)}
      </fieldset>
    )
  }
});

var ContactFieldset = React.createClass({
  getInitialState: function() {
    return {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      state: '',
    };
  },
  componentWillReceiveProps: function(props) {
    this.setState({
      firstName: props.firstName,
      middleName: props.middleName,
      lastName: props.lastName,
      suffix: props.suffix,
      state: props.state
    });
  },
  render: function() {
    var submitStyle = {
      width: '100%'
    };
    return (
      <fieldset>
        <legend>Sign the Pledge</legend>
        <div className="row">
          <div className="large-3 medium-3 columns">
            <label htmlFor="contact-form-first-name">First Name</label>
            <input
              type="text"
              name="first_name"
              id="contact-form-first-name"
              ref="contactFirstName"
              value={this.state.firstName}
            />
          </div>
          <div className="large-3 medium-3 columns">
            <label htmlFor="contact-form-middle-name">Middle Name</label>
            <input
              type="text"
              name="middle_name"
              id="contact-form-middle-name"
              ref="contactMiddleName"
              value={this.state.middleName}
            />
          </div>
          <div className="large-4 medium-4 columns">
            <label htmlFor="contact-form-last-name">Last Name</label>
            <input
              type="text"
              name="last_name"
              id="contact-form-last-name"
              ref="contactLastName"
              value={this.state.lastName}
            />
          </div>
          <div className="large-2 medium-2 columns">
            <label htmlFor="contact-form-last-name">Suffix</label>
            <input
              type="text"
              name="suffix"
              id="contact-form-suffix"
              ref="contactSuffix"
              value={this.state.suffix}
            />
          </div>
        </div>
        <div className="row">
          <div className="large-5 medium-5 columns">
            <label htmlFor="contact-form-email">Email <small>required</small></label>
            <input
              type="email"
              name="email"
              id="contact-form-email"
              ref="contact-email"
              required="required"
            />
            <small className="error">A valid email address is required.</small>
          </div>
          <div className="large-7 medium-7 columns">
            <label htmlFor="contact-form-button">Submit</label>
            <button style={submitStyle} className="button tiny">I do so pledge</button>
          </div>
        </div>
      </fieldset>
    )
  }
});

var Reforms = React.createClass({
  getInitialState: function() {
    var reformsURL = window.ENV.API.ANTICORRUPT.REFORMS.endpoint;

    $.ajax({
      url: reformsURL,
      success: function(data) {

        // Organize the reforms by type
        var reforms_by_type = {};

        data.reforms.forEach(function(element, index, array) {
          var version = element['1.0'];
          var type = version.reform_type;

          // Create an object to hold reforms for this type
          if (!reforms_by_type.hasOwnProperty(type)) {
            reforms_by_type[type] = { type: type, reforms: [] }
          }

          reforms_by_type[type].reforms.push(element);

        });

        // Turn the Object back into a plain array
        var reforms = [];
        for (key in reforms_by_type) {
          reforms.push(reforms_by_type[key]);
        }

        this.setState({ reforms: reforms });
      }.bind(this)
    });

    return { reforms: [] };
  },
  render: function() {
    var reformsListNodes = this.state.reforms.map(function (reformList) {
      return <ReformsList key={reformList.type} reforms={reformList.reforms} />
    });
    return (
      <div className="ac-reforms">
        <div className="row">
          <div className="large-6 large-offset-3 medium-10 medium-offset-1 columns">
            {reformsListNodes}
          </div>
        </div>
      </div>
    );
  }
});

var ReformsList = React.createClass({
  getInitialState: function() {
    return { reforms: [] }
  },
  componentWillReceiveProps: function(props) {
  },
  render: function() {
    var reformNodes = this.props.reforms.map(function (reform) {
      var version = reform['1.0'];
      return <Reform
        key={reform.id}
        title={version.title}
        description={version.description}
        sponsor={version.sponsor}
        billId={version.bill_id}
        url={version.url}
        />
    });
    return (
      <div className="ac-reform-list">
        <h4 className="subheader text-center">{this.props.key} Reforms</h4>
        {reformNodes}
      </div>
    );
  }
});

var Reform = React.createClass({
  render: function() {
    return (
      <div>
        <h3>{this.props.title}</h3>
        <p>
          <strong>
            {this.props.description}.{' '}
          </strong>
          {this.props.sponsor.name ? "Sponsored by " + this.props.sponsor.name + '.'  : ''}{' '}
          <a href={this.props.url}>
            {this.props.url ? "Learn More" : ''}
          </a>
            {this.props.url ? "." : ''}
        </p>
        <hr/>
      </div>
    );
  }
});


React.renderComponent(
    <App />,
    document.getElementById('ac-candidates')
);

function toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
