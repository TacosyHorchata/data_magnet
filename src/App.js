import React, { useState } from 'react';
import './App.css'
import axios from 'axios';

function App() {
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
    }
  
    setIsLoading(false);
  };
  

  const isAddButtonDisabled = searchFields.length >= 10;


  return (
    <div class="container">
    <h1>Data Magnet 🧲 <i>Beta 1.0</i></h1>
    <h3>Data Magnet te permite extraer datos relevantes de tus documentos de manera sencilla y rápida. 
      Ahorrando interminables horas de captura y papeleo.
    </h3>
    <p>
      1. Sube tu archivo.
      <br/>2. Especifica los datos que estás buscando.
      <br/>3. Agrega descripciónes a cada dato para que Data Magnet encuentre mejores resultados.
      <br/>4. Exporta en formato CSV o JSON.
      <br/>
      <br/><i>Convierte multiples archivos simultaneamente(Proximamente)</i>
      <br/><i>Guarda los datos que deseas extraer en tus "Asistentes"(Proximamente)</i>
      <br/><i>Conecta a Google Sheets o a través de la API (Proximamente)</i>
      

      
      </p>
      <div className='row'>
        <div className='col'>
          <form onSubmit={handleSubmit} id="searchForm" onDrop={handleFileDrop} encType="multipart/form-data">
            <label htmlFor="fileInput">Click to Upload Files or Drag & Drop Here</label>
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
                  <button type="button" onClick={() => removeInputField(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addInputField} disabled={isAddButtonDisabled}>
              Agrega datos
            </button>
          
            <button type="submit" disabled={isLoading}>Convertir</button>
            {isLoading && <p>Extrayendo datos, no cierre esta pestaña</p>}
            
          </form>
      </div>
        <div className='col'>
          <h2>Datos Extraídos</h2>
          {
              Object.keys(extractedData).map((key, index) => (
                <div key={index}>
                  <strong>{key}: </strong>
                  {typeof extractedData[key] === 'object' ? (
                    <div>
                      {Object.keys(extractedData[key]).map((innerKey, innerIndex) => (
                        <label key={innerIndex}>
                          {innerKey}: {extractedData[key][innerKey]}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <label>{extractedData[key]}</label>
                  )}
                </div>
              ))
            }
        </div>
      </div>
      <br/>
      <br/>
      <br/>
      <br/>
    </div>
  );
};

export default App;


