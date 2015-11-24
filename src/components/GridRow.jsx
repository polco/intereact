import React from 'react';
import PluggableComponent from 'components/PluggableComponent';
import { tapEvents, getTap } from 'components/tapHelper';
import TapPlugin from 'components/TapPlugin';
import DragPlugin from 'components/DragPlugin';
import DropPlugin from 'components/DropPlugin';
import TransformPlugin from 'components/TransformPlugin';
import './GridRow.less';

class GridElement extends PluggableComponent {
  constructor(props) {
    super(props);

    this.addPlugin(new TapPlugin());
    this.addPlugin(new DragPlugin(this.props.children));
    this.transform = this.addPlugin(new TransformPlugin());

    this.opened = false;
  }

  onLongTap() {
    if (!this.opened) {
      this.open();
    }
  }
  onTap() {
    if (this.opened) {
      this.close();
    } else {
      this.DOMNode.classList.toggle('selected');
    }
  }

  open() {
    if (this.opened) { return; }
    this.transform.style.zIndex = 1;
    this.transform.scaleTo(1.5, 100);
    this.opened = true;
  }

  close() {
    if (!this.opened) { return; }
    this.transform.scaleTo(1, 100).then(() => {
      this.transform.style.zIndex = 0;
    });
    this.opened = false;
  }

  onDragStart() {
    this.close();
    // this.DOMNode.style.opacity = 0.5;
  }

  onDragEnd() {
    // this.DOMNode.style.opacity = 1;
  }

  onTapStart() {
    this.DOMNode.classList.add('pressed');
  }

  onTapEnd() {
    this.DOMNode.classList.remove('pressed');
  }

  onDragEnter(dragPlugin) {
    this.DOMNode.classList.add('hover');
  }

  onDragLeave() {
    this.DOMNode.classList.remove('hover');
  }

  onHoverEnd() {
    this.DOMNode.classList.remove('hover');
  }

  updateComponentDisplay(props) {
    this.transform.setOpacity(props.hasOwnProperty('opacity') ? props.opacity : 1);
    this.transform.setPosition(props.x, 0);
    this.transform.setDimensions(props.width, props.rowHeight);
  }

  componentDidMount() {
    super.componentDidMount();
    this.updateComponentDisplay(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateComponentDisplay(nextProps);
  }

  render() {
    return (<div className='grid-element'>{this.props.children}</div>);
  }
}

const NEW_ROW_GAP = 10;

class GridRow extends PluggableComponent {
  constructor(props) {
    super(props);

    this.addPlugin(new DropPlugin());
    this.transform = this.addPlugin(new TransformPlugin());

    this.state = { cellsX: [], cellsOpacity: {} };
    this.props = { rowDisplay: { cellsX: [], cellsWidth: [], height: 0 } }
    this.cellsIndex = {};
  }

  resetCellsPosition(cellsX) {
    this.setState({ cellsX: cellsX || this.props.rowDisplay.cellsX });
  }

  onTapMove(e) {
    let tap = getTap(e);
    let relativeY = tap.y - this.boundingBox.top;
    if (relativeY < NEW_ROW_GAP) {
      this.props.offerNewRowBefore(this.props.index);
    } else if (relativeY > this.props.rowDisplay.height - NEW_ROW_GAP) {
      this.props.offerNewRowAfter(this.props.index);
    } else {
      let relativeX = tap.x - this.boundingBox.left;
      let rowDisplay = this.props.rowDisplay;
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

      if (this.dragRowIndex === this.props.index) { // dragging on same row
        if (currentDragOverCell === this.dragCellIndex || (currentDragOverCell === this.dragCellIndex - 1 && !this.isInFirstHalf)) {
          return this.resetCellsPosition();
        }
      }

      let cellsX = rowDisplay.cellsX.concat();
      if (this.isInFirstHalf) {
        cellsX[0] += 40;
      } else {
        cellsX[currentDragOverCell] -= 40;
        cellsX[currentDragOverCell + 1] += 40;
      }
      this.setState({ cellsX });
    }
  }

  // willDrop() {
  //   document.body.removeEventListener(tapEvents.move, this._onTapMoveBound);
  //   this._onTapMoveBound = null;
  //   let cellsX, transform;
  //   let rowDisplay = this.props.rowDisplay;

