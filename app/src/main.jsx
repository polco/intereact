import React from 'react';
import Grid from 'components/Grid';
import Moodboard from 'components/Moodboard';
import MenuBar from 'components/MenuBar';
import Promise from 'bluebird';
import './style.less';

var URL = window.URL || window.webkitURL;

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grid1: [],
      grid2: [],
      moodboard1: []
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

  loadImage(file) {
    return new Promise(function(resolve, reject) {
      // let reader = new FileReader();

      // reader.onload = (evt) => {
        let image = new Image();
        image.onload = () => {
          resolve(image);
        };

        image.onerror = function (e) {
          console.log('error while loading the image', src, e);
          reject(e);
        }

        image.src = URL.createObjectURL(file);
      // };

      // reader.onerror = function (e) {
      //   console.log('error while reasing the image', src, e);
      //   reject(e);
      // }

      // reader.readAsDataURL(file);
    });
  }

  loadRow(imageLoaders, index, gridId, grid) {
    Promise.all(imageLoaders).then((images) => {
      let now = Date.now(); // lol
      let newRow = { cells: [], id: gridId + '-row-' + now+ index };

      for (let i = 0; i < images.length; i += 1) {
        let image = images[i];
        newRow.cells.push({
          backgroundImage: image.src,
          width: image.width,
          height: image.height,
          id: gridId + '-cell-' + (index * 50 + i) + now
        });
      }

      grid.splice(index, 0, newRow);

      let state = {};
      state[gridId] = grid;
      this.setState(state);
    });
  }

  loadRowAt(imageLoaders, index, gridId, grid, cellIdFrom) {
    Promise.all(imageLoaders).then((images) => {
      let now = Date.now(); // lol
      let row = grid[index];

      let spliceParams = [cellIdFrom, 0];
      for (let i = 0; i < images.length; i += 1) {
        let image = images[i];
        spliceParams.push({
          backgroundImage: image.src,
          width: image.width,
          height: image.height,
          id: gridId + '-cell-' + (index * 50 + i) + now
        });
      }

      row.cells.splice.apply(row.cells, spliceParams);

      let state = {};
      state[gridId] = grid;
      this.setState(state);
    });
  }

  createNewCellsAt(gridId, files, rowId, cellIdFrom) {
    let grid = this.state[gridId];
    let imageLoaders = [];
    for (let i = 0; i < files.length; i += 1) {
      let file = files[i];

      if (file.type.match('image.*')) {
        imageLoaders.push(this.loadImage(file));
      }
    }

    this.loadRowAt(imageLoaders, rowId, gridId, grid, cellIdFrom);
  }

  createNewCells(gridId, files, rowIndex) {
    let grid = this.state[gridId];
    let imageLoaders = [];
    let rows = [imageLoaders];
    rowIndex = rowIndex || 0;
    for (let i = 0; i < files.length; i += 1) {
      let file = files[i];

      if (file.type.match('image.*')) {
        imageLoaders.push(this.loadImage(file));

        if (imageLoaders.length === 5 && i !== files.length - 1) {
          imageLoaders = [];
          rows.push(imageLoaders);
        }
      }
    }

    for (let i = 0; i < rows.length; i += 1) {
      this.loadRow(rows[i], rowIndex + i, gridId, grid);
    }
  }

  createRowWith(gridToId, newRowIndex, gridFromId, rowIndex, cellIndex) {
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
    let array = this.state[gridId];
    let row = array[rowIndex];
    let cell1 = row.cells.splice(cell1Index, 1)[0];
    row.cells.splice(cell2Index, 0, cell1);

    let state = {};
    state[gridId] = array;
    this.setState(state);
  }

  selecteFiles(gridId, e) {
    console.log('selecteFiles')
    this.createNewCells(gridId, e.target.files);
  }

  changeCellRow(grid1Id, row1Index, cell1Index, grid2Id, row2Index, cell2Index) {
    let state = {};
    let grid = this.state[grid1Id];
    let initialRow = grid[row1Index];
    if (!initialRow) { return console.error(initialRow); }
    let cell = initialRow.cells.splice(cell1Index, 1)[0];
    if (!cell) { return console.error(initialRow); }

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

  moveItem(item, from, to) {
    let state = {};

    if (from.type === 'scrapbook') {
      let elementProps = from.element.props;
      let grid = this.state[elementProps.gridId];
      let row = grid[elementProps.rowIndex];
      row.cells[elementProps.index];

      if (row.cells.length === 1) {
        grid.splice(elementProps.rowIndex, 1)
      } else {
        row.cells.splice(elementProps.index, 1);
      }

      state[elementProps.gridId] = grid;
    } else if (from.type === 'moodboard') {
      let moodboard = this.state[from.id];
      for (let i = 0; i < moodboard.length; i += 1) {
        if (moodboard[i].id === item.id) {
          moodboard.splice(i, 1);
          break;
        }
      }
      state[from.id] = moodboard;
    } else {
      return console.error('what did you do ?! do not know where that stuff is from');
    }

    if (to.type === 'scrapbook') {
      let now = Date.now();
      let grid = this.state[to.id];
      let rowIndex = to.hasOwnProperty('rowIndex') ? to.rowIndex : grid.length
      let row = grid[rowIndex];
      if (!row) {
        row = { cells: [], id: to.id + '-row-' + now + rowIndex };
        grid.splice(rowIndex, 0, row);
      }

      let cellIndex = to.hasOwnProperty('cellIndex') ? to.cellIndex : row.cells.length
      row.cells.splice(cellIndex, 0, {
        backgroundImage: item.content.backgroundImage,
        width: item.content.width,
        height: item.content.height,
        id: item.id
      });
      state[to.id] = grid;
      this.setState(state);
      return row;
    } else if (to.type === 'moodboard') {
      let moodboard = this.state[to.id];
      moodboard.push(item);
      state[to.id] = moodboard;
      this.setState(state);
    } else {
      return console.error('what did you do ?! do not know where that stuff is going');
    }
  }

  transformItem(from, what, transform) {
    let state = {};

    if (from.type === 'moodboard') {
      let moodboard = this.state[from.id];

      for (let i = 0; i < moodboard.length; i += 1) {
        if (moodboard[i].id === what.itemId) {
          let item = moodboard[i];
          item.x = transform.x;
          item.y = transform.y;

          moodboard[i] = moodboard[moodboard.length - 1];
          moodboard[moodboard.length - 1] = item;
          break;
        }
      }


      state[from.id] = moodboard;
    } else {
      return console.error('it is not allooooowwweed!');
    }

    this.setState(state);
  }

  updateItemDimensions(moodboardId, itemId, width, height, x, y) {
    let state = {};
    let moodboard = this.state[moodboardId];

    for (let i = 0; i < moodboard.length; i += 1) {
      if (moodboard[i].id === itemId) {
        let item = moodboard[i];
        item.width = width;
        item.height = height;
        item.x = x;
        item.y = y;
        break;
      }
    }

    state[moodboardId] = moodboard;
    this.setState(this.state);
  }

  putInFront(moodboardId, itemId) {
    let state = {};
    let moodboard = this.state[moodboardId];

    for (let i = 0; i < moodboard.length; i += 1) {
      if (moodboard[i].id === itemId) {
        let item = moodboard.splice(i, 1)[0];
        moodboard.push(item);
        break;
      }
    }

    state[moodboardId] = moodboard;
    this.setState(this.state);
  }

  openFileSelect(gridId) {
    this.refs['input-' + gridId].click();
  }

  render() {
    this.grids = [];
    return (
      <div className='sensu'>
        <MenuBar />
        <div className='main'>
          <div className='folder'></div>
          <div className='grid grid1'>
            <div className='header'>Scrapbook 1<div className='close-btn'></div></div>
            <Grid rows={this.state.grid1}
              onTap={() => { this.openFileSelect('grid1')}}
              id='grid1'
              key='grid1'
              moveItem={this.moveItem.bind(this)}
              createNewCellsAt={this.createNewCellsAt.bind(this)}
              createNewCells={this.createNewCells.bind(this)}
              createRowWith={this.createRowWith.bind(this)}
              cellsShift={(rowIndex, cell1Index, cell2Index) => this.cellsShift('grid1', rowIndex, cell1Index, cell2Index)}
              changeCellRow={this.changeCellRow.bind(this)} />
            <input ref='input-grid1' type='file' accept="image/*"  name='uploads[]' multiple onChange={(event) => this.selecteFiles('grid1', event)} />
          </div>

          <div className='grid grid2'>
            <div className='header'>Scrapbook 2<div className='close-btn'></div></div>
            <Grid rows={this.state.grid2}
              id='grid2'
              key='grid2'
              onTap={() => { this.openFileSelect('grid2')}}
              moveItem={this.moveItem.bind(this)}
              createNewCellsAt={this.createNewCellsAt.bind(this)}
              createNewCells={this.createNewCells.bind(this)}
              createRowWith={this.createRowWith.bind(this)}
              cellsShift={(rowIndex, cell1Index, cell2Index) => this.cellsShift('grid2', rowIndex, cell1Index, cell2Index)}
              changeCellRow={this.changeCellRow.bind(this)} />
            <input ref='input-grid2' type='file' accept="image/*" name='uploads[]' multiple onChange={(event) => this.selecteFiles('grid2', event)} />
          </div>

          <div className='moodboard-container'>
            <div className='header'>Moodboard<div className='close-btn'></div></div>
            <Moodboard items={this.state.moodboard1}
              id='moodboard1'
              putInFront={this.putInFront.bind(this)}
              updateItemDimensions={this.updateItemDimensions.bind(this)}
              moveItem={this.moveItem.bind(this)}
              transformItem={this.transformItem.bind(this)}
             />
          </div>
        </div>
      </div>
    )
  }
}

export default Main;



