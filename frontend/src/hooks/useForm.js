import { useState, useCallback } from 'react';

const useForm = (initialValues, validations = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    if (validations[name]) {
      return validations[name](value);
    }
    return null;
  }, [validations]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(validations).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validations, validateField]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, [validateField]);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  const handleSubmit = useCallback(
    (onSubmit) =>
      async (e) => {
        if (e) {
          e.preventDefault();
        }
        setIsSubmitting(true);
        if (validateForm()) {
          try {
            await onSubmit();
          } catch (error) {
            console.error('Form submission error:', error);
          }
        }
        setIsSubmitting(false);
      },
    [validateForm]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValues,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit,
    resetForm,
    validateForm,
  };
};

export default useForm;
