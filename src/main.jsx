import React from 'react';
import Grid from 'components/Grid';
import './style.less';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grid1: this.generateRowsContent('grid1'),
      grid2: []
    };
  }

  generateRowsContent(gridId) {
    let rows = [];

    for (let i = 0; i < 8; i += 1) {
      let row = { cells: [], id: gridId + '-row-' + i };
      rows.push(row);

      for (let j = 0; j < 5; j += 1) {
        let width = Math.floor(Math.random() * 400 + 200);
        let height = Math.floor(Math.random() * 400 + 200);
        row.cells.push({ content: 'cell' + (i * 4 + j), width: width, height: height, id: gridId + (i * 50 + j) });
      }
    }

    return rows;
  }

  createRowWith(gridToId, newRowIndex, gridFromId, rowIndex, cellIndex) {
    console.log('[createRowWith]', gridToId, newRowIndex, gridFromId, rowIndex, cellIndex);
    let gridFrom = this.state[gridFromId];
    let initialRow = gridFrom[rowIndex];
    let cell = initialRow.cells.splice(cellIndex, 1)[0];

    let gridTo = this.state[gridToId];
    let row = { cells: [cell] };
    gridTo.splice(newRowIndex, 0, row);

    row.id = gridToId + '-row-' + Date.now(); // lol

    if (initialRow.cells.length === 0) {
      let index = gridFrom.indexOf(initialRow);
      gridFrom.splice(index, 1);
    }

    let state = {};
    state[gridToId] = gridTo;
    state[gridFromId] = gridFrom;
    this.setState(state);
    return row;
  }

  cellsShift(gridId, rowIndex, cell1Index, cell2Index) {
    console.log('[cellsShift]', rowIndex, cell1Index, cell2Index);
    let array = this.state[gridId];
    let row = array[rowIndex];
    let cell1 = row.cells.splice(cell1Index, 1)[0];
    row.cells.splice(cell2Index, 0, cell1);

    let state = {};
    state[gridId] = array;
    this.setState(state);
  }

  changeCellRow(grid1Id, row1Index, cell1Index, grid2Id, row2Index, cell2Index) {
    console.log('[changeCellRow]', grid1Id, row1Index, cell1Index, grid2Id, row2Index, cell2Index);
    let state = {};
    let grid = this.state[grid1Id];
    let initialRow = grid[row1Index];
    if (!initialRow) { return; }
    let cell = initialRow.cells.splice(cell1Index, 1)[0];
    if (!cell) { return; }

    if (grid1Id === grid2Id) {
      grid[row2Index].cells.splice(cell2Index, 0, cell);
      if (initialRow.cells.length === 0) {
        grid.splice(row1Index, 1);
      }
    } else{
      if (initialRow.cells.length === 0) {
        grid.splice(row1Index, 1);
      }

      let grid2 = this.state[grid2Id].concat();
      grid2[row2Index].cells.splice(cell2Index, 0, cell);
      state[grid2Id] = grid2;
    }

    state[grid1Id] = grid;
    this.setState(state);
  }

  render() {
    this.grids = [];
    return (
      <div className='main'>
        <div className='grid grid1'>
          <Grid rows={this.state.grid1}
            id='grid1'
            key='grid1'
            createRowWith={this.createRowWith.bind(this)}
            cellsShift={(rowIndex, cell1Index, cell2Index) => this.cellsShift('grid1', rowIndex, cell1Index, cell2Index)}
            changeCellRow={this.changeCellRow.bind(this)} />
        </div>

        <div className='grid grid2'>
          <Grid rows={this.state.grid2}
            id='grid2'
            key='grid2'
            createRowWith={this.createRowWith.bind(this)}
            cellsShift={(rowIndex, cell1Index, cell2Index) => this.cellsShift('grid2', rowIndex, cell1Index, cell2Index)}
            changeCellRow={this.changeCellRow.bind(this)} />
        </div>
      </div>
    )
  }
}

export default Main;
