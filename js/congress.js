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
    var address = this.refs.address.getDOMNode().value.trim();

    var geocoder = new google.maps.Geocoder();
    self = this;
    geocoder.geocode(
      {
        address: address
      },
      function(results, status) {
        if (status === 'OK') {
          var location = results[0].geometry.location;
          var lat = location.lat();
          var lng = location.lng();
          console.log('Address:', address.address);
          console.log('Latitude:', lat);
          console.log('Longitude:', lng);
          self.props.onAddressGeocode({latitude: lat, longitude: lng});
        }
      }
    );

    return false;
  },
  render: function() {
    return (
    <form className="address-form" onSubmit={this.geocodeAddress}>
      <fieldset>
        <legend>Find Your Legislator</legend>
        <input
          type="text"
          className="helper"
          placeholder="Enter an address to find your legislators"
          ref="address"
        />
        <small className="helper">Start the search...</small>
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
        <h4>your legislators</h4>
        {legislatorNodes}
      </div>
    );
  }
});

var Legislator = React.createClass({
  render: function() {
    return (
      <div className="ac-legislator">
        <p>{this.props.firstName} {' '} {this.props.lastName}</p>
      </div>
    );
  }
});

React.renderComponent(
    <CongressPicker />,
    document.getElementById('ac-congress')
);
