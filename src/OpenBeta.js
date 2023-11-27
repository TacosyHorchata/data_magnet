import React, { useState } from 'react';
import './OpenBeta.css'
import axios from 'axios';

const OpenBeta = () => {
  const [searchFields, setSearchFields] = useState([{ key: '', description: '' }]);
  const [files, setFiles] = useState([]);
  const [extractedData, setExtractedData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const searchObject = searchFields.reduce((acc, curr) => {
      if (curr.key !== '') {
        acc[curr.key] = curr.description;
      }
      return acc;
    }, {});

    console.log('Search Object:', searchObject);
    console.log('Uploaded Files:', files);

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

    setIsLoading(false);
  };


  const isAddButtonDisabled = searchFields.length >= 10;


  return (
    <div className="container-openbeta OpenBeta">
      <h1>Data Magnet 🧲 <i>Beta 1.0</i></h1>
      <h3>Data Magnet allows you to extract relevant data from your documents easily and quickly.
        Saving endless hours of manual data entry and paperwork.
      </h3>
      <p>
        1. Upload your PDF file.
        <br />2. Specify the data you are looking for.
        <br />3. Add descriptions to each data for better results.
        <br />4. Export in CSV or JSON format.
        <br />
        <br /><i>Convert multiple files simultaneously (Coming Soon)</i>
        <br /><i>Upload images or .docx(Coming Soon)</i>
        <br /><i>Save the data you wish to extract in your "Assistants" (Coming Soon)</i>
        <br /><i>Connect to Google Sheets or via API (Coming Soon)</i>
      </p>
      <div className='row'>
        <div className='col'>
          <form onSubmit={handleSubmit} id="searchForm" onDrop={handleFileDrop} encType="multipart/form-data">
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
                  <button type="button" onClick={() => removeInputField(index)}
                  style={{backgroundColor:'red'}}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addInputField} disabled={isAddButtonDisabled}>
              Add Data
            </button>

            <button type="submit" disabled={isLoading} style={{backgroundColor:'blue', width:'10vw'}}>Convert</button>
            {isLoading && <p>Extracting data, this make take a while, please do not close this tab...</p>}

          </form>
        </div>
        <div className='col'>
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
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default OpenBeta;
