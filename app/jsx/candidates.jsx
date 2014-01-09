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
      '/reforms': this.setState.bind(this, {page: 'reforms', editing: false}, null)
    });
    router.init();
  },
  render: function() {
    var content;
    if (this.state.page === 'home') {
      content = <CandidateLocator />
    } else if (this.state.page === 'reforms') {
      content = <Reforms />
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
