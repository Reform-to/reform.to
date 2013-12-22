/**
 * @jsx React.DOM
 */
var CongressPicker = React.createClass({
  render: function() {
    return (
    <div className="row">
      <div className="large-12 columns">
        <AddressForm />
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

React.renderComponent(
    <CongressPicker />,
    document.getElementById('congress')
);
