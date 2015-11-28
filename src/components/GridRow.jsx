import React from 'react';
import PluggableComponent from 'components/PluggableComponent';
import { tapEvents, getTap } from 'components/tapHelper';
import DropPlugin from 'components/DropPlugin';
import TransformPlugin from 'components/TransformPlugin';
import GridElement from 'components/GridElement';
import './GridRow.less';


const NEW_ROW_GAP = 20;
const CELL_SHIFT_FACTOR = 0.1;

class GridRow extends PluggableComponent {
  constructor(props) {
    super(props);

    this.addPlugin(new DropPlugin());
    this.transform = this.addPlugin(new TransformPlugin());

    this.state = { cellsX: [], cellsOpacity: {} };
    this.props = { rowDisplay: { cellsX: [], cellsWidth: [], height: 0 } }
    this.cellsIndex = {};
    this.currentDragOverCell = -1;
  }

  resetCellsPosition(cellsX) {
    this.setState({ cellsX: cellsX || this.props.rowDisplay.cellsX });
  }

  onTapMove(e) {
    let tap = getTap(e);
    let rowDisplay = this.props.rowDisplay;
    let relativeY = tap.y - this.boundingBox.top + (rowDisplay.y - rowDisplay.initialY);

    if (relativeY < NEW_ROW_GAP) {
      this.props.offerNewRowBefore(this.props.index);
    } else if (relativeY > this.props.rowDisplay.height - NEW_ROW_GAP) {
      this.props.offerNewRowAfter(this.props.index);
    } else {
      this.props.resetOffering();
      let relativeX = tap.x - this.boundingBox.left;
      let currentDragOverCell = rowDisplay.cellsX.length - 1;
      for (let i = 0, len = rowDisplay.cellsX.length - 1; i < len; i += 1) {
        if (relativeX < rowDisplay.cellsX[i + 1] + rowDisplay.cellsWidth[i + 1] / 2) {
          currentDragOverCell = i;
          break;
        }
      }

      if (this.currentDragOverCell === currentDragOverCell && currentDragOverCell !== 0) {
        return;
      }
      this.currentDragOverCell = currentDragOverCell;

      this.isInFirstHalf = relativeX < rowDisplay.firstCellHalfWidth;

      if (this.dragComponentProps.rowId === this.props.id && this.dragComponentProps.gridId === this.props.gridId) { // dragging on same row
        if (currentDragOverCell === this.dragComponentProps.index || (currentDragOverCell === this.dragComponentProps.index - 1 && !this.isInFirstHalf)) {
          return this.resetCellsPosition();
        }
      }

      let cellsX = rowDisplay.cellsX.concat();
      if (this.isInFirstHalf) {
        cellsX[0] += Math.floor(rowDisplay.cellsWidth[0] * CELL_SHIFT_FACTOR);
      } else {
        let shift = Math.floor(rowDisplay.cellsWidth[currentDragOverCell] * CELL_SHIFT_FACTOR);
        cellsX[currentDragOverCell] -= shift;
        cellsX[currentDragOverCell + 1] += shift;
      }
      this.setState({ cellsX });
    }
  }

  removeListener() {
    document.body.removeEventListener(tapEvents.move, this._onTapMoveBound);
    this._onTapMoveBound = null;
    document.body.removeEventListener(tapEvents.end, this._onTapEndBound);
    this._onTapEndBound = null;
  }

