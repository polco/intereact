import React from 'react';
import ReactDOM from 'react-dom';
import GridRow from 'components/GridRow';
import Scroller from 'components/Scroller';
import DropPlugin from 'plugins/DropPlugin';
import ButtonPlugin from 'spur-button-plugin';
import plug from 'plugins/plug';
import 'styles/Grid.less';

const NEW_ROW_TIMEOUT = 400;
const MAX_CELL_HEIGHT_CONTAINER_FACTOR = 0.25;
const ROW_SHIFT_FACTOR = 0.1;

class Grid extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { rowsDisplay: {}, newRowIndex: null, scrollerHeight: 0, rowsOpacity: {} };
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

  willDrop(dragPlugin) {
    let dropRowIndex = this.newRowIndex !== null ? this.newRowIndex + 1 : this.props.rows.length;
    let dragComponentProps = dragPlugin.reactComponent.props;

    if (dragPlugin.source === 'moodboard') {
      let newRow = this.props.moveItem(
        { id: dragComponentProps.id, content: dragComponentProps.item.content },
        { type: 'moodboard', id: dragComponentProps.moodboardId },
        { type: 'scrapbook', id: this.props.id, rowIndex: dropRowIndex }
      );
      let rowsOpacity = this.state.rowsOpacity;
      rowsOpacity[newRow.id] = 0;
      this.setState({ rowsOpacity: rowsOpacity });
      if (!this.boundingBox) {
        this.boundingBox = this.DOMNode.getBoundingClientRect()
      }
      let rowDisplay = this.state.rowsDisplay[newRow.id];
      return { x: this.boundingBox.left + rowDisplay.cellsX[0], y: this.boundingBox.top + rowDisplay.y, scale: rowDisplay.cellsWidth[0] / dragComponentProps.item.width, time: 200 };
    } else if (dragPlugin.source === 'scrapbook')  {
      if (!dragComponentProps.gridId) { return false; }
      let newRow = this.props.createRowWith(this.props.id, dropRowIndex, dragComponentProps.gridId, dragComponentProps.rowIndex, dragComponentProps.index);
      let rowsOpacity = this.state.rowsOpacity;
      rowsOpacity[newRow.id] = 0;
      this.setState({ rowsOpacity: rowsOpacity });
      if (!this.boundingBox) {
        this.boundingBox = this.DOMNode.getBoundingClientRect()
      }
      let rowDisplay = this.state.rowsDisplay[newRow.id];
      return { x: this.boundingBox.left + rowDisplay.cellsX[0], y: this.boundingBox.top + rowDisplay.y, scale: rowDisplay.cellsWidth[0] / dragComponentProps.width, time: 200 };
    } else {
      return console.error('whuuuut?!');
    }
  }

  didDrop() {
    let rowsOpacity = this.state.rowsOpacity;
    for (let rowId in rowsOpacity) {
      rowsOpacity[rowId] = 1;
    }
    this.setState({ rowsOpacity });
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
    let reachedMaxHeight = height > this.maxHeight;
    if (reachedMaxHeight) {
      height = this.maxHeight;
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

  onDragLeave() {
    this.resetOffering();
    this.DOMNode.classList.remove('dragging-over');
  }

  onHoverEnd() {
    this.DOMNode.classList.remove('dragging-over');
  }

  onDragEnter() {
    this.boundingBox = this.DOMNode.getBoundingClientRect();
    this.DOMNode.classList.add('dragging-over');
  }

  componentWillReceiveProps(nextProps) {
    this.computeRowsDisplay(nextProps.rows);
    this.resetOffering();
  }

  refreshDimensions() {
    this.width = this.gridSystem.clientWidth;
    this.maxHeight = this.gridSystem.clientHeight * MAX_CELL_HEIGHT_CONTAINER_FACTOR;
    this.computeRowsDisplay(this.props.rows);
    this._resizeBound = this._onResize.bind(this);
    window.addEventListener('resize', this._resizeBound);
  }

  onNativeDrop(e) {
    if (this.newRowIndex !== null) {
      this.props.createNewCells(this.props.id, e.dataTransfer.files, this.newRowIndex + 1);
    } else {
      this.props.createNewCells(this.props.id, e.dataTransfer.files);
    }
  }

  componentDidMount() {
    this.DOMNode = ReactDOM.findDOMNode(this);
    this.refreshDimensions();
  }

  _onResize() {
    let now = Date.now();
    if (now - this.lastResize < 100) {
      return;
    }
    window.clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      this.refreshDimensions();
    }, 200);
    this.lastResize = now;
    this.refreshDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeBound);
    this._resizeBound = null;
  }


  render() {
    let newRowIndex = this.state.newRowIndex;
    return (
      <div className='grid-system' ref={(ref) => { this.gridSystem = ref; }}>
        <Scroller fingerCount={1} contentHeight={this.state.scrollerHeight}>
        {
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
                opacity={this.state.rowsOpacity[row.id]}
                key={row.id}
                id={row.id}
                index={rowIndex}
                offeringRow
                moveItem={this.props.moveItem.bind(this)}
                createNewCellsAt={this.props.createNewCellsAt.bind(this)}
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
        </Scroller>
      </div>
    );
  }
}

export default plug({ button: ButtonPlugin, drop: DropPlugin }, Grid);
