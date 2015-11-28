import React from 'react';
import Grid from 'components/Grid';
import './style.less';

class Main extends React.Component {
  constructor(props) {
    super(props);

    let rows = this.rows = [];

    for (let i = 0; i < 5; i += 1) {
      let row = { cells: [] };
      rows.push(row);

      for (let j = 0; j < 5; j += 1) {
        let width = Math.floor(Math.random() * 400 + 200);
        let height = Math.floor(Math.random() * 400 + 200);
        row.cells.push({ content: 'cell' + (i * 4 + j), width: width, height: height, id: (i * 50 + j) });
      }
    }
    this.state = { rows: rows };
  }

  createRowWith(newRowIndex, rowIndex, cellIndex) {
    console.log('[createRowWith]', newRowIndex, rowIndex, cellIndex);
    let initialRow = this.state.rows[rowIndex];
    let cell = initialRow.cells.splice(cellIndex, 1)[0];
    this.state.rows.splice(newRowIndex, 0, { cells: [cell] });
    if (initialRow.cells.length === 0) {
      let index = this.state.rows.indexOf(initialRow);
      this.state.rows.splice(index, 1);
    }
    this.setState({ rows: this.state.rows });
  }

  cellsShift(rowIndex, cell1Index, cell2Index) {
    console.log('[cellsShift]', rowIndex, cell1Index, cell2Index);
    let row = this.state.rows[rowIndex];
    let cell1 = row.cells.splice(cell1Index, 1)[0];
    row.cells.splice(cell2Index, 0, cell1);
    this.setState({ rows: this.state.rows });
  }

  changeCellRow(row1Index, cell1Index, row2Index, cell2Index) {
    console.log('[changeCellRow]', row1Index, cell1Index, row2Index, cell2Index);
    let initialRow = this.state.rows[row1Index];
    let cell = initialRow.cells.splice(cell1Index, 1)[0];
    this.state.rows[row2Index].cells.splice(cell2Index, 0, cell);
    if (initialRow.cells.length === 0) {
      this.state.rows.splice(row1Index, 1);
    }
    this.setState({ rows: this.state.rows });
  }


  newRowBefore(rowIndex, rowFrom, cellIndex) {
    // this.state.rows.splice(rowIndex, 0, { cells: [] });
  }

  newRowAfter(rowIndex, rowFrom, cellIndex) {
    // this.state.rows.splice(rowIndex + 1, 0, { cells: [] });
  }

  render() {
    return (
      <Grid rows={this.rows}
        createRowWith={this.createRowWith.bind(this)}
        newRowBefore={this.newRowBefore.bind(this)}
        newRowAfter={this.newRowAfter.bind(this)}
        cellsShift={this.cellsShift.bind(this)}
        changeCellRow={this.changeCellRow.bind(this)} />
    )
  }
}

export default Main;
