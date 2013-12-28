/**
 * @jsx React.DOM
 */

var CandidatePicker = React.createClass({
  locateCandidates: function(coords) {
    var apikey = '574712f76976437cb98767c4a2622588';
    var query = {
      apikey: apikey,
      latitude: coords.latitude,
      longitude: coords.longitude
    };
    var locate = 'http://congress.api.sunlightfoundation.com/districts/locate?'
                  + $.param(query);
    $.ajax({
      url: locate,
      success: function(data) {
        if (data.count > 0) {
          this.setState({data: data.results[0]});
        }
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentWillMount: function() {
  },
  render: function() {
    return (
    <div className="row">
      <div className="large-12 columns">
        <AddressForm onAddressGeocode={this.locateCandidates} />
        <District state={this.state.data.state} district={this.state.data.district} />
      </div>
    </div>
    );
  }
});

var AddressForm = React.createClass({
  geocodeAddress: function() {
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
          placeholder="Enter an address to find your candidates"
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

var District = React.createClass({
  getInitialState: function() {
    return {cycle: [], state: [], district: [], candidates: []};
  },
  componentWillReceiveProps: function(props) {
    var apiKey = "0e71e93cf1cc57809a601579842aa03b:15:68622833";
    var query = {
      'api-key': apiKey
    };
    var cycle = 2014;
    var state = props.state;
    var district = props.district;
    var financesURI = 'http://api.nytimes.com/svc/elections/us/v3/finances/'
        + cycle + '/seats/' + state + '/house/' + district + '.json?'
        + $.param(query);

    $.ajax({
      url: financesURI,
      dataType: 'jsonp',
      success: function(data) {
        if (data.status == "OK") {
          this.setState({
            cycle: data.cycle,
            state: data.state,
            district: data.district,
            candidates: data.results
          });
        }
      }.bind(this)
    });

  },
  render: function() {
    return (
      <div>
        <p>
          State: {this.state.state}<br/>
          District: {this.state.district}<br/>
          Cycle: {this.state.cycle}
        </p>
        <CandidateList candidates={this.state.candidates} />
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
      />
    });
    return (
      <div className="ac-candidate-list">
        <h4>Candidates</h4>
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
            <p>{this.props.name}</p>
          </div>
        </div>
      </div>
    );
  }
});

var LegislatorList = React.createClass({
  render: function() {
    var legislatorNodes = this.props.data.map(function (legislator) {
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
    return (
      <div className="ac-legislator">
      <div className="row">
      <div className="medium-6 columns">
        <div className={"show-for-medium-up avatar img-circle party-"
          + this.props.party }></div>
        <h3 className="name">
          <span className="title">{this.props.title}</span> {' '}
          <a href="#">
            {this.props.firstName} {' '} {this.props.lastName}
          </a>
        </h3>
        <span className="details">{this.props.party}-{this.props.state}</span>
      </div>
      <div className="small-6 medium-3 columns">
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
        <div className="small-6 medium-3 columns">
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

React.renderComponent(
    <CandidatePicker />,
    document.getElementById('ac-candidates')
);
