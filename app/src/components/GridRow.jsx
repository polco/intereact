import React from 'react';
import PluggableComponent from 'components/PluggableComponent';
import { tapEvents, getTap } from 'spur-taps';
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

      if (this.dragComponentProps && this.dragComponentProps.rowId === this.props.id && this.dragComponentProps.gridId === this.props.gridId) { // dragging on same row
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

  willDrop(dragPlugin) {
    this.removeListener();
    let transform;
    let dragComponentProps = dragPlugin.reactComponent.props;
    let cellsOpacity = this.state.cellsOpacity;

    if (!this.boundingBox) {
      this.boundingBox = this.DOMNode.getBoundingClientRect();
    }

    if (dragPlugin.source === 'moodboard') {
      let newIndex;
        if (this.isInFirstHalf) {
          newIndex = 0;
        } else {
          newIndex = this.currentDragOverCell + 1;
        }
      let previousY = this.transform.y;
      cellsOpacity[dragComponentProps.id] = 0;
      this.props.moveItem(
        { id: dragComponentProps.id, content: dragComponentProps.item.content },
        { type: 'moodboard', id: dragComponentProps.moodboardId },
        { type: 'scrapbook', id: this.props.gridId, rowIndex: this.props.index, cellIndex: newIndex }
      );
      let rowDisplay = this.props.rowDisplay;
      let y = this.boundingBox.top + (this.transform.y - previousY);
      transform = { y: y, x: this.boundingBox.left + rowDisplay.cellsX[newIndex], scale: rowDisplay.cellsWidth[newIndex] / dragPlugin.reactComponent.transform.width, time: 200 };
    } else if (dragPlugin.source === 'scrapbook') {
      let dragWithinTheGrid = this.props.gridId === dragComponentProps.gridId;
      if (this.props.id === dragComponentProps.rowId && dragWithinTheGrid) {
        let newIndex;
        if (this.isInFirstHalf) {
          newIndex = 0;
        } else if (this.currentDragOverCell < dragComponentProps.index) {
          newIndex = this.currentDragOverCell + 1;
        } else {
          newIndex = this.currentDragOverCell;
        }
        cellsOpacity[dragComponentProps.cell.id] = 0.5;
        if (dragComponentProps.index !== newIndex) {
          this.props.cellsShift(dragComponentProps.rowIndex, dragComponentProps.index, newIndex);
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

        cellsOpacity[dragComponentProps.cell.id] = 0;
        this.props.changeCellRow(dragComponentProps.gridId, dragComponentProps.rowIndex, dragComponentProps.index, this.props.gridId, this.props.index, newIndex);
        let rowDisplay = this.props.rowDisplay;
        let y = this.boundingBox.top + (this.transform.y - previousY);
        transform = { y: y, x: this.boundingBox.left + rowDisplay.cellsX[newIndex], scale: rowDisplay.cellsWidth[newIndex] / dragComponentProps.width, time: 200 };
      }
    } else {
      return console.error('whuuuut');
    }

    this.setState({ cellsOpacity });
    return transform;
  }

  didDrop() {
    let cellsOpacity = this.state.cellsOpacity;
    for (let cellId in cellsOpacity) {
      cellsOpacity[cellId] = 1;
    }
    this.setState({ cellsOpacity });
  }

  onDragEnter(dragPlugin) {
    this.dragComponentProps = dragPlugin.reactComponent.props;
    this.currentDragOverCell = -1;
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

  onNativeDrop(e) {
    let newIndex;
    if (this.isInFirstHalf) {
      newIndex = 0;
    } else {
      newIndex = this.currentDragOverCell + 1;
    }
    this.props.createNewCellsAt(this.props.gridId, e.dataTransfer.files, this.props.index, newIndex);
  }

  onNativeDragEnter() {
    this.currentDragOverCell = -1;
    this.boundingBox = this.DOMNode.getBoundingClientRect();
  }

  onNativeDragOver(e) {
    this.onTapMove(e);
  }

  onNativeDragLeave() {
    this.resetCellsPosition();
  }

  updateCellsIndex(cells) {
    this.cellsIndex = {};
    for (var i = 0, len = cells.length; i < len; i += 1) {
      this.cellsIndex[cells[i].id] = i;
    }
  }

  updateDisplay(props) {
    this.transform.setPosition(0, props.rowDisplay.y);
    this.transform.setHeight(props.rowDisplay.height);
    this.resetCellsPosition(props.rowDisplay.cellsX);
    this.transform.setOpacity(props.opacity !== undefined ? props.opacity : 1);
  }

  componentWillReceiveProps(nextProps) {
    this.updateCellsIndex(nextProps.cells);
    this.updateDisplay(nextProps);
    this.DOMNode.style.transition = 'transform 200ms linear';
  }

  componentWillMount() {
    this.updateCellsIndex(this.props.cells);
  }

  componentDidMount() {
    super.componentDidMount();
    // let rowDisplay = this.props.rowDisplay || { y: 0, height: 0, cellsX: [], cellsWidth: [] };
    // this.transform.setPosition(0, rowDisplay.y);
    // this.transform.setHeight(rowDisplay.height);
    // this.resetCellsPosition(rowDisplay.cellsX);
    this.updateDisplay(this.props);
  }

  render() {
    let rowDisplay = this.props.rowDisplay;
    return (
      <div className='grid-row'>
        {
          this.props.cells.map((cell, cellIndex) => {
            let index = this.cellsIndex[cell.id];
            let style = {
              backgroundSize: '100% 100%',
              width: '100%',
              height: '100%'
            };

            if (cell.backgroundImage) {
              style.backgroundImage ="url('" + cell.backgroundImage + "')";
            }
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
                id={cell.id}
                cell={cell} >
                <div
                  className='cell'
                  key={'cell' + cell.id}
                  style={ style }>
                  {cell.content}
                </div>
              </GridElement>
            );
          })
        }
      </div>
    );
  }
}

export default GridRow;
