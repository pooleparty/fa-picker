import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import IconListComponent from './components/icon-list.component';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const styles = {
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
	},
	iconStudio: {
		minHeight: 300,
		border: '2px dashed #9e9e9e',
		marginBottom: 15
	},
	selectedIcon: {
		minHeight: 125,
		width: 150,
		padding: 5,
		margin: 10,
		textAlign: 'center',
		display: 'inline-block',
	}
};

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			primaryIcon: null,
			secondaryIcon: null,
		};
	}

	render() {
		let primaryIcon = this.buildSelectedIcon(this.state.primaryIcon, 'Primary Icon', () => this.setState({primaryIcon: null}));
		let secondaryIcon = this.buildSelectedIcon(this.state.secondaryIcon, 'Secondary Icon', () => this.setState({secondaryIcon: null}));

		return (
			<div>
				<MuiThemeProvider>
					<div>
						<div style={styles.iconStudio}>
							<div>
								{primaryIcon}
							</div>
							<div>
								{secondaryIcon}
							</div>
						</div>
						<div style={styles.root}>
							<IconListComponent selectIcon={this.selectIcon.bind(this)}/>
						</div>
					</div>
				</MuiThemeProvider>
			</div>);
	}

	buildSelectedIcon(icon, title, clearAction) {
		let builtIcon = (<div>none</div>);
		let cardActions = null;
		if (icon) {
			builtIcon = (
				<div>
					<div>{icon.id}</div>
					<span className={`fa fa-3x fa-${icon.id}`}></span>
				</div>
			);
			cardActions = (<FlatButton label="Clear" onTouchTap={clearAction}/>);
		}
		return (
			<Card>
				<CardText>
					<strong>{title}</strong>
					{builtIcon}
				</CardText>
				<CardActions>
					{cardActions}
				</CardActions>
			</Card>);
	}

	selectIcon(icon) {
		if (!this.state.primaryIcon) {
			this.setState({primaryIcon: icon});
		} else if (!this.state.secondaryIcon) {
			this.setState({secondaryIcon: icon});
		}
	}

	deselectPrimaryIcon() {
		this.setState({primaryIcon: null});
	}

}

ReactDOM.render(<App/>, document.getElementById('react-root'));