  //   if (this.props.index === this.dragRowIndex) {
  //     cellsX = rowDisplay.cellsX.concat();
  //     if (this.isInFirstHalf) {
  //       for (let i = 0, len = this.dragCellIndex; i < len; i += 1) {
  //         cellsX[i] += this.dragCellWidth;
  //       }
  //       cellsX[this.dragCellIndex] = 0;
  //     } else if (this.currentDragOverCell + 1 < this.dragCellIndex) {
  //       for (let i = this.currentDragOverCell + 1, len = this.dragCellIndex; i < len; i += 1) {
  //         cellsX[i] += this.dragCellWidth;
  //       }
  //       cellsX[this.dragCellIndex] = cellsX[this.currentDragOverCell + 1] - this.dragCellWidth;
  //     } else if (this.currentDragOverCell > this.dragCellIndex) {
  //       for (let i = this.dragCellIndex + 1, len = this.currentDragOverCell + 1; i < len; i += 1) {
  //         cellsX[i] -= this.dragCellWidth;
  //       }
  //       cellsX[this.dragCellIndex] = cellsX[this.currentDragOverCell] + rowDisplay.cellsWidth[this.currentDragOverCell];
  //     }
  //     transform = { x: cellsX[this.dragCellIndex], y: this.boundingBox.top, scale: 1, time: 200 };
  //     this.setState({ cellsX });
  //   } else {
  //     let cells = this.props.cells.concat();
  //     let newIndex;
  //     if (this.isInFirstHalf) {
  //       newIndex = 0;
  //     } else {
  //       newIndex = this.currentDragOverCell + 1;
  //     }

  //     cells.splice(newIndex, 0, this.dragCell);
  //     let newRowDisplay = this.props.computeRowDisplay(cells);
  //     transform = { x: newRowDisplay.cellsX[newIndex], scale: newRowDisplay.cellsWidth[newIndex] / this.dragCellWidth, time: 200 };
  //     // this.props.rowHeightUpdated(this.props.index, oldHeight, this.rowHeight);
  //     this.resetCells(newRowDisplay);
  //   }

  //   transform.y = this.boundingBox.top;
  //   return transform;
  // }

  willDrop() {
    document.body.removeEventListener(tapEvents.move, this._onTapMoveBound);
    this._onTapMoveBound = null;
    let transform;
    let cellsOpacity = {};

    if (this.props.index === this.dragRowIndex) {
      let newIndex;
      if (this.isInFirstHalf) {
        newIndex = 0;
      } else if (this.currentDragOverCell < this.dragCellIndex) {
        newIndex = this.currentDragOverCell + 1;
      } else {
        newIndex = this.currentDragOverCell;
      }
      this.props.cellsShift(this.dragRowIndex, this.dragCellIndex, newIndex);
      transform = { x: this.props.rowDisplay.cellsX[newIndex], y: this.boundingBox.top, scale: 1, time: 200 };
      cellsOpacity[this.dragCellId] = 0.5;
    } else {
      let newIndex;
      if (this.isInFirstHalf) {
        newIndex = 0;
      } else {
        newIndex = this.currentDragOverCell + 1;
      }
      let previousY = this.transform.y;
      this.props.changeCellRow(this.dragRowIndex, this.dragCellIndex, this.props.index, newIndex);
      let rowDisplay = this.props.rowDisplay;
      let y = this.boundingBox.top + (this.transform.y - previousY);
      transform = { y: y, x: rowDisplay.cellsX[newIndex], scale: rowDisplay.cellsWidth[newIndex] / this.dragCellWidth, time: 200 };
      cellsOpacity[this.dragCellId] = 0;
    }

    this.setState({ cellsOpacity });

    return transform;
  }

  didDrop() {
    let cellsOpacity = {};
    cellsOpacity[this.dragCellId] = 1;
    this.setState({ cellsOpacity });
  }

  onDragEnter(dragPlugin) {
    this.currentDragOverCell = -1;
    this.dragCellWidth = dragPlugin.reactComponent.props.width;
    this.dragCellIndex = dragPlugin.reactComponent.props.index;
    this.dragCellId = dragPlugin.reactComponent.props.cell.id;
    this.dragRowIndex = dragPlugin.reactComponent.props.rowIndex;
    this.dragCell = dragPlugin.reactComponent.props.cell;
    this.boundingBox = this.DOMNode.getBoundingClientRect();
    this._onTapMoveBound = this.onTapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this._onTapMoveBound);
  }

  onHoverEnd() {
    document.body.removeEventListener(tapEvents.move, this._onTapMoveBound);
    this._onTapMoveBound = null;
  }

  onDragLeave() {
    this.resetCellsPosition();
    document.body.removeEventListener(tapEvents.move, this._onTapMoveBound);
    this._onTapMoveBound = null;
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
      <div className='grid-row'>{
        this.props.cells.map((cell, cellIndex) => {
          let index = this.cellsIndex[cell.id];
          return (
            <GridElement
              opacity={this.state.cellsOpacity[cell.id]}
              x={this.state.cellsX[index]}
              width={rowDisplay.cellsWidth[index]}
              rowHeight={rowDisplay.height}
              rowIndex={this.props.index}
              key={cell.id}
              index={index}
              cell={cell} >
              <div className='cell' key={'cell' + cell.id} style={ {width: '100%', height: '100%'} }>{cell.content}</div>
            </GridElement>
          );
        })
      }</div>
    );
  }
}

export default GridRow;
