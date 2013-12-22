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
      return <Legislator
        key={legislator.bioguide_id}
        firstName={legislator.first_name}
        lastName={legislator.last_name} />
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
        <p>{this.props.firstName} {' '} {this.props.lastName}</p>
      </div>
    );
  }
});

var legislators = [
{bioguide_id: "L000571", first_name: "Cynthia", last_name: "Lummis"},
{bioguide_id: "E000285", first_name: "Michael", last_name: "Enzi"},
{bioguide_id: "B001261", first_name: "John", last_name: "Barrasso"}
];

React.renderComponent(
    <CongressPicker data={legislators} />,
    document.getElementById('ac-congress')
);
