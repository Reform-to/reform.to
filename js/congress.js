/**
 * @jsx React.DOM
 */
var CongressPicker = React.createClass({
  render: function() {
    return (
    <div className="row">
      <div className="large-12 columns">
        <AddressForm />
        <LegislatorList />
      </div>
    </div>
    );
  }
});

var AddressForm = React.createClass({
  render: function() {
    return (
    <form>
      <fieldset>
        <legend>Find Your Legislator</legend>
        <input type="text" className="helper" placeholder="Enter an address to find your legislators"/>
        <small className="helper">Start the search...</small>
      </fieldset>
    </form>
    );
  }
});

var LegislatorList = React.createClass({
  render: function() {
    return (
      <div classnName="ac-legislator-list">
        <h4>your legislators</h4>
        <Legislator first_name="First" last_name="Last" />
        <Legislator first_name="Given" last_name="Family" />
      </div>
    );
  }
});

var Legislator = React.createClass({
  render: function() {
    return (
      <div className="ac-legislator">
        <p>{this.props.first_name} {' '} {this.props.last_name}</p>
      </div>
    );
  }
});

React.renderComponent(
    <CongressPicker />,
    document.getElementById('ac-congress')
);
