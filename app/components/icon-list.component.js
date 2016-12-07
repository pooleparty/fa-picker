import React from 'react';
import Axios from 'axios';
import {debounce} from 'throttle-debounce';
import {Grid, Row, Col, FormControl} from 'react-bootstrap';

const styles = {
	col: {
		border: '1px solid #9e9e9e'
	},
	iconContainer: {
		textAlign: 'center',
		padding: 25
	},
	searchBar: {
		marginBottom: 10
	}
};

const DEBOUNCE_AMOUNT = 300;

class IconListComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			icons: [],
			search: ''
		};
		this.handleSearchChange = debounce(DEBOUNCE_AMOUNT, this.handleSearchChange);
	}

	componentDidMount() {
		if (!this.state.icons.length) {
			Axios.get('/icons').then(response => {
				if (response.status === 200) {
					this.setState({icons: response.data.icons});
				}
			}).catch(err => console.error);
		}
	}

	render() {
		return (
			<Grid>
				<Row style={styles.searchBar}>
					<Col>
						<FormControl
							id="iconSearch"
							type="text"
							placeholder="Search Icons"
							onChange={this.debouncedHandleSearchChange.bind(this)}/>
					</Col>
				</Row>
				{this.buildIconList()}
			</Grid>);
	}

	debouncedHandleSearchChange(event) {
		this.handleSearchChange(event.target.value);
	}

	handleSearchChange(newSearch) {
		this.setState({search: newSearch || ''});
	}

	buildIconList() {
		let {icons, search} = this.state;

		if (!!search) {
			icons = icons.filter(icon => icon.id.indexOf(search) > -1);
		}

		return (
			<Row>
				{icons.map(icon => (
					<Col
						key={icon.id}
						style={styles.col}
						md={3}
						sm={4}
						xs={6}
						onClick={() => this.props.selectIcon(icon)}>
						<div style={styles.iconContainer}>
							<span className={`fa fa-4x fa-${icon.id}`}></span>
							<div>{icon.id}</div>
						</div>
					</Col>
				))}
			</Row>);
	}
}

export default IconListComponent