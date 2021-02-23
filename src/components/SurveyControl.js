import React from 'react';
import NewSurveyForm from './NewSurveyForm';
import SurveyList from './SurveyList';
import SurveyDetail from './SurveyDetail';
import EditSurveyForm from './EditSurveyForm';
import { connect } from 'react-redux';
import { withFirestore, isLoaded } from 'react-redux-firebase'
import PropTypes from "prop-types";
import * as a from './../actions';

class SurveyControl extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedSurvey: null,
      editing: false
    };
  }

  handleClick = () => {
    if (this.state.selectedSurvey != null) {
      this.setState({
        selectedSurvey: null,
        editing: false
      });
    } else {
      const { dispatch } = this.props;
      const action = a.toggleForm();
      dispatch(action);
    }
  }

  handleAddingNewSurveyToList = () => {
    const { dispatch } = this.props;
    const action = a.toggleForm();
    dispatch(action);
  }

  handleChangingSelectedSurvey = (id) => {
    this.props.firestore.get({collection: 'surveys', doc: id}).then((survey) => {
      const firestoreSurvey = {
        names: survey.get("names"),
        location: survey.get("location"),
        issue: survey.get("issue"),
        id: survey.id
      }
      this.setState({selectedSurvey: firestoreSurvey });
    });
  }

  handleEditClick = () => {
    this.setState({editing: true});
  }

  handleEditingSurveyInList = () => {
    this.setState({
      editing: false,
      selectedSurvey: null
    });
  }

  handleDeletingSurvey = (id) => {
    this.props.firestore.delete({collection: 'surveys', doc: id});
    this.setState({selectedSurvey: null});
  }

  render(){
    //add an instance of the Google provider object
    const provider = new this.props.firebase.auth.GoogleAuthProvider();
    //sign in by redirecting to sign-in page
    const auth = this.props.firebase.auth().signInWithRedirect(provider);
    if (!isLoaded(auth)) {
      return (
        <>
          <h1>Loading...</h1>
        </>
      )
    }
    if ((isLoaded(auth)) && (auth.currentUser == null)) {
      return (
        <>
          <h1>You must be signed in to access FuzzBeed.</h1>
        </>
      )
    }
    if ((isLoaded(auth)) && (auth.currentUser != null)) {
      let currentlyVisibleState = null;
      let buttonText = null;
      if (this.state.editing ) {
        currentlyVisibleState = <EditSurveyForm survey = {this.state.selectedSurvey} onEditSurvey = {this.handleEditingSurveyInList} />
        buttonText = "Return to Survey List";
      } else if (this.state.selectedSurvey != null) {
        currentlyVisibleState =
        <SurveyDetail
          survey = {this.state.selectedSurvey}
          onClickingDelete = {this.handleDeletingSurvey}
          onClickingEdit = {this.handleEditClick} />
        buttonText = "Return to Survey List";
      } else if (this.props.formVisibleOnPage) {
        currentlyVisibleState = <NewSurveyForm onNewSurveyCreation={this.handleAddingNewSurveyToList}  />;
        buttonText = "Return to Survey List";
      } else {
        currentlyVisibleState = <SurveyList surveyList={this.props.masterSurveyList} onSurveySelection={this.handleChangingSelectedSurvey} />;
        buttonText = "Add Survey";
      }
      return (
        <React.Fragment>
          {currentlyVisibleState}
          <button onClick={this.handleClick}>{buttonText}</button>
        </React.Fragment>
      );
    } //else {
        //do "You must be signed in" magic here.
    //}
  }

}

SurveyControl.propTypes = {
  masterSurveyList: PropTypes.object
};

const mapStateToProps = state => {
  return {
    masterSurveyList: state.masterSurveyList,
    formVisibleOnPage: state.formVisibleOnPage
  }
}

SurveyControl = connect(mapStateToProps)(SurveyControl);

export default withFirestore(SurveyControl);