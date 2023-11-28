import React, { useState } from 'react';
import { database } from './firebase.js';
import { ref, push } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import logo_bn from './images/logo-lookup-data-magnet-blanco.svg' 

import './Dashboard.css'
import './Header.css'

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleJoinWaitlist = (event) => {
    event.preventDefault();

    // Obtaining the current date as a timestamp
    const currentDate = new Date().toISOString();

    // Verifying if the email is valid
    if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        alert('Please enter a valid email');
        return;
    }

    // Sending data (email and date) to the Firebase database
    const waitlistRef = ref(database, 'waitlist/');
    const newRecord = {
        email: email,
        date: currentDate
    };

    push(waitlistRef, newRecord)
        .then((res) => {
            // Redirecting to the success page
            alert('Email registered to the waitlist successfully');
        })
        .catch((err) => {
            console.error(err);
            alert('Error joining the waitlist, try again');
        });
  };

  const displayJSON = (cardTitle) => {
    // Logic to generate JSON based on the selected card
    switch (cardTitle) {
      case 'Invoice':
        return JSON.stringify({
          date: '2023-11-27',
          seller: 'ABC Corporation',
          address: '123 Main St, City, Country',
          products: [
            { name: 'Product 1', price: 25.99, quantity: 2 },
            { name: 'Product 2', price: 14.5, quantity: 1 },
          ],
          totalAmount: 66.48,
          tax: 5.25,
          currency: 'USD',
        }, null, 2);

        case 'Financial':
            return JSON.stringify({
              companyName: 'XYZ Corp',
              revenue: 150000,
              expenses: 75000,
              profit: 75000,
              assets: 300000,
              liabilities: 100000,
              shareholdersEquity: 200000,
              currency: 'USD',
              financialDetails: {
                year: 2023,
                quarter: 'Q3',
                cashFlow: {
                  operatingActivities: 50000,
                  investingActivities: -20000,
                  financingActivities: -10000,
                },
                ratios: {
                  currentRatio: 2.5,
                  debtToEquityRatio: 0.5,
                  returnOnEquity: 0.375,
                  grossProfitMargin: 0.6,
                },
              },
            }, null, 2);
          

      case 'Medical':
        return JSON.stringify({
          patientName: 'John Doe',
          age: 35,
          bloodType: 'AB+',
          allergies: ['Peanuts', 'Penicillin'],
          diagnosis: 'Hypertension',
          medications: ['Medication A', 'Medication B'],
          doctor: 'Dr. Bell',
          hospital: 'City Hospital',
        }, null, 2);

      case 'Resume':
        return JSON.stringify({
          fullName: 'Alice Johnson',
          experience: [
            { company: 'Tech Solutions', position: 'Software Engineer', years: 4 },
            { company: 'Data Corp', position: 'Data Analyst', years: 2 },
            { company: 'Startup X', position: 'Intern', years: 1 },
          ],
          education: {
            degree: 'Bachelor of Science',
            major: 'Computer Science',
            university: 'ABC University',
            graduationYear: 2018,
          },
          skills: ['JavaScript', 'Python', 'SQL', 'React', 'Data Analysis'],
          certifications: ['AWS Certified Developer', 'Google Analytics Certification'],
        }, null, 2);

      default:
        return JSON.stringify({
            date: '2023-11-27',
            seller: 'ABC Corporation',
            address: '123 Main St, City, Country',
            products: [
              { name: 'Product 1', price: 25.99, quantity: 2 },
              { name: 'Product 2', price: 14.5, quantity: 1 },
            ],
            totalAmount: 66.48,
            tax: 5.25,
            currency: 'USD',
          }, null, 2);
    }
  };

  const handleCardSelection = (value) => {
    setSelectedCard(value);
    console.log(value)
  };

  return (
  <div className='Dashboard'>
    <div className='container'>
        <header class="Header">
          <img src={logo_bn} class='brand'/>
          <nav>
            <ul>
              <li><a onClick={()=>navigate('/login')}>Login</a></li>
            </ul>
          </nav>
        </header>
        <div className="first-block">
            <div className="left-panel">
                <div className="logo">
                {/* Replace with your actual logo image */}
                </div>
                <h1 className="header">Unlock the power of your Documents Data</h1>
                <p className="description">
                • Save endless hours of data entry.
                <br/>
                <br/>
                • Empower your business decisions with enriched data.
                <br/>
                <br/>
                • Extract valuable insights from documents and convert them into actionable JSON, SQL or CSV. 
                </p>
                <div className="input-group">
                <input type="email" placeholder="Email" onChange={handleInputChange}/>
                <button onClick={handleJoinWaitlist}>Join Waitlist</button>
                </div>
            </div>
            <div className="right-panel">
              <h1>Examples</h1>
                <select className="select-dropdown" onChange={(e) => handleCardSelection(e.target.value)}>
                    <option value="Invoice" selected>Invoice Extraction</option>
                    <option value="Financial">Financial Extraction</option>
                    <option value="Medical">Medical Extraction</option>
                    <option value="Resume">Resume Extraction</option>
                </select>
                <div className="code-mockup">
                    <pre>
                        {displayJSON(selectedCard)}
                    </pre>
                </div>
            </div>

        </div>
        <div className="card-container">
          <div className="card" onClick={() => setSelectedCard('Invoice')}>
            <h2 className="card-title">Invoice</h2>
            <p className="card-description">
              Streamline invoice data entry effortlessly and make it 10X faster.
            </p>
          </div>

          <div className="card" onClick={() => setSelectedCard('Financial')}>
            <h2 className="card-title">Financial Report</h2>
            <p className="card-description">
              Extract valuable insights from financial reports efficiently.
            </p>
          </div>

          <div className="card" onClick={() => setSelectedCard('Medical')}>
            <h2 className="card-title">Medical Record</h2>
            <p className="card-description">
              Maintain comprehensive patient records without hassle.
            </p>
          </div>

          <div className="card" onClick={() => setSelectedCard('Resume')}>
            <h2 className="card-title">Resume</h2>
            <p className="card-description">
              Swiftly categorize candidates for quicker assessments.
            </p>
          </div>
        </div>
      </div>
    </div>  
  );
};

export default Dashboard;
