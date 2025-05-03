export type NavAction = "up" | "down" | "left" | "right" | "action" | "none";

export type FormData = {
  name: string;
  timezone: string;
  email: string;
  language: string;
  sentences: string[];
};

export type NavigationProps = {
  onNext: () => void;
  onBack: () => void;
};

export type StepTwoProps = NavigationProps & {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

export type StepThreeProps = NavigationProps & {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};
