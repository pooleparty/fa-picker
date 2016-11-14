import React from 'react';
import Axios from 'axios';
import {GridList, GridTile} from 'material-ui/GridList';

const styles = {
	gridList: {
		width: '100%',
		height: 675,
		overflowY: 'auto',
	},
	gridTile: {
		border: '1px solid #9e9e9e'
	},
	iconContainer: {
		textAlign: 'center',
		padding: 25
	}
};

class IconListComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			icons: []
		};
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
		return (<GridList
			style={styles.gridList}
			cols={5}
			padding={8}>
			{this.state.icons.map((icon) => (
				<GridTile
					key={icon.id}
					title={icon.id}
					style={styles.gridTile}
					onTouchTap={() => this.props.selectIcon(icon)}>
					<div style={styles.iconContainer}>
						<span className={`fa fa-4x fa-${icon.id}`}></span>
					</div>
				</GridTile>
			))}
		</GridList>);
	}
}

export default IconListComponent