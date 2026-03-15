import React from 'react'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'

function InterviewReport() {

  const [step, setStep] = React.useState(1);
  const [interviewData, setInterviewData] = React.useState(null);
  const [report, setReport] = React.useState(null);

  return (
    <div className='min-h-screen bg-gray-50'>

{step === 1 && (
  <Step1SetUp
    onStart={(data) => {
      setInterviewData(data);
      setStep(2); // This must be INSIDE the curly braces of the onStart function
    }}
  />
)}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            setReport(report);
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <Step3Report report={report} />
      )}

    </div>
  )
}

export default InterviewReport;