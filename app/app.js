import React from 'react';
import ReactDOM from 'react-dom';
import IconListComponent from './components/icon-list.component';
import {Button, Grid, Row, Col} from 'react-bootstrap';

const styles = {
	iconStudio: {
		minHeight: 200,
		border: '2px dashed #9e9e9e',
		marginBottom: 10,
		padding: 20
	},
	iconContainer: {
		padding: 5
	},
	actionContainer: {
		padding: 5
	},
	iconListContainer: {
		width: '100%',
		height: 675,
		overflowY: 'auto',
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
				<div style={styles.iconStudio}>
					<Grid>
						<Row>
							<Col md={12} xs={6}>
								<div>
									{primaryIcon}
								</div>
							</Col>
							<Col md={12} xs={6}>
								<div>
									{secondaryIcon}
								</div>
							</Col>
						</Row>
						<Row>
							<Col>
								{this.buildIconStudio()}
							</Col>
						</Row>
					</Grid>
				</div>
				<div style={styles.iconListContainer}>
					<IconListComponent selectIcon={this.selectIcon.bind(this)}/>
				</div>
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
			cardActions = (<Button onClick={clearAction}>Clear</Button>);
		}
		return (
			<div>
				<strong>{title}</strong>
				<div style={styles.iconContainer}>
					{builtIcon}
				</div>
				<div style={styles.actionContainer}>
					{cardActions}
				</div>
			</div>);
	}

	buildIconStudio() {
		let {primaryIcon, secondaryIcon} = this.state;
		let primaryIconEl, secondaryIconEl;

		if (primaryIcon) {
			primaryIconEl = (<span className={`fa fa-${primaryIcon.id} fa-stack-1x`}></span>);
		}
		if (secondaryIcon) {
			secondaryIconEl = (<span className={`fa fa-${secondaryIcon.id} fa-stack-2x`}></span>);
		}

		return (
			<div>
				<strong>Combined Icon</strong>
				<div>
				<span className="fa-stack fa-2x">
					{secondaryIconEl}
					{primaryIconEl}
				</span>
				</div>
			</div>
		);
	}

	selectIcon(icon) {
		if (!this.state.primaryIcon) {
			this.setState({primaryIcon: icon});
		} else if (!this.state.secondaryIcon) {
			this.setState({secondaryIcon: icon});
		}
	}
}

ReactDOM.render(<App/>, document.getElementById('react-root'));