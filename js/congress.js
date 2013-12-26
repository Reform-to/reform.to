/**
 * @jsx React.DOM
 */

var CongressPicker = React.createClass({
  locateLegislators: function(coords) {
    var apikey = '574712f76976437cb98767c4a2622588';
    var query = {apikey: apikey, latitude: coords.latitude, longitude: coords.longitude};
    var locate = 'http://congress.api.sunlightfoundation.com/legislators/locate?' + $.param(query);
    $.ajax({
      url: locate,
      success: function(data) {
        this.setState({data: data.results});
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
        <AddressForm onAddressGeocode={this.locateLegislators} />
        <LegislatorList data={this.state.data} />
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
          self.setState({addressHelper: 'Found... ' + results[0].formatted_address});

          var country = $.grep(results[0].address_components, function(component) {
            return $.inArray('country', component.types) > -1;
          });

          if (country.length > 0) {
            var location = results[0].geometry.location;
            var lat = location.lat();
            var lng = location.lng();
            self.props.onAddressGeocode({latitude: lat, longitude: lng});
          } else {
            self.setState({addressHelper: 'No information for ' + results[0].formatted_address});
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
        <legend>Find Your Legislators</legend>
        <input
          type="text"
          className={this.state.addressStatus}
          placeholder="Enter an address to find your legislators"
          ref="address"
          autoFocus
        />
        <small className={this.state.addressStatus}>{this.state.addressHelper}</small>
      </fieldset>
    </form>
    );
  }
});

var LegislatorList = React.createClass({
  render: function() {
    var legislatorNodes = this.props.data.map(function (legislator) {
      return <Legislator
        key={legislator.bioguide_id}
        firstName={legislator.first_name}
        lastName={legislator.last_name} />
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
        <h3>{this.props.firstName} {' '} {this.props.lastName}</h3>
        <img src={"vendor/congress-photos/img/100x125/" + this.props.key + ".jpg"} alt={this.props.key + ".jpg"}/>
      </div>
    );
  }
});

React.renderComponent(
    <CongressPicker />,
    document.getElementById('ac-congress')
);
