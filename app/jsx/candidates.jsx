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
      '/reforms': this.setState.bind(this, {page: 'reforms', editing: false}, null),
      '/candidates': this.setState.bind(this, {page: 'candidates', editing: false}, null)
    });
    router.init();
  },
  render: function() {
    var content;
    if (this.state.page === 'home') {
      content = <CandidateLocator />
    } else if (this.state.page === 'reforms') {
      content = <Reforms />
    } else if (this.state.page === 'candidates') {
      content = <PledgeTaker />
    }
    return (
      <div>
        {content}
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
          this.setState({districts: data.results[0]});
        }
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {legislators: [], districts: []};
  },
  componentWillMount: function() {
  },
  render: function() {
    return (
    <div className="ac-candidate-locator">
    <div className="row">
      <div className="large-12 columns">
        <AddressForm onAddressGeocode={this.locateCandidates} />
      </div>
    </div>
    <div className="row">
      <div className="large-12 columns">
        <h2 className="subheader">
          {this.state.legislators.length > 0 ? 'United States Congress' : ''}
        </h2>
        <LegislatorList legislators={this.state.legislators} />
      </div>
    </div>
    <div className="row">
      <div className="large-12 columns">
        <District
          state={this.state.districts.state}
          district={this.state.districts.district}
          legislators={this.state.legislators}
        />
      </div>
    </div>
    <div id="ac-candidate-modal" className="reveal-modal" data-reveal>
    <h2>Support for Reforms</h2>
    <p><strong>Your candidate has not supported any reforms yet.</strong> Please contact your representatives today and urge them to make an Anti-Corruption Pledge.</p>
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
    var legislatorNodes = this.props.legislators.map(function (legislator) {
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
          <div className="large-12 columns">
            <h2 className="special-header subheader">
              {this.state.cycle ? 'Election ' + this.state.cycle : ''}
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
    $('#ac-candidate-modal').foundation('reveal', 'open');
    return false;
  },
  render: function() {
    return (
      <div>
      <h3 className="name">
        <span className="title">{this.props.title}</span> {' '}
        <a href="#" data-reveal-id="ac-candidate-modal" onClick={this.handleClick}>
          {this.props.firstName} {' '} {this.props.lastName} {' '}
        </a>
      </h3>
      <span className="details">
        {this.props.party}-{this.props.state}
        {this.props.district ? ", District " + this.props.district : ''}
        </span>
      </div>
    );
  }
});

var PledgeTaker = React.createClass({
  fillInCandidate: function(candidate) {
    console.log("Filling in candidate", candidate);
  },
  fillInReforms: function(reforms) {
    console.log("Filling in reforms", reforms);
  },
  getInitialState: function() {
    var reformsURL = window.ENV.API.ANTICORRUPT.REFORMS.endpoint;

    $.ajax({
      url: reformsURL,
      success: function(data) {
        this.setState({ reforms: data.reforms });
      }.bind(this)
    });

    return { reforms: [], role: "" };
  },
  render: function() {
    return (
      <div className="ac-pledge-taker">
      <div className="row">
        <div className="large-12 columns">
          <form className="congress-form">
            <CandidacyFieldset onCandidateSelect={this.fillInCandidate} />
            <ReformsFieldset onReformsSelect={this.fillReforms} />
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
    this.setState({ legislators: [] });
    // Reset the candidates
    this.setState({ candidates: [] });
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
    this.setState({ legislators: [] });
    // Reset the candidates
    this.setState({ candidates: [] });

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
  selectLegislator: function(i) {
    var legislator = this.state.legislators[i];
    this.props.onCandidateSelect(legislator);
  },
  selectCandidate: function(i) {
    var candidate = this.state.candidates[i];
    this.props.onCandidateSelect(candidate);
  },
  render: function() {
    var cx = React.addons.classSet;
    var congressFieldsetClasses = cx({
      'hide': !(this.state.role === 'congress' || this.state.role === 'candidate')
    });
    var districtSelectClasses = cx({
      'hide': this.state.chamber !== 'house'
    });
    return (
      <fieldset>
        <legend>Declare Your Candidacy</legend>
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
          <div className="large-3 columns">
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
                <option>Party...</option>
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
        <hr/>
        <div className="row">
          <div className="large-12 columns">
            <label>
              <strong>
              {this.state.legislators.length > 0 ? 'I am...' : ''}
              </strong>
            </label>
            {this.state.legislators.map(function (legislator, i) {
              return (
                <div key={i}>
                <input
                  type="radio"
                  name="legislator"
                  value={legislator.bioguide_id}
                  id={'form-radio-' + legislator.bioguide_id}
                  onClick={this.selectLegislator.bind(this, i)}
                />
                <label htmlFor={'form-radio-' + legislator.bioguide_id}>
                  <span className="subheader">{legislator.title}</span> {' '}
                  {legislator.first_name} {' '} {legislator.last_name},{' '}
                  {legislator.party}-{legislator.state}
                </label>
                </div>
              )
            }, this)}
          </div>
        </div>
        <div className="row">
          <div className="large-12 columns">
            <label>
              <strong>
              {this.state.candidates.length > 0 ? 'I am...' : ''}
              </strong>
            </label>
            {this.state.candidates.map(function (candidate, i) {
              return (
                <div key={i}>
                <input
                  type="radio"
                  name="candidate"
                  value={candidate.candidate.id}
                  id={'form-radio-' + candidate.candidate.id}
                  onClick={this.selectCandidate.bind(this, i)}
                />
                <label htmlFor={'form-radio-' + candidate.candidate.id}>
                  {candidate.candidate.name}
                </label>
                </div>
              )
            }, this)}
          </div>
        </div>
      </fieldset>
    );
  }
});

var ReformsFieldset = React.createClass({
  render: function() {
    return (
      <fieldset>
        <legend>Select Reforms</legend>
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
        this.setState({ reforms: data.reforms });
      }.bind(this)
    });

    return { reforms: [] };
  },
  render: function() {
    return (
      <div className="ac-reforms">
        <div className="row">
          <div className="large-6 large-offset-3 medium-10 medium-offset-1 columns">
            <ReformsList reforms={this.state.reforms} />
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
        <h4 className="subheader text-center">Reforms</h4>
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
