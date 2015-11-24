import React from 'react';
import ReactDOM from 'react-dom';
import GridRow from 'components/GridRow';
import Scroller from 'components/Scroller';;
import './Grid.less';


export class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.rowsDisplay = [];
    this.state = { rowsDisplay: [] };
  }


  offerNewRowAfter() {
  }

  offerNewRowBefore() {
  }

  computeRowDisplay(cells) {
    let minHeight = cells[0].height;

    cells.forEach(function (cell, index) {
      if (cell.height < minHeight) {
        minHeight = cell.height;
      }
    });

    let totalWidth = 0;
    cells.forEach(function (cell) {
      let newWidth = minHeight * cell.width / cell.height;
      totalWidth += newWidth;
    });

    let rowWidth = this.width;
    let height = Math.floor(rowWidth * minHeight / totalWidth);

    let cellsWidth = [];
    let cellsX = [];
    let currentX = 0;
    cells.forEach(function (cell, index) {
      let width;
      if (index === cells.length - 1) {
        width = rowWidth - currentX;
      } else {
        width = Math.round(height * cell.width / cell.height);
      }

      cellsWidth[index] = width;
      cellsX[index] = currentX;
      currentX += width;
    });

    let firstCellHalfWidth = cellsWidth[0] / 2;

    return {
      firstCellHalfWidth,
      height,
      cellsWidth,
      cellsX
    };
  }

  computeRowsDisplay(rows) {
    let rowsDisplay = [];
    rows.forEach((row) => {
      rowsDisplay.push(this.computeRowDisplay(row.cells));
    });

    let currentY = 0;
    rowsDisplay.forEach((rowDisplay) => {
      rowDisplay.y = currentY;
      currentY += rowDisplay.height;
    });

    this.setState({ rowsDisplay });
  }

  componentWillReceiveProps(nextProps) {
    this.computeRowsDisplay(nextProps.rows);
  }

  componentDidMount() {
    this.width = this.gridSystem.clientWidth;
    this.computeRowsDisplay(this.props.rows);
  }

  render() {
    return (
      <Scroller fingerCount={1}>
        <div className='grid-system' ref={(ref) => { this.gridSystem = ref; }}>{
          this.props.rows.map((row, rowIndex) => {
            return (
              <GridRow
                rowDisplay={this.state.rowsDisplay[rowIndex] || { cellsX: [], cellsWidth: [], height: 0 }}
                key={rowIndex}
                index={rowIndex}
                computeRowDisplay={this.computeRowDisplay.bind(this)}
                changeCellRow={this.props.changeCellRow.bind(this)}
                offerNewRowBefore={this.offerNewRowBefore.bind(this)}
                newRowBefore={this.props.newRowBefore.bind(this)}
                offerNewRowAfter={this.offerNewRowAfter.bind(this)}
                newRowAfter={this.props.newRowAfter.bind(this)}
                cellsShift={this.props.cellsShift.bind(this)}
                cells={row.cells} />
            );
          })
        }
        </div>
      </Scroller>
    );
  }
}

export default Grid;
