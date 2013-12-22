/**
 * @jsx React.DOM
 */

var CongressPicker = React.createClass({
  locateLegislators: function(coordinates) {
    var apikey = '574712f76976437cb98767c4a2622588';
    var params = {apikey: apikey, latitude: coordinates.latitude, longitude: coordinates.longitude};
    var locate = 'http://congress.api.sunlightfoundation.com/legislators/locate?' + $.param(params);
    $.ajax({
      url: locate,
      success: function(data) {
        this.setState({data: data.results});
      }.bind(this)
    });
  },
  handleAddressSubmit: function(address) {
    var geocoder = new google.maps.Geocoder();
    self = this;
    geocoder.geocode(address, function(results, status) {
      if (status === 'OK') {
        var location = results[0].geometry.location;
        var lat = location.lat();
        var lng = location.lng();
        console.log('Address:', address.address);
        console.log('Latitude:', lat);
        console.log('Longitude:', lng);
        self.locateLegislators({latitude: lat, longitude: lng});
      }
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
        <AddressForm onAddressSubmit={this.handleAddressSubmit} />
        <LegislatorList data={this.state.data} />
      </div>
    </div>
    );
  }
});

var AddressForm = React.createClass({
  handleSubmit: function() {
    var address = this.refs.address.getDOMNode().value.trim();
    this.props.onAddressSubmit({address: address});
    return false;
  },
  render: function() {
    return (
    <form className="address-form" onSubmit={this.handleSubmit}>
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
