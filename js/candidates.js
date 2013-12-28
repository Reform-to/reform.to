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
          console.log(data);
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
        <District data={this.state.data} />
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
    return {data: []};
  },
  render: function() {
    return (
      <p>State: {this.props.data.state}<br/>District: {this.props.data.district}</p>
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
