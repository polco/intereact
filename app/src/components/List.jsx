import 'styles/List.less';
import React from 'react';
import ReactDOM from 'react-dom';
import IScroll from 'iscroll/build/iscroll-probe'

export class DefaultListRow extends React.Component {
  constructor(props) {
    super(props);
    this.y = 0;
  }
  render() {
    return (
      <div className='list-row-component'>
        {this.props.item}
      </div>
    )
  }
}

export class List extends React.Component {
  constructor(props) {
    super(props);
    this.height = 0;
    this.lastIndex = -1;
    this.currentIndex = 0;
    this.firstVisibleRowIndex = 0;
    this.lastVisibleRow = 0;

    this.state = {
      neededRows: 0
    };
  }

  positionRows(force) {
    var scrollTop = -this.iscroll.y;
    if (scrollTop <= 0) {
      scrollTop = 0;
    } else if (scrollTop >= -this.iscroll.maxScrollY) {
      scrollTop = -this.iscroll.maxScrollY;
    }

    // if (this.lastIndex == this.currentIndex && !force) {
    //   return;
    // }

    this.lastIndex = this.currentIndex;
    var neededRows = this.state.neededRows;

    var rowIndex = this.currentIndex % neededRows;
    var rowsState = {};
    var firstVisibleIndex = this.props.items.length;

    for (var i = 0; i < neededRows; i += 1) {
      var itemIndex = this.currentIndex + i - rowIndex;
      if (i < rowIndex) {
        itemIndex += neededRows;
      }

      var item = this.props.items[itemIndex];
      var ref = this.refs['row' + i];
      var domRow = ReactDOM.findDOMNode(ref);
      // if (item && ref.props.item === item) { continue; }

      if (item) {
        rowsState['row' + i] = item;
        if (ref.y + domRow.clientHeight >= scrollTop && itemIndex < firstVisibleIndex) {
          firstVisibleIndex = itemIndex;
        }
      }
    }
    console.log('currentIndex', this.currentIndex)
    this.currentIndex = firstVisibleIndex;
    this.setState(rowsState);
  }

  componentWillReceiveProps(nextProps) {
    this.adjustLayout(nextProps.items, nextProps.rowMinHeight);
  }

  adjustLayout(items, rowMinHeight) {
    this.height = this.refs.listContainer.clientHeight;
    var itemCount = items.length;

    var neededRows = Math.min(Math.ceil((this.height + 1) / rowMinHeight) + 2, itemCount);
    if (this.state.neededRows < neededRows) {
      this.setState({ neededRows: neededRows });
    }

    var listContent = this.refs.listContent;
    listContent.style.height = rowMinHeight * itemCount + 'px';
    this.iscroll.refresh();
    this.positionRows(true);
  }

  componentDidUpdate() {
    var scrollTop = -this.iscroll.y;
    var neededRows = this.state.neededRows;
    var rowIndex = this.currentIndex % neededRows;

    var firstRow = this.refs['row' + rowIndex];
    var currentHeight = firstRow.y;


    for (var i = 0; i < neededRows; i += 1) {
      var itemIndex = this.currentIndex + i - rowIndex;
      if (i < rowIndex) {
        itemIndex += neededRows;
      }

      var ref = this.refs['row' + i];
      var domRow = ReactDOM.findDOMNode(ref);
      var domRowStyle = domRow.style;

      if (this.state['row' + i]) {
        ref.y = currentHeight;
        domRowStyle.top = currentHeight + 'px';
        domRowStyle.display = null;
        currentHeight += domRow.clientHeight;
      } else {
        domRowStyle.display = 'none';
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.adjustLayout.bind(this));
    var iscroll = this.iscroll = new IScroll(this.refs.listContainer, {
      mouseWheel: true, probeType: 3, interactiveScrollbars: true, scrollbars: true
    });
    iscroll.on('scroll', () => {
      this.positionRows();
    });

    window.setTimeout(() => {
      this.adjustLayout(this.props.items, this.props.rowMinHeight);
    }, 0);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustLayout);
    this.iscroll.destroy()
    this.iscroll = null;
  }

  render() {
    var rows = [];
    for (var i = 0; i < this.state.neededRows; i += 1) {
      var row = (<this.props.ListRow key={i} ref={'row' + i} item={this.state['row' + i]} />);
      rows.push(row);
    }

    return (
      <div className='list' ref="listContainer">
        <div className='list-content' ref="listContent">
          {rows}
        </div>
      </div>
    )
  }
}

List.propTypes = {
  items: React.PropTypes.array,
  rowMinHeight: React.PropTypes.number
};
