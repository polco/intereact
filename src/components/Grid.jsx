import React from 'react';
import ReactDOM from 'react-dom';
import GridRow from 'components/GridRow';
import Scroller from 'components/Scroller';;
import './Grid.less';

const NEW_ROW_TIMEOUT = 400;

export class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = { rowsDisplay: [], newRowIndex: null };
    this.newRowTimer = null;
    this.newRowIndex = null;
  }

  offerNewRow(rowIndex) {
    if (this.newRowIndex === rowIndex) {
      return;
    }

    window.clearTimeout(this.newRowTimer);
    this.newRowIndex = rowIndex;
    this.newRowTimer = window.setTimeout(() => {
      this.setState({ newRowIndex: rowIndex });
    }, NEW_ROW_TIMEOUT);
  }

  offerNewRowAfter(rowIndex) {
    this.offerNewRow(rowIndex);
  }

  offerNewRowBefore(rowIndex) {
    this.offerNewRow(rowIndex - 1);
  }

  resetOffering() {
    if (this.newRowIndex === null) {
      return;
    }

    this.newRowIndex = null;
    window.clearTimeout(this.newRowTimer);
    this.setState({ newRowIndex: null });
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
      rowDisplay.y = rowDisplay.initialY = currentY;
      currentY += rowDisplay.height;
    });

    this.setState({ rowsDisplay });
  }

  componentWillReceiveProps(nextProps) {
    this.newRowIndex = null;
    this.setState({ newRowIndex: null });
    this.computeRowsDisplay(nextProps.rows);
  }

  componentDidMount() {
    this.width = this.gridSystem.clientWidth;
    this.computeRowsDisplay(this.props.rows);
  }

  render() {
    let newRowIndex = this.state.newRowIndex;
    return (
      <Scroller fingerCount={1}>
        <div className='grid-system' ref={(ref) => { this.gridSystem = ref; }}>{
          this.props.rows.map((row, rowIndex) => {
            let rowDisplay = this.state.rowsDisplay[rowIndex] || { cellsX: [], cellsWidth: [], height: 0 }
            if (newRowIndex === rowIndex) {
              rowDisplay.y = rowDisplay.initialY - 10;
            } else if (newRowIndex === rowIndex - 1) {
              rowDisplay.y = rowDisplay.initialY + 10;
            } else {
              rowDisplay.y = rowDisplay.initialY;
            }
            return (
              <GridRow
                rowDisplay={rowDisplay}
                key={rowIndex}
                index={rowIndex}
                offeringRow
                computeRowDisplay={this.computeRowDisplay.bind(this)}
                createRowWith={(fromRowIndex, fromCellIndex) => this.props.createRowWith(this.newRowIndex + 1, fromRowIndex, fromCellIndex)}
                changeCellRow={this.props.changeCellRow.bind(this)}
                resetOffering={this.resetOffering.bind(this)}
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