  willDrop() {
    this.removeListener();
    let transform;
    let cellsOpacity = this.state.cellsOpacity;

    let dragWithinTheGrid = this.props.gridId === this.dragComponentProps.gridId;
    if (this.props.id === this.dragComponentProps.rowId && dragWithinTheGrid) {
      let newIndex;
      if (this.isInFirstHalf) {
        newIndex = 0;
      } else if (this.currentDragOverCell < this.dragComponentProps.index) {
        newIndex = this.currentDragOverCell + 1;
      } else {
        newIndex = this.currentDragOverCell;
      }
      cellsOpacity[this.dragComponentProps.cell.id] = 0.5;
      if (this.dragComponentProps.index !== newIndex) {
        this.props.cellsShift(this.dragComponentProps.rowIndex, this.dragComponentProps.index, newIndex);
      }
      transform = { x: this.boundingBox.left + this.props.rowDisplay.cellsX[newIndex], y: this.boundingBox.top, scale: 1, time: 200 };
    } else {
      let newIndex;
      if (this.isInFirstHalf) {
        newIndex = 0;
      } else {
        newIndex = this.currentDragOverCell + 1;
      }
      let previousY = this.transform.y;

      cellsOpacity[this.dragComponentProps.cell.id] = 0;
      this.props.changeCellRow(this.dragComponentProps.gridId, this.dragComponentProps.rowIndex, this.dragComponentProps.index, this.props.gridId, this.props.index, newIndex);
      let rowDisplay = this.props.rowDisplay;
      let y = this.boundingBox.top + (this.transform.y - previousY);
      transform = { y: y, x: this.boundingBox.left + rowDisplay.cellsX[newIndex], scale: rowDisplay.cellsWidth[newIndex] / this.dragComponentProps.width, time: 200 };
    }

    this.setState({ cellsOpacity });

    return transform;
  }

  didDrop() {
    let cellsOpacity = this.state.cellsOpacity;
    // for (let cellId in this.state.cellsOpacity) {
    //   cellsOpacity[cellId] = 1;
    // }
    cellsOpacity[this.dragComponentProps.cell.id] = 1;
    this.setState({ cellsOpacity });
    // this.props.resetOffering();
  }

  onDragEnter(dragPlugin) {
    this.currentDragOverCell = -1;
    this.dragComponentProps = dragPlugin.reactComponent.props;
    this.boundingBox = this.DOMNode.getBoundingClientRect();
    this._onTapMoveBound = this.onTapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this._onTapMoveBound);
    this._onTapEndBound = this.onTapEnd.bind(this);
    document.body.addEventListener(tapEvents.end, this._onTapEndBound);
  }

  onTapEnd() {
    this.removeListener();
  }

  onHoverEnd() {
    this.removeListener();
  }

  onDragLeave() {
    this.resetCellsPosition();
    this.removeListener();
  }

  updateCellsIndex(cells) {
    this.cellsIndex = {};
    for (var i = 0, len = cells.length; i < len; i += 1) {
      this.cellsIndex[cells[i].id] = i;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.updateCellsIndex(nextProps.cells);
    this.transform.setPosition(0, nextProps.rowDisplay.y);
    this.transform.setHeight(nextProps.rowDisplay.height);
    this.resetCellsPosition(nextProps.rowDisplay.cellsX);
  }

  componentWillMount() {
    this.updateCellsIndex(this.props.cells);
  }

  componentDidMount() {
    super.componentDidMount();
    let rowDisplay = this.props.rowDisplay || { y: 0, height: 0, cellsX: [], cellsWidth: [] };
    this.transform.setPosition(0, rowDisplay.y);
    this.transform.setHeight(rowDisplay.height);
    this.resetCellsPosition(rowDisplay.cellsX);
  }

  render() {
    let rowDisplay = this.props.rowDisplay;
    return (
      <div className='grid-row'>
        {
          this.props.cells.map((cell, cellIndex) => {
            let index = this.cellsIndex[cell.id];
            return (
              <GridElement
                gridId={this.props.gridId}
                opacity={this.state.cellsOpacity[cell.id]}
                x={this.state.cellsX[index]}
                width={rowDisplay.cellsWidth[index]}
                height={rowDisplay.height}
                rowId={this.props.id}
                rowIndex={this.props.index}
                key={cell.id}
                index={index}
                cell={cell} >
                <div className='cell' key={'cell' + cell.id} style={ {width: '100%', height: '100%'} }>{cell.content}</div>
              </GridElement>
            );
          })
        }
      </div>
    );
  }
}

export default GridRow;
