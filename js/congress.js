/**
 * @jsx React.DOM
 */
var CongressPicker = React.createClass({
  render: function() {
    return (
    <div className="row">
      <div className="large-12 columns">
        <AddressForm />
        <LegislatorList data={this.props.data} />
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
    var legislatorNodes = this.props.data.map(function (legislator) {
      return <Legislator first_name={legislator.first_name} last_name={legislator.last_name} />
    });
    return (
      <div classnName="ac-legislator-list">
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
        <p>{this.props.first_name} {' '} {this.props.last_name}</p>
      </div>
    );
  }
});

var legislators = [
{first_name: "Cynthia", last_name: "Lummis"},
{first_name: "Michael", last_name: "Enzi"},
{first_name: "John", last_name: "Barrasso"}
];

React.renderComponent(
    <CongressPicker data={legislators} />,
    document.getElementById('ac-congress')
);
