import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error tracking service (optional)
    console.error(error, errorInfo);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // Render your custom error page here
      return (
        <div className='main'>
          <h1>Something went wrong, refresh </h1>
            <br/>
            <br/>
            <GoBack/>
        </div>
      );
    }

    // Render the children if there's no error
    return this.props.children;
  }
}

export default ErrorBoundary;


const GoBack = () => {
  
  const naviagte = useNavigate();
  const handleGoBack = () => {
    naviagte(-1);
  };

  return (
    <div className='main'>
      <button onClick={handleGoBack}>←Regresar</button>
    </div>
  );
};
