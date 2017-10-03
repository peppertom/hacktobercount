import {h, Component} from 'preact';
import Emojify from 'react-emojione';
import queryString from 'query-string';
import Form from '../Form/Form';
import FormInput from '../FormInput/FormInput';
import FormSubmit from '../FormSubmit/FormSubmit';
import PullRequestList from '../PullRequestList/PullRequestList';
import PullRequestListItem from '../PullRequestListItem/PullRequestListItem';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import {UserNotFoundError, GitHubAPIError} from '../utils/errors';
import './App.css';

const API_URL = 'https://api.github.com/search/issues';

class App extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      isLoading: false,
      error: null,
      pullRequests: []
    };
  }

  onInputChange(e) {
    if (e.key === 'Enter') {
      this.getPullRequests();
      return;
    }

    this.setState({username: e.target.value});
  }

  getPullRequests() {
    this.setState({
      isLoading: true,
      error: null,
      pullRequests: []
    });

    const queryParams = {
      type: 'pr', // filter results to pull requests,
      q: `is:pr author:${this.state.username} is:public created:2017-10-01..2017-10-31 sort:created-desc`
    };

    fetch(`${API_URL}?${queryString.stringify(queryParams)}`, {cache: 'default'})
      .then(response => {
        this.setState({isLoading: false});

        if (!response.ok) {
          switch (response.status) {
            case 422:
              throw new UserNotFoundError(this.state.username);
            default:
              throw new GitHubAPIError();
          }
        }

        return response.json();
      })
      .then(data => {
        this.setState({pullRequests: data.items.slice(0, 4)});
      })
      .catch(err => {
        this.setState({error: err.message});
        console.error(err);
      });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.getPullRequests();
  }

  render() {
    return (
      <div className="App">
        <div className="App__inner">
          <h1 className="App__title">{<Emojify style={{width: 64, height: 64}}>:jack_o_lantern:</Emojify>}
            Hacktobercount</h1>

          <p className="App__lead">Check your Hacktoberfest progress easily.</p>

          <Form className="Form" onSubmit={this.handleSubmit.bind(this)}>
            <p className="Form__instruction">Just insert your GitHub username in this input and press enter to fetch
              your PR count in October.</p>

            <FormInput onKeyUp={this.onInputChange.bind(this)} value={this.state.username}/>

            <FormSubmit text="Let's see!"
                        onClick={this.handleSubmit.bind(this)}
                        disabled={this.state.isLoading || this.state.username.length < 1}/>
          </Form>

          {this.state.error ? <ErrorMessage>{this.state.error}</ErrorMessage> : null}

          {this.state.pullRequests.length ?
            <PullRequestList>
              {this.state.pullRequests.map(pullRequest => <PullRequestListItem {...pullRequest}/>)}
            </PullRequestList>
            :
            null}
        </div>
      </div>
    );
  }
}

export default App;
