import React, { Component } from 'react';
import {Redirect} from 'react-router';

export class SearchBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      enteredText:'',
      searchEntered:false
    };
    this.handleChange = this.handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidUpdate(nextProps){
    if(this.state.searchEntered === true){
    this.setState({searchEntered:false});
    }
  }
  handleChange (evt){
    this.setState({
      enteredText:evt.target.value
    });
  }

  onSubmit (evt){
    evt.preventDefault();
    this.setState({searchEntered:true});
    console.log(this.state)
  }
  render() {
    //console.log(this.state.enteredText)
    return(<div>
      { this.state.searchEntered && <Redirect to={"/player/"+this.state.enteredText} />}
      <form onSubmit={this.onSubmit} className="flex submittion">
          <label className = 'tag_label flex'> Tag:
            <input type="text"
            value={this.state.enteredText}
            onChange={this.handleChange}
            id="tag"
            className="tag_text_input"/>
          </label>
        <input type="submit" value="Go!" className="submit"/>
      </form>
    </div>);
  }
}

export default SearchBar;
