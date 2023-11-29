import React, { useEffect, useState } from 'react';
import './ClosedBeta.css'
import axios from 'axios';

import { useAuth } from './Context/authContext';
import { useNavigate } from 'react-router-dom'; 

import { database } from './firebase.js';
import { ref, push, update, get } from 'firebase/database';

import logo_bn from './images/logo-lookup-data-magnet-blanco.svg'

// Add this line where you have access to your Firebase app instance

const ClosedBeta = () => {
  const [searchFields, setSearchFields] = useState([{ key: '', description: '' }]);
  const [files, setFiles] = useState([]);
  const [extractedData, setExtractedData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [typeOutput, setTypeOutput] = useState('json')
  const [creditsLeft, setCreditsLeft] = useState("")

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleTypeSelection = (event) =>{
    setTypeOutput(event.target.value)
  }

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newFields = [...searchFields];
    newFields[index][name] = value;
    setSearchFields(newFields);
  };

  const addInputField = () => {
    setSearchFields([...searchFields, { key: '', description: '' }]);
  };

  const removeInputField = (index) => {
    const newFields = [...searchFields];
    newFields.splice(index, 1);
    setSearchFields(newFields);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
  
    if (confirmLogout) {
      logout();
      navigate('/');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userCreditsRef = ref(database, `users/${user.uid}/credits`);
    const snapshot = await get(userCreditsRef);
    const credits = snapshot.val();

    if(credits>=1 || credits===null){

      const searchObject = searchFields.reduce((acc, curr) => {
        if (curr.key !== '') {
          acc[curr.key] = curr.description;
        }
        return acc;
      }, {});

      const formData = new FormData();
      formData.append('file', files[0]); // Assuming one file is being uploaded
      formData.append('output_json', JSON.stringify(searchObject));

      try {
        const processFileResponse = await axios.post('https://camtom-docs-70b844df7cdc.herokuapp.com/process-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if(processFileResponse.data.error){
          alert(processFileResponse.data.error);
          setIsLoading(false);
          return
        }
        const jobId = processFileResponse.data.job_id;
        console.log(processFileResponse.data, jobId)

        let jobStatus = 'PENDING';

        while (jobStatus !== 'finished' && jobStatus !== 'failed' && jobStatus !== 'stopped') {
          const jobStatusResponse = await axios.get(`https://camtom-docs-70b844df7cdc.herokuapp.com/job-status/${jobId}`);
          jobStatus = jobStatusResponse.data.status;
          console.log(jobStatusResponse.data, jobStatus)

          if (jobStatus === 'finished') {
            const jobResultResponse = await axios.get(`https://camtom-docs-70b844df7cdc.herokuapp.com/job-result/${jobId}`);
            const jobResult = jobResultResponse.data.result;
            console.log('Job Result:', jobResult);
            // Handle the successful job result here
            setExtractedData(jobResult);
            
            const currentDate = new Date().toISOString();
            const dataToSave = {
              ...processFileResponse.data.fileData,
              jobResult: jobResult,
              currentDate: currentDate,
            };

            //add request to the requests
            const refRequest = ref(database, `requests/${user.uid}`);
            push(refRequest, dataToSave);

            //update credits
            let updatedData;
            if(credits===null){
              updatedData = {
                credits: 99 // Set 'credits' to a specific value (-1 in this case)
              };
            }else{
              updatedData = {
                credits: credits-1 // Set 'credits' to a specific value (-1 in this case)
              };
            }
            const userUpdateCreditsRef = ref(database, `users/${user.uid}`);
            update(userUpdateCreditsRef, updatedData);
            setCreditsLeft(creditsLeft-1);
          } else if (jobStatus === 'FAILED' || jobStatus === 'STOPPED') {
            // Handle failure or stopped job here
            console.error('Job failed or stopped.');
          } else {
            // Job is still in progress, wait for some time before checking again
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
          }
        }

      } catch (error) {
        console.error('Error:', error);
        // Display error if there's an issue
        alert('Error occurred while processing. Please try again.');
      }
    }else{
      alert("Insufficient credits, please contact support")
    }

    setIsLoading(false);
  };

  useEffect(() => {
    async function fetchCredits(){
      const userCreditsRef = ref(database, `users/${user.uid}/credits`);
      const snapshot = await get(userCreditsRef);
      setCreditsLeft(snapshot.val());
    }
    fetchCredits();
    console.log(creditsLeft)
  }, []);

  const isAddButtonDisabled = searchFields.length >= 10;


  return (
    <div className="container-closedBeta ClosedBeta">
      <header class="Header">
          <img onClick={()=>navigate('/')} src={logo_bn} class='brand'/> 
          <nav>
            <ul>
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </nav>
        </header>
      <h1><i>Beta 1.0</i></h1>
      <h3 style={{textAlign:'center'}}>Data Magnet allows you to extract relevant data from your documents easily and quickly.
        Saving endless hours of manual data entry and paperwork.
      </h3>
      <p>
        <b>Instructions:</b>
        <br/>1. Upload your PDF file.
        <br />2. Specify the data you are looking for.
        <br />3. Add descriptions to each data for better results.
        <br />4. Export in CSV or JSON format.
        <br />
        <div className='future-features'>
          <br /><i>Convert multiple files simultaneously (Coming Soon)</i>
          <br /><i>Upload images or .docx(Coming Soon)</i>
          <br /><i>Save the data you wish to extract in your "Assistants" (Coming Soon)</i>
          <br /><i>Connect to Google Sheets or via API (Coming Soon)</i>
          <br/>
          <br/>
        </div>
        <button className='button-convert'><a href="mailto:miguelhaddad485@gmail.com?subject=I%20am%20ready%20to%20unlock%20the%20power%20of%20my%20docs">I am ready to make my company 10X faster</a></button>
      </p>
      <div style={{borderTop:'1px solid grey', paddingTop:'2vw'}} className='row'>
        <div className='col'>
          <form onSubmit={handleSubmit} id="searchForm" onDrop={handleFileDrop} encType="multipart/form-data">
            <h3><i>1. Upload your PDF file:</i></h3>
            <label htmlFor="fileInput">Click to upload your PDF</label>
            <input
              type="file"
              onChange={handleFileInputChange}
              multiple={false}
              style={{ display: 'none' }}
              id="fileInput"
            />
            {files.length > 0 && (
              <div>
                <h4>Uploaded Files:</h4>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <h3><i>2. Specify the data you are looking for.</i></h3>
            <h3><i>3. Add descriptions to each data for better results.</i></h3>
            {searchFields.map((field, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Enter Key"
                  name="key"
                  value={field.key}
                  onChange={(e) => handleInputChange(index, e)}
                />
                <input
                  type="text"
                  placeholder="Enter Description"
                  name="description"
                  value={field.description}
                  onChange={(e) => handleInputChange(index, e)}
                />
                {index > 0 && (
                  <button type="button" className='button-remove' onClick={() => removeInputField(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" className='button-add' onClick={addInputField} disabled={isAddButtonDisabled}>
              Add Fields
            </button>
            <h3><i>4. Export in JSON format.</i></h3>
            <button type="submit" className='button-convert' disabled={isLoading}>Convert to JSON</button>
            {isLoading && <p>Extracting data, this make take a while, please do not close this tab...</p>}

          </form>
        </div>
        {/*<div className='col'>
          <h2>Extracted Data</h2>
          <table>
            <tbody>
              {Object.keys(extractedData).map((key, index) => (
                <tr key={index}>
                  <td>
                    <strong>{key}</strong>
                  </td>
                  <td>
                    {typeof extractedData[key] === 'object' ? (
                      <table>
                        <tbody>
                          {Object.keys(extractedData[key]).map((innerKey, innerIndex) => (
                            <tr key={innerIndex}>
                              <td>{innerKey}</td>
                              <td>{extractedData[key][innerKey]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <label>{extractedData[key]}</label>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                    </div>*/}

        <div className='col'>
          <div className="right-panel">
            <p>Credits: {creditsLeft}</p>
            <h2>Extracted Data</h2>
            <select className="select-dropdown" onChange={(e) => handleTypeSelection(e)}>
              <option value="json" selected>JSON</option>
            </select>
            <div className="code-mockup">
              <pre>
                {/* Check the displayType state and show JSON or Text accordingly */}
                {typeOutput === 'json' ? (
                  Object.keys(extractedData).length === 0 ? ('{}') : (String(extractedData))
                ) : (
                  // Assuming extractedData is an object, you can display [object Object] as text
                  null
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default ClosedBeta;
