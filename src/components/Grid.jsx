import React from 'react';
import ReactDOM from 'react-dom';
import GridRow from 'components/GridRow';
import Scroller from 'components/Scroller';
import PluggableComponent from 'components/PluggableComponent';
import DropPlugin from 'components/DropPlugin';
import HoverPlugin from 'components/HoverPlugin';
import './Grid.less';

const NEW_ROW_TIMEOUT = 400;
const MAX_CELL_HEIGHT = 400;
const ROW_SHIFT_FACTOR = 0.1;

export class Grid extends PluggableComponent {
  constructor(props) {
    super(props);
    this.state = { rowsDisplay: {}, newRowIndex: null, scrollerHeight: 0 };
    this.newRowTimer = null;
    this.newRowIndex = null;

    this.addPlugin(new DropPlugin());
    this.addPlugin(new HoverPlugin());
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

  willDrop(dragPlugin) {
    let dropRowIndex = this.newRowIndex !== null ? this.newRowIndex + 1 : this.props.rows.length;
    let dragCellProps = dragPlugin.reactComponent.props;
    let newRow = this.props.createRowWith(this.props.id, dropRowIndex, dragCellProps.gridId, dragCellProps.rowIndex, dragCellProps.index);
    let rowDisplay = this.state.rowsDisplay[newRow.id];
    let boundingBox = this.DOMNode.getBoundingClientRect()
    return { x: boundingBox.left + rowDisplay.cellsX[0], y: boundingBox.top + rowDisplay.y, scale: rowDisplay.cellsWidth[0] / dragCellProps.width, time: 200 };
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
    if (!cells || !cells[0]) {
      debugger
    }
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
    let reachedMaxHeight = height > MAX_CELL_HEIGHT;
    if (reachedMaxHeight) {
      height = MAX_CELL_HEIGHT;
    }

    let cellsWidth = [];
    let cellsX = [];
    let currentX = 0;
    cells.forEach(function (cell, index) {
      let width;
      if (index === cells.length - 1 && !reachedMaxHeight) {
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
    let rowsDisplay = {};
    let scrollerHeight = 0;
    rows.forEach((row) => {
      let rowDisplay = this.computeRowDisplay(row.cells);
      rowsDisplay[row.id] = rowDisplay;
      rowDisplay.y = rowDisplay.initialY = scrollerHeight;
      scrollerHeight += rowDisplay.height;
    });

    this.setState({ rowsDisplay, scrollerHeight });
  }

  onTapLeave() {
    this.resetOffering();
  }

  componentWillReceiveProps(nextProps) {
    this.computeRowsDisplay(nextProps.rows);
    this.resetOffering();
  }

  componentDidMount() {
    super.componentDidMount();
    this.width = this.gridSystem.clientWidth;
    this.computeRowsDisplay(this.props.rows);
  }

  render() {
    let newRowIndex = this.state.newRowIndex;
    return (
      <Scroller fingerCount={1} contentHeight={this.state.scrollerHeight}>
        <div className='grid-system' ref={(ref) => { this.gridSystem = ref; }}>{
          this.props.rows.map((row, rowIndex) => {
            let rowDisplay = this.state.rowsDisplay[row.id] || { cellsX: [], cellsWidth: [], height: 0 }
            if (newRowIndex === rowIndex) {
              rowDisplay.y = rowDisplay.initialY - Math.floor(rowDisplay.height * ROW_SHIFT_FACTOR);
            } else if (newRowIndex === rowIndex - 1) {
              rowDisplay.y = rowDisplay.initialY + Math.floor(rowDisplay.height * ROW_SHIFT_FACTOR);
            } else {
              rowDisplay.y = rowDisplay.initialY;
            }
            return (
              <GridRow
                gridId={this.props.id}
                rowDisplay={rowDisplay}
                key={row.id}
                id={row.id}
                index={rowIndex}
                offeringRow
                computeRowDisplay={this.computeRowDisplay.bind(this)}
                changeCellRow={this.props.changeCellRow.bind(this)}
                resetOffering={this.resetOffering.bind(this)}
                offerNewRowBefore={this.offerNewRowBefore.bind(this)}
                offerNewRowAfter={this.offerNewRowAfter.bind(this)}
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
