import React, { useState } from 'react';
import StepOne from '@/components/StepOne';
import StepTwo from '@/components/StepTwo';
import StepThree from '@/components/StepThree';

const FormContainer = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    timezone: '',
    email: '',
    language: '',
    sentences: [""],
  });

  const goNext = () => setStepIndex((prev) => Math.min(prev + 1, 2));
  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const steps = [
    <StepOne onNext={goNext} onBack={goBack} />,
    <StepTwo formData={formData} setFormData={setFormData} onNext={goNext} onBack={goBack} />,
    <StepThree formData={formData} setFormData={setFormData} onBack={goBack}  onNext={() => {}} />,
  ];

  return steps[stepIndex];
};

export default FormContainer;