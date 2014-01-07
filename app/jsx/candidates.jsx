/**
 * @jsx React.DOM
 */

var CandidateLocator = React.createClass({
  locateCandidates: function(coords) {
    var apikey = '574712f76976437cb98767c4a2622588';
    var sunlightAPI = "http://congress.api.sunlightfoundation.com";

    var locationQuery = {
      apikey: apikey,
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
        <LegislatorList legislators={this.state.legislators} />
      </div>
    </div>
    <div className="row">
      <div className="large-12 columns">
        <District state={this.state.districts.state} district={this.state.districts.district} />
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

var CandidateName = React.createClass({
  render: function() {
    return (
      <div>
      <h3 className="name">
        <span className="title">{this.props.title}</span> {' '}
        <a href="#">
          {this.props.firstName} {' '} {this.props.lastName}
        </a>
      </h3>
      <span className="details">{this.props.party}-{this.props.state}</span>
      </div>
    );
  }
});

var Legislator = React.createClass({
  render: function() {
    var imageDir = '/vendor/congress-photos/img/100x125/';
    var image = imageDir + this.props.key + '.jpg';
    return (
      <div className="ac-legislator">
      <div className="row">
      <div className="large-6 medium-8 columns">
        <Avatar party={this.props.party} image={image} />
        <CandidateName
          title={this.props.title}
          firstName={this.props.firstName}
          lastName={this.props.lastName}
          party={this.props.party}
          state={this.props.state}
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
    return {cycle: [], state: [], district: [], congressional: [], senatorial: []};
  },
  componentWillReceiveProps: function(props) {
    var apiKey = "0e71e93cf1cc57809a601579842aa03b:15:68622833";
    var nytimesAPI = "http://api.nytimes.com/svc/elections/us/v3/finances/";

    var query = {
      'api-key': apiKey
    };
    var cycle = 2014;
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
      }.bind(this)
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
      }.bind(this)
    });

  },
  render: function() {
    return (
      <div>
        <CandidateList candidates={this.state.congressional} />
        <CandidateList candidates={this.state.senatorial} />
      </div>

    );
  }
});

var CandidateList = React.createClass({
  render: function() {
    var candidateNodes = this.props.candidates.map(function (candidate) {
      return <Candidate
        key={candidate.candidate.id}
        name={candidate.candidate.name}
        party={candidate.candidate.party}
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
    return (
      <div className="ac-candidate">
        <div className="row">
          <div className="medium-6 columns">
            <h4>{this.props.name} {' '} <small>{this.props.party}</small></h4>
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

React.renderComponent(
    <CandidateLocator />,
    document.getElementById('ac-candidates')
);